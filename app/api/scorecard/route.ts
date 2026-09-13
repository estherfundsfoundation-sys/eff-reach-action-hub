const SCORECARD_URL = "https://api.data.gov/ed/collegescorecard/v1/schools";

function cleanQuery(value: string | null) {
  return (value || "").replace(/[^a-zA-Z0-9&'().,\-\s]/g, "").trim().slice(0, 120);
}

export async function GET(request: Request) {
  const query = cleanQuery(new URL(request.url).searchParams.get("q"));
  if (query.length < 3) return Response.json({ error: "Enter at least three letters of the school name." }, { status: 400 });

  const apiKey = process.env.SCORECARD_API_KEY || "DEMO_KEY";
  const params = new URLSearchParams({
    api_key: apiKey,
    "school.name": query,
    fields: "id,school.name,school.state,latest.cost.avg_net_price.overall,latest.cost.tuition.in_state,latest.cost.tuition.out_of_state,latest.aid.pell_grant_rate",
    per_page: "8",
  });

  try {
    const response = await fetch(`${SCORECARD_URL}?${params.toString()}`, { headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error(`Scorecard returned ${response.status}`);
    const payload = await response.json() as { results?: Record<string, unknown>[] };
    const results = (payload.results || []).slice(0, 8).map((school) => ({
      id: Number(school.id),
      name: String(school["school.name"] || "Unknown institution"),
      state: String(school["school.state"] || ""),
      netPrice: typeof school["latest.cost.avg_net_price.overall"] === "number" ? school["latest.cost.avg_net_price.overall"] : null,
      tuitionInState: typeof school["latest.cost.tuition.in_state"] === "number" ? school["latest.cost.tuition.in_state"] : null,
      tuitionOutOfState: typeof school["latest.cost.tuition.out_of_state"] === "number" ? school["latest.cost.tuition.out_of_state"] : null,
      pellRate: typeof school["latest.aid.pell_grant_rate"] === "number" ? school["latest.aid.pell_grant_rate"] : null,
    }));
    return Response.json({ results }, { headers: { "Cache-Control": "public, max-age=3600" } });
  } catch {
    return Response.json({ error: "Official College Scorecard data is temporarily unavailable." }, { status: 503 });
  }
}
