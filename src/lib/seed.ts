import type { Rows, Status } from "./types";

/**
 * Demo data: the product backlog for the new Dunder Mifflin Infinity website.
 * Dates are expressed relative to "now" so the demo always looks alive.
 */

type C = [person: string, body: string, emoji?: string];
type U = {
  by: string;
  status: Status;
  ago: number;
  body: string;
  shots?: string[];
  comments?: C[];
};
type N = {
  id: string;
  title: string;
  description: string;
  status: Status;
  tag: string;
  people: string[];
  pr?: number;
  proto?: boolean;
  due?: number;
  shots?: string[];
  updates: U[];
};

const LEGACY = "/shots/dunder-legacy.jpg";
const HOLDING = "/shots/under-construction.jpg";

const PEOPLE: Rows["people"] = [
  {
    id: "michael",
    name: "Michael",
    bio: "Regional Manager. Owns the vision for Infinity 2.0 and approves every headline",
    github: "@michaelscarn",
    avatar: "/people/michael.jpg",
    away: null,
    sort: 0,
  },
  {
    id: "jim",
    name: "Jim",
    bio: "Front-end. Building the new homepage, 14 PRs this month",
    github: "@jimm3",
    avatar: "/people/jim.jpg",
    away: "In vacation 8-10 December",
    sort: 1,
  },
  {
    id: "angela",
    name: "Angela",
    bio: "QA and compliance. Nothing ships with a typo or a broken redirect",
    github: "@angela-m",
    avatar: "/people/angela.jpg",
    away: null,
    sort: 2,
  },
  {
    id: "dwight",
    name: "Dwight",
    bio: "Back-end, security and beet-grade infrastructure. Checkout is a fortress",
    github: "@dkschrute",
    avatar: "/people/dwight.jpg",
    away: null,
    sort: 3,
  },
  {
    id: "creed",
    name: "Creed",
    bio: "Quality assurance. Tests the site on browsers nobody else has heard of",
    github: "@creedthoughts",
    avatar: "/people/creed.jpg",
    away: "Away Friday, don't ask",
    sort: 4,
  },
  {
    id: "pam",
    name: "Pam",
    bio: "Design lead. Logo, type, and every screen of the new Infinity",
    github: "@pambeesly",
    avatar: "/people/pam.jpg",
    away: null,
    sort: 5,
  },
];

