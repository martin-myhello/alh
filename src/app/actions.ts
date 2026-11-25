"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getData, insertComment, insertNote, insertUpdate } from "@/lib/db";
import { splitEmoji } from "@/lib/format";
import { ME, STATUS_LABEL, TAGS, type Status } from "@/lib/types";

const text = (form: FormData, key: string, max: number) =>
  String(form.get(key) ?? "").trim().slice(0, max);

const status = (form: FormData): Status => {
  const s = String(form.get("status") ?? "");
  return s in STATUS_LABEL ? (s as Status) : "next";
};

export async function createNote(form: FormData) {
  const title = text(form, "title", 120);
  if (!title) return;

  const { people } = await getData();
  const known = new Set(people.map((p) => p.id));
  const picked = form.getAll("people").map(String).filter((p) => known.has(p));
  const tag = text(form, "tag", 24);
  const due = text(form, "due", 10);

  const id = await insertNote({
    title,
    description: text(form, "description", 280),
    status: status(form),
    tag: (TAGS as readonly string[]).includes(tag) ? tag : "Product",
    due: /^\d{4}-\d{2}-\d{2}$/.test(due) ? due : null,
    people: picked.length ? picked : [ME],
    by: ME,
  });

  revalidatePath("/", "layout");
  redirect(`/notes/${id}`);
}

export async function postUpdate(form: FormData) {
  const noteId = text(form, "noteId", 80);
  const body = text(form, "body", 600);
  if (!noteId || !body) return;
  await insertUpdate({ noteId, by: ME, status: status(form), body });
  revalidatePath("/", "layout");
}

export async function addComment(form: FormData) {
  const updateId = text(form, "updateId", 120);
  const raw = text(form, "body", 80);
  if (!updateId || !raw) return;
  const [body, emoji] = splitEmoji(raw);
  await insertComment({ updateId, by: ME, body, emoji });
  revalidatePath("/", "layout");
}
