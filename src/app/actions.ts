"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ME_COOKIE,
  getData,
  getMeId,
  insertComment,
  insertNote,
  insertUpdate,
  markRead,
  updateNote,
} from "@/lib/db";
import { splitEmoji } from "@/lib/format";
import { STATUS_LABEL, TAGS, type Status } from "@/lib/types";

const text = (form: FormData, key: string, max: number) =>
  String(form.get(key) ?? "").trim().slice(0, max);

const status = (form: FormData): Status => {
  const s = String(form.get("status") ?? "");
  return s in STATUS_LABEL ? (s as Status) : "next";
};

const day = (form: FormData) => {
  const due = text(form, "due", 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(due) ? due : null;
};

const tag = (form: FormData) => {
  const t = text(form, "tag", 24);
  return (TAGS as readonly string[]).includes(t) ? t : "Product";
};

/** Only http(s) links are kept; a bare "github.com/..." gets https:// in front. */
const link = (form: FormData, key: string) => {
  const raw = text(form, key, 500);
  if (!raw) return null;
  try {
    const u = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
    return u.protocol === "http:" || u.protocol === "https:" ? u.toString() : null;
  } catch {
    return null;
  }
};

async function picked(form: FormData) {
  const { people } = await getData();
  const known = new Set(people.map((p) => p.id));
  return [...new Set(form.getAll("people").map(String))].filter((p) => known.has(p));
}

export async function createNote(form: FormData) {
  const title = text(form, "title", 120);
  if (!title) return;
  const me = await getMeId();
  const people = await picked(form);

  const id = await insertNote({
    title,
    description: text(form, "description", 280),
    status: status(form),
    tag: tag(form),
    due: day(form),
    people: people.length ? people : [me],
    by: me,
  });

  revalidatePath("/", "layout");
  redirect(`/notes/${id}`);
}

export async function saveNote(form: FormData) {
  const noteId = text(form, "noteId", 80);
  if (!noteId) return;
  await updateNote({
    noteId,
    by: await getMeId(),
    prUrl: link(form, "prUrl"),
    protoUrl: link(form, "protoUrl"),
    due: day(form),
    tag: tag(form),
    people: await picked(form),
  });
  revalidatePath("/", "layout");
}

export async function postUpdate(form: FormData) {
  const noteId = text(form, "noteId", 80);
  const body = text(form, "body", 600);
  if (!noteId || !body) return;
  await insertUpdate({ noteId, by: await getMeId(), status: status(form), body });
  revalidatePath("/", "layout");
}

export async function addComment(form: FormData) {
  const updateId = text(form, "updateId", 120);
  const raw = text(form, "body", 80);
  if (!updateId || !raw) return;
  const [body, emoji] = splitEmoji(raw);
  await insertComment({ updateId, by: await getMeId(), body, emoji });
  revalidatePath("/", "layout");
}

export async function markAllRead() {
  await markRead(await getMeId());
  revalidatePath("/", "layout");
}

/** Open a notification: mark it read, then go to its note. */
export async function openNotification(form: FormData) {
  const noteId = text(form, "noteId", 80);
  await markRead(await getMeId(), text(form, "id", 120));
  revalidatePath("/", "layout");
  redirect(`/notes/${noteId}`);
}

/** Demo only: use the app as someone else, to see what lands in their inbox. */
export async function becomePerson(form: FormData) {
  const { people } = await getData();
  const person = people.find((p) => p.id === text(form, "id", 40));
  if (!person) return;
  (await cookies()).set(ME_COOKIE, person.id, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
  revalidatePath("/", "layout");
}