const NOTES: N[] = [
  {
    id: "homepage-hero",
    title: "Build the homepage hero",
    description: "New hero with the “Limitless paper” headline, primary nav and the quote request button",
    status: "cooking",
    tag: "Dev",
    people: ["jim", "pam"],
    pr: 12,
    proto: true,
    due: 0,
    shots: ["mock:home", "mock:wire", LEGACY],
    updates: [
      {
        by: "jim",
        status: "cooking",
        ago: 0,
        body: "Hero is responsive down to 360px. Nav collapses into the new drawer, still missing the hover states from Pam's file",
        shots: ["mock:home", "mock:mobile", "mock:code"],
        comments: [
          ["pam", "Hover states are in the proto", "✅"],
          ["michael", "Bigger logo", "👍"],
        ],
      },
      {
        by: "pam",
        status: "cooking",
        ago: 2,
        body: "Final hero comp is ready. Headline sits on two lines, product shot bleeds off the right edge",
        shots: ["mock:home"],
        comments: [["jim", "On it", "👍"]],
      },
      {
        by: "jim",
        status: "next",
        ago: 6,
        body: "Scaffolded the page with the token set, waiting for the final hero comp before going further",
      },
    ],
  },
  {
    id: "paper-catalogue",
    title: "Paper catalogue with filters",
    description: "Browse by weight, size, finish and colour. 240 products, instant filtering, no page reload",
    status: "cooking",
    tag: "Dev",
    people: ["jim", "dwight"],
    pr: 15,
    proto: true,
    due: 2,
    shots: ["mock:catalogue", "mock:table", "mock:wire"],
    updates: [
      {
        by: "dwight",
        status: "cooking",
        ago: 0,
        body: "Product API returns the full catalogue in 80ms. Filters are computed server side, facets come back with counts",
        shots: ["mock:code", "mock:table"],
        comments: [
          ["jim", "API is fast", "🔥"],
          ["angela", "Cardstock is missing"],
        ],
      },
      {
        by: "jim",
        status: "cooking",
        ago: 3,
        body: "Grid and filter rail are in. Using the legacy product photos until the new shoot lands",
        shots: ["mock:catalogue"],
      },
    ],
  },
  {
    id: "mobile-nav",
    title: "Mobile navigation",
    description: "Drawer navigation with search on top and the branch finder one tap away",
    status: "testing",
    tag: "Design",
    people: ["pam", "jim"],
    pr: 19,
    proto: true,
    due: 1,
    shots: ["mock:mobile", "mock:wire"],
    updates: [
      {
        by: "jim",
        status: "testing",
        ago: 1,
        body: "Drawer is on staging. Focus is trapped while open and it closes on route change",
        shots: ["mock:mobile"],
        comments: [
          ["creed", "Works on my BlackBerry", "✅"],
          ["angela", "Back button closes it", "👍"],
        ],
      },
      {
        by: "pam",
        status: "cooking",
        ago: 5,
        body: "Three directions for the drawer. Going with the full height sheet, it leaves room for the branch finder",
        shots: ["mock:mobile", "mock:wire"],
      },
    ],
  },
  {
    id: "checkout",
    title: "Cart and checkout flow",
    description: "Three steps: cart, delivery, payment. Guest checkout first, account creation after the order",
    status: "cooking",
    tag: "Dev",
    people: ["dwight", "jim"],
    pr: 18,
    proto: true,
    due: 6,
    shots: ["mock:cart", "mock:wire", "mock:code"],
    updates: [
      {
        by: "dwight",
        status: "cooking",
        ago: 1,
        body: "Payment provider is wired in test mode. Orders are written before the charge so nothing gets lost on a timeout",
        shots: ["mock:cart", "mock:code"],
        comments: [
          ["michael", "Can we add a golden ticket?", "🎟️"],
          ["dwight", "No"],
          ["jim", "Guest checkout works", "✅"],
        ],
      },
      {
        by: "jim",
        status: "cooking",
        ago: 4,
        body: "Cart drawer and the delivery step are built against mocked data",
      },
    ],
  },
  {
    id: "product-page",
    title: "Product page design",
    description: "One template for every ream: specs, bulk pricing table, and a sample request",
    status: "testing",
    tag: "Design",
    people: ["pam"],
    proto: true,
    due: 1,
    shots: ["mock:product", "mock:type"],
    updates: [
      {
        by: "pam",
        status: "testing",
        ago: 1,
        body: "Proto is out for review. Bulk pricing moved above the fold after the sales team feedback",
        shots: ["mock:product", "mock:table"],
        comments: [
          ["jim", "Pricing table is clear", "👍"],
          ["dwight", "Add beet stock"],
        ],
      },
    ],
  },
  {
    id: "logo-refresh",
    title: "Refresh the Dunder Mifflin logo",
    description: "Same wordmark, redrawn. Tighter spacing, a cleaner infinity mark and a version that works at 16px",
    status: "testing",
    tag: "Design",
    people: ["pam", "michael"],
    proto: true,
    due: 2,
    shots: ["mock:logo", "mock:palette"],
    updates: [
      {
        by: "pam",
        status: "testing",
        ago: 2,
        body: "Three lockups to test: horizontal, stacked and the infinity mark alone for the favicon",
        shots: ["mock:logo", "mock:palette"],
        comments: [
          ["michael", "Make it pop", "✨"],
          ["angela", "Stacked one is tidy", "✅"],
        ],
      },
      {
        by: "pam",
        status: "cooking",
        ago: 8,
        body: "Redrew the wordmark from the 1992 letterhead. Kerning was all over the place",
      },
    ],
  },
  {
    id: "homepage-copy",
    title: "Homepage copy and tone of voice",
    description: "Headline, three value props and the footer. Plain words, short sentences, no “synergy”",
    status: "testing",
    tag: "Content",
    people: ["michael", "angela"],
    due: 0,
    shots: ["mock:doc", "mock:type"],
    updates: [
      {
        by: "angela",
        status: "testing",
        ago: 0,
        body: "Proofread pass done. Removed four exclamation marks and one reference to a movie",
        shots: ["mock:doc"],
        comments: [
          ["michael", "That was the best line"],
          ["pam", "Reads well now", "👍"],
        ],
      },
      {
        by: "michael",
        status: "cooking",
        ago: 3,
        body: "First draft of the headline: “Limitless paper in a paperless world”. Ready for review",
      },
    ],
  },
  {
    id: "performance",
    title: "Performance budget",
    description: "LCP under 2 seconds on 4G, less than 120kb of JavaScript on the homepage",
    status: "testing",
    tag: "Dev",
    people: ["jim", "dwight"],
    pr: 24,
    due: 5,
    shots: ["mock:chart", "mock:code"],
    updates: [
      {
        by: "jim",
        status: "testing",
        ago: 1,
        body: "Homepage is at 1.6s LCP and 94kb of JS. Budget check now runs on every pull request",
        shots: ["mock:chart"],
        comments: [
          ["dwight", "Unacceptable. Make it 1.2s"],
          ["michael", "Fast", "🚀"],
        ],
      },
    ],
  },
  {
    id: "seo-redirects",
    title: "SEO redirects from the old site",
    description: "Map 412 legacy URLs to their new home so we keep 15 years of rankings",
    status: "cooking",
    tag: "SEO",
    people: ["angela", "dwight"],
    pr: 22,
    due: 7,
    shots: ["mock:table", "mock:sitemap"],
    updates: [
      {
        by: "angela",
        status: "cooking",
        ago: 2,
        body: "Spreadsheet is complete: 412 URLs, 380 mapped one to one, 32 go to the closest category",
        shots: ["mock:table"],
        comments: [
          ["dwight", "Importing tonight", "👍"],
          ["creed", "Keep /creedthoughts"],
        ],
      },
    ],
  },
  {
    id: "branch-pages",
    title: "Branch pages, Scranton first",
    description: "One page per branch with the team, opening hours and a direct line to sales",
    status: "cooking",
    tag: "Content",
    people: ["michael", "pam"],
    proto: true,
    due: 8,
    shots: ["mock:branch", "mock:wire"],
    updates: [
      {
        by: "michael",
        status: "cooking",
        ago: 2,
        body: "Wrote the Scranton page. It is the best branch so it gets the longest page",
        shots: ["mock:branch"],
        comments: [
          ["pam", "Trimmed to 200 words", "✂️"],
          ["dwight", "Add my title"],
        ],
      },
    ],
  },
  {
    id: "cms",
    title: "CMS for branch pages",
    description: "Let each branch edit its own page without a deploy. Drafts, preview and one approval step",
    status: "cooking",
    tag: "Dev",
    people: ["dwight"],
    pr: 21,
    due: 9,
    shots: ["mock:code", "mock:table"],
    updates: [
      {
        by: "dwight",
        status: "cooking",
        ago: 3,
        body: "Content model is defined: branch, person, opening hours. Preview links work on staging",
        shots: ["mock:code"],
        comments: [["michael", "I approve everything", "👍"]],
      },
    ],
  },
  {
    id: "security-review",
    title: "Security review and pen test",
    description: "Threat model for checkout and accounts, dependency audit, external pen test before launch",
    status: "cooking",
    tag: "QA",
    people: ["dwight", "angela"],
    due: 12,
    shots: ["mock:table", "mock:code"],
    updates: [
      {
        by: "dwight",
        status: "cooking",
        ago: 4,
        body: "Threat model is written. Identity theft is not a joke, rate limiting goes in before the pen test",
        comments: [
          ["jim", "Millions of families suffer", "😐"],
          ["angela", "Audit is clean", "✅"],
        ],
      },
    ],
  },
  {
    id: "cross-browser-qa",
    title: "Cross-browser QA plan",
    description: "Test matrix for the launch: 6 browsers, 4 screen sizes, 22 critical paths",
    status: "cooking",
    tag: "QA",
    people: ["angela", "creed"],
    due: 13,
    shots: ["mock:table"],
    updates: [
      {
        by: "angela",
        status: "cooking",
        ago: 1,
        body: "Matrix is ready. Creed owns the devices nobody else can find",
        shots: ["mock:table"],
        comments: [["creed", "Tested on a fridge", "✅"]],
      },
    ],
  },
  {
    id: "design-tokens",
    title: "Colour and type tokens",
    description: "Dunder blue, paper white and a type scale shared between Sketch and the codebase",
    status: "shipped",
    tag: "Design",
    people: ["pam", "jim"],
    pr: 7,
    due: -6,
    shots: ["mock:palette", "mock:type"],
    updates: [
      {
        by: "jim",
        status: "shipped",
        ago: 6,
        body: "Tokens are merged and published. Every colour in the app now comes from one file",
        shots: ["mock:palette", "mock:type", "mock:code"],
        comments: [["pam", "Matches the file", "✅"]],
      },
      {
        by: "pam",
        status: "testing",
        ago: 9,
        body: "Palette checked for contrast. Dunder blue on paper white passes AA at every size",
      },
    ],
  },
  {
    id: "homepage-wireframes",
    title: "Homepage wireframes",
    description: "Low fidelity layout for the homepage: hero, categories, bulk orders and the branch finder",
    status: "shipped",
    tag: "Design",
    people: ["pam"],
    proto: true,
    due: -9,
    shots: ["mock:wire", "mock:sitemap"],
    updates: [
      {
        by: "pam",
        status: "shipped",
        ago: 9,
        body: "Wireframes are signed off. Bulk orders moved up, the newsletter moved to the footer",
        shots: ["mock:wire"],
        comments: [
          ["michael", "Where is my photo?"],
          ["jim", "Clear to build", "👍"],
        ],
      },
    ],
  },
  {
    id: "sitemap",
    title: "Sitemap and information architecture",
    description: "From 140 pages down to 38. Five top level sections, nothing deeper than three clicks",
    status: "shipped",
    tag: "Product",
    people: ["pam", "michael"],
    proto: true,
    due: -12,
    shots: ["mock:sitemap", "mock:doc"],
    updates: [
      {
        by: "pam",
        status: "shipped",
        ago: 12,
        body: "Sitemap is final. Card sorting with six customers confirmed the five sections",
        shots: ["mock:sitemap"],
        comments: [["angela", "Finally tidy", "✅"]],
      },
    ],
  },
  {
    id: "holding-page",
    title: "Under construction holding page",
    description: "Temporary page on the new domain while we build. Logo, launch date and a contact email",
    status: "shipped",
    tag: "Dev",
    people: ["jim", "creed"],
    pr: 3,
    due: -14,
    shots: [HOLDING, LEGACY],
    updates: [
      {
        by: "jim",
        status: "shipped",
        ago: 14,
        body: "Holding page is live. Coming Christmas, as promised",
        shots: [HOLDING],
        comments: [
          ["creed", "I drew the guy", "✏️"],
          ["michael", "Love the hat", "🎅"],
        ],
      },
    ],
  },
  {
    id: "legacy-audit",
    title: "Audit the legacy website",
    description: "What to keep, what to rewrite and what to quietly delete from the 2007 site",
    status: "shipped",
    tag: "Product",
    people: ["angela", "pam"],
    due: -16,
    shots: [LEGACY, "mock:table"],
    updates: [
      {
        by: "angela",
        status: "shipped",
        ago: 16,
        body: "Audit is done. 140 pages reviewed, 61 to delete, 9 still mention fax ordering",
        shots: [LEGACY, "mock:table"],
        comments: [
          ["michael", "Keep the party page"],
          ["pam", "Screens archived", "✅"],
        ],
      },
    ],
  },
  {
    id: "vision",
    title: "Infinity 2.0 vision and goals",
    description: "Why we rebuild: double online orders in a year and make reordering take under a minute",
    status: "shipped",
    tag: "Product",
    people: ["michael", "jim"],
    due: -20,
    shots: ["mock:doc", "mock:chart"],
    updates: [
      {
        by: "michael",
        status: "shipped",
        ago: 20,
        body: "Vision is approved by corporate. Two goals, one page, zero buzzwords after Jim's edit",
        shots: ["mock:doc"],
        comments: [["jim", "Cut 11 pages", "✂️"]],
      },
    ],
  },
  {
    id: "accounts",
    title: "Customer accounts and reorder",
    description: "Sign in, see past orders and reorder the same pallet in one click",
    status: "next",
    tag: "Dev",
    people: ["dwight", "jim"],
    due: 14,
    updates: [
      {
        by: "dwight",
        status: "next",
        ago: 3,
        body: "Scoped: email sign in with a magic link, order history, one click reorder. Starts after checkout ships",
        comments: [["jim", "Magic link is enough", "👍"]],
      },
    ],
  },
  {
    id: "site-search",
    title: "Site search",
    description: "Search products by name, weight or SKU with typo tolerance",
    status: "next",
    tag: "Dev",
    people: ["dwight"],
    due: 15,
    updates: [
      {
        by: "dwight",
        status: "next",
        ago: 5,
        body: "Postgres full text search is enough for 240 products. No extra service to run",
      },
    ],
  },
  {
    id: "team-photos",
    title: "Team photos for the About page",
    description: "New portraits of every branch team, shot in the office with natural light",
    status: "next",
    tag: "Content",
    people: ["pam", "creed"],
    due: 10,
    updates: [
      {
        by: "pam",
        status: "next",
        ago: 4,
        body: "Shoot is booked for next Thursday. Blue shirts please, no costumes",
        comments: [
          ["creed", "Which me?", "🤔"],
          ["michael", "I need two hours"],
        ],
      },
    ],
  },
  {
    id: "accessibility",
    title: "Accessibility pass",
    description: "WCAG AA across the site: keyboard paths, contrast, alt text and form errors",
    status: "next",
    tag: "QA",
    people: ["angela", "pam"],
    due: 16,
    updates: [
      {
        by: "angela",
        status: "next",
        ago: 2,
        body: "Checklist prepared with 46 points. Starts when the catalogue is on staging",
      },
    ],
  },
  {
    id: "analytics",
    title: "Analytics and conversion tracking",
    description: "Cookieless analytics, one funnel from homepage to paid order",
    status: "next",
    tag: "Dev",
    people: ["dwight", "michael"],
    due: 17,
    updates: [
      {
        by: "dwight",
        status: "next",
        ago: 6,
        body: "Five events are enough: view product, add to cart, start checkout, pay, reorder",
        comments: [["michael", "Track my blog too"]],
      },
    ],
  },
  {
    id: "live-chat",
    title: "Live chat with sales",
    description: "Talk to a real salesperson from any product page during opening hours",
    status: "next",
    tag: "Product",
    people: ["michael", "jim"],
    due: 20,
    updates: [
      {
        by: "michael",
        status: "next",
        ago: 7,
        body: "Customers want a human, that is our whole advantage. Chat goes to the sales floor, not to a bot",
        comments: [
          ["jim", "After launch", "👍"],
          ["dwight", "Route them to me"],
        ],
      },
    ],
  },
  {
    id: "launch",
    title: "Go-live checklist and launch party",
    description: "DNS switch, redirects on, monitoring on, then cake in the conference room",
    status: "next",
    tag: "Product",
    people: ["michael", "angela"],
    due: 23,
    updates: [
      {
        by: "angela",
        status: "next",
        ago: 1,
        body: "Checklist drafted with 31 steps and an owner for each. The party planning committee handles the rest",
        comments: [["michael", "I'll DJ", "🎧"]],
      },
    ],
  },
];

