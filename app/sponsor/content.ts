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
  { key: "box", h: "REACH Boxes", p: "Care boxes of food, hygiene and school supplies for students who asked for help. New deliveries are paused while we strengthen fulfillment; sponsors are how they start rolling again, with your logo on every box.", idea: "Sponsor REACH Boxes" },
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

// REACH so far, each from EFF's own posts (the same list as the REACH home film, app/ReachFilm.tsx).
export const IMPACT = [
  { n: 1000, s: "+", t: "students reached out to REACH for support", post: "DYsIVIrJKHu" },
  { n: 325, s: "+", t: "colleges sent students' applications", post: "DYsIVIrJKHu" },
  { n: 300, s: "", t: "REACH Boxes in the first wave", post: "DZnxaMJJNlE" },
  { n: 257, s: "", t: "student ambassadors stepped up", post: "DaDws4NJCs6" },
  { n: 22, s: "", t: "states with REACH Ambassadors", post: "DaDws4NJCs6" },
  { n: 211, s: "", t: "students applied for a box their campus couldn't get to them", post: "DZVSJL_iQNH" },
];

// "You send your logo. We do all the work." (Shayna, 20 Oct 2026)
export const WE_DO = [
  { h: "You send your logo", p: "And your brand guidelines, if you have them. That's your part." },
  { h: "We design it", p: "Box labels, workshop screens, banners, posts. You approve every one before it goes anywhere." },
  { h: "We pack and travel", p: "EFF packs the boxes, loads the car and drives them to campus. You never ship a thing unless you want to." },
  { h: "Our chapters hand them out", p: "EFF's campus chapters and REACH Ambassadors put your brand in students' hands, face to face." },
  { h: "We film and post it", p: "Photos and video from the day, tagged and shared on EFF and REACH, ready for you to share too." },
  { h: "We report back", p: "Boxes given, students reached, campuses visited, with the photos. Never a student's name or data." },
];

/* Sponsorship tiers. Amounts are EFF's draft starting points (20 Oct 2026) for Shayna to confirm or change;
   every sponsorship is still set in writing. Change a tier here and nowhere else. */
export const TIERS = [
  { key: "spotlight", name: "Spotlight", price: "$250", lead: "Just your logo, front and center for a week.", gets: ["\"Made possible by\" on one Freebie Monday post and story", "Your logo on the post graphic", "Tagged by EFF and REACH"] },
  { key: "logo", name: "Logo Partner", price: "$500", lead: "Your logo where students are learning.", gets: ["Your logo on the opening screen of a REACH Workshop", "Listed on this page as a REACH partner", "A thank-you post on EFF's Instagram"] },
  { key: "box", name: "Box Partner", price: "$2,500", lead: "Your brand inside 100 REACH Boxes.", gets: ["Your logo on 100 REACH Boxes", "Your product or coupon card inside", "Packed, delivered and handed out by EFF", "Photos and video from the handout", "Everything in Logo Partner"], hot: true },
  { key: "tour", name: "Tour Partner", price: "$5,000", lead: "Present a REACH on Tour stop.", gets: ["\"Presented by\" on one tour stop: banner, screens, graphics", "REACH Boxes with your logo handed out that day", "Your team invited to volunteer", "A recap video you can use", "Everything in Box Partner"] },
  { key: "presenting", name: "Presenting Partner", price: "$15,000+", lead: "Stand beside REACH for the whole year.", gets: ["Your name on every REACH Workshop and tour stop for the year", "Your logo on every REACH Box shipped", "Quarterly impact reports", "A custom activation built with you", "First call on new REACH launches"] },
];

export const INKIND = [
  { h: "Put your products in the boxes", p: "Snacks, hygiene, school supplies, tech, gift cards: send what students need and we pack it with your logo on the card." },
  { h: "We carry it everywhere", p: "We travel it to campuses and our chapters hand it out, so your product reaches students in person, not in a mailbox." },
  { h: "We show it off", p: "Students opening your product on camera, posted and tagged. Real reactions from real students." },
];
