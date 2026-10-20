/* Sponsor REACH: the words of the sponsor page (20 Oct 2026, Shayna: "a page just for sponsors … instead of a
   PDF or a PowerPoint … the videos, all that good stuff … what's in it for them"). Everything a sponsor can fund
   exists on REACH today; nothing has a price on it, because each sponsorship is set with EFF in writing.
   The note lands in MyEFF → National → Strategy → Partners through eff_partner_interest (area "sponsor"). */

// What a sponsor can put their name behind. `idea` is what rides into the form (80 characters or fewer).
export const FUND = [
  { key: "tour", h: "A stop on REACH on Tour", p: "EFF in person on a college campus: a REACH workshop, a REACH talk and resources students can take home. Your support helps bring a stop to a school that couldn't host one alone.", idea: "Sponsor a REACH on Tour stop" },
  { key: "workshop", h: "REACH Workshops", p: "Interactive workshops students run from their phones: money, mental health, staying enrolled, careers, Apply With Me Night. Your name opens the workshop on the big screen.", idea: "Sponsor REACH Workshops" },
  { key: "emergency", h: "Emergency help and scholarships", p: "The fund behind EFF's emergency grants and scholarships, for the moment a student almost walks away over one bill.", idea: "Support emergency help and scholarships" },
  { key: "care", h: "Care packages and drives", p: "Hygiene kits, groceries and midterm and finals supplies for students on campus, handed out at tour stops and by Campus Ambassadors.", idea: "Sponsor care packages and drive supplies" },
  { key: "freebie", h: "Freebie Monday", p: "A weekly giveaway that meets students in the middle of the semester and sends them to REACH's free money and student deals.", idea: "Sponsor a Freebie Monday" },
  { key: "free", h: "Keep REACH free", p: "Scholarships checked every morning, the Survival Kit, REACH Emergency, Get Help, the interview coach. Free for every student, always. Operating support keeps it that way.", idea: "Keep REACH free for students" },
];

// What's in it for them. Every item is something REACH can actually do; the exact recognition is set in writing.
export const FOR_YOU = [
  { h: "Your name where students are", p: "On the opening screen of a REACH Workshop (\"in partnership with\"), on a tour stop's graphics, or on a Freebie Monday post, depending on what you sponsor." },
  { h: "Recognized on REACH and EFF", p: "Named on this page and on Esther Funds Foundation's website and social media, with your permission." },
  { h: "Your team on the ground", p: "Employee volunteers at a tour stop, packing care packages, or leading a workshop on what your people know best: money, careers, wellness." },
  { h: "Impact you can report", p: "Totals after every sponsorship: workshops held, students reached, items given, campuses visited. Never a student's name or data." },
  { h: "A real 501(c)(3) partner", p: "Esther Funds Foundation is a 501(c)(3) nonprofit, EIN 93-4917509. Gifts are tax-deductible as the law allows, and you get a written acknowledgment for every one." },
  { h: "A cause students feel", p: "First-generation, low-income and minority college students, many at HBCUs and in the South, the ones closest to not finishing." },
];

// What sponsors never get. This is what makes REACH worth trusting, for students and for sponsors.
export const PROMISES = [
  "Student data is never shared or sold. Not to sponsors, not to anyone.",
  "Sponsors never buy a place in Freebies or in scholarship listings. Those stay honest.",
  "No ads on crisis or emergency pages. 988 stays on every page.",
  "Every gift is recorded in EFF's books and reported back to you.",
];

// The old partner site's four pathways, word for word.
export const PATHWAYS = [
  { h: "Mission Partner", p: "Broad support for EFF's student-centered mission and national reach." },
  { h: "Program Partner", p: "Support a defined initiative, workshop series, resource, or care-package effort." },
  { h: "Community Partner", p: "Contribute volunteers, expertise, services, products, space, or audience reach." },
  { h: "Custom Partner", p: "Co-design a partnership aligned with your organization's goals and EFF's charitable mission." },
];

export const ORG_TYPES: [string, string][] = [
  ["business", "Business or corporation"], ["nonprofit", "Nonprofit or foundation"], ["faith", "Faith community"],
  ["greek", "Greek-letter organization"], ["college", "College or university"], ["professional", "Professional association"],
  ["individual", "Individual or family"], ["other", "Other"],
];

export const CONTRIBUTIONS: [string, string][] = [
  ["financial", "Financial sponsorship"], ["products", "Products, space or services"], ["time", "Volunteers or time"],
  ["expertise", "Professional expertise"], ["reach", "Audience or media reach"], ["combination", "A combination"], ["not_sure", "Not sure yet"],
];

// Facts, each from its source (checked 20 Oct 2026; the same as REACH for Campuses).
export const FACTS = [
  { big: "43.1 million", line: "people in the U.S. started college and stopped out without a credential.", src: "National Student Clearinghouse Research Center, Some College, No Credential (June 2025)", url: "https://nscresearchcenter.org/some-college-no-credential/" },
  { big: "59%", line: "of college students face food or housing insecurity.", src: "The Hope Center, 2023–2024 Student Basic Needs Survey", url: "https://hope.temple.edu/2023-2024-student-basic-needs-survey-report" },
  { big: "Nearly 3 in 4", line: "Black and Indigenous students face food or housing insecurity.", src: "The Hope Center, 2023–2024 Student Basic Needs Survey", url: "https://hope.temple.edu/2023-2024-student-basic-needs-survey-report" },
  { big: "$22,950+", line: "given by EFF straight to college students in scholarships and emergency support since 2025.", src: "Esther Funds Foundation, September 19, 2026", url: "https://instagram.com/p/DdeTAaYxpiL/" },
];