const DAY = 86_400_000;

export function buildSeed(now: number = Date.now()): Rows {
  const rows: Rows = {
    people: PEOPLE,
    notes: [],
    notePeople: [],
    updates: [],
    comments: [],
  };

  NOTES.forEach((n, ni) => {
    const first = Math.max(...n.updates.map((u) => u.ago));
    rows.notes.push({
      id: n.id,
      title: n.title,
      description: n.description,
      status: n.status,
      tag: n.tag,
      pr: n.pr ?? null,
      proto: n.proto ?? false,
      due: n.due === undefined ? null : new Date(now + n.due * DAY).toISOString().slice(0, 10),
      shots: n.shots ?? [],
      createdAt: now - first * DAY - 3_600_000,
    });
    n.people.forEach((p, i) => rows.notePeople.push({ noteId: n.id, personId: p, sort: i }));

    n.updates.forEach((u, ui) => {
      const id = `${n.id}-u${n.updates.length - ui}`;
      const createdAt = now - u.ago * DAY - (ni * 7 + 5) * 60_000;
      rows.updates.push({
        id,
        noteId: n.id,
        personId: u.by,
        status: u.status,
        body: u.body,
        shots: u.shots ?? [],
        createdAt,
      });
      (u.comments ?? []).forEach((c, ci) => {
        rows.comments.push({
          id: `${id}-c${ci + 1}`,
          updateId: id,
          personId: c[0],
          body: c[1],
          emoji: c[2] ?? null,
          createdAt: createdAt + Math.min((ci + 1) * 60_000, (ni * 7 + 4) * 60_000),
        });
      });
    });
  });

  return rows;
}
