export type Status = "next" | "cooking" | "testing" | "shipped";

export const STATUS_LABEL: Record<Status, string> = {
  next: "Up next",
  cooking: "Cooking",
  testing: "Testing",
  shipped: "Shipped",
};

export const TAGS = ["Product", "Design", "Dev", "Content", "QA", "SEO"] as const;
export type Tag = (typeof TAGS)[number];

/** The demo has no login: everything you post is posted as this person. */
export const ME = "michael";

export type Person = {
  id: string;
  name: string;
  bio: string;
  github: string;
  avatar: string;
  away: string | null;
  sort: number;
};

export type Comment = {
  id: string;
  updateId: string;
  personId: string;
  body: string;
  emoji: string | null;
  createdAt: number;
};

export type Update = {
  id: string;
  noteId: string;
  personId: string;
  status: Status;
  body: string;
  shots: string[];
  createdAt: number;
  comments: Comment[];
};

export type Note = {
  id: string;
  title: string;
  description: string;
  status: Status;
  tag: string;
  pr: number | null;
  proto: boolean;
  due: string | null;
  shots: string[];
  createdAt: number;
  updatedAt: number;
  peopleIds: string[];
  updates: Update[];
  commentCount: number;
};

export type Data = { people: Person[]; notes: Note[] };

/** Flat rows, the shape stored in Postgres and produced by the seed. */
export type Rows = {
  people: Person[];
  notes: Omit<Note, "peopleIds" | "updates" | "commentCount" | "updatedAt">[];
  notePeople: { noteId: string; personId: string; sort: number }[];
  updates: Omit<Update, "comments">[];
  comments: Comment[];
};
