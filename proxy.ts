import { NextRequest, NextResponse } from "next/server";

const REACH_HOST = "reach.estherfundsfoundation.org";

export function proxy(request: NextRequest) {
  const hostname = request.headers.get("host")?.split(":")[0].toLowerCase();

  if (hostname?.endsWith(".chatgpt.site")) {
    const destination = request.nextUrl.clone();
    destination.protocol = "https:";
    destination.host = REACH_HOST;
    destination.port = "";
    return NextResponse.redirect(destination, 308);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
