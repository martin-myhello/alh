"use client";

import Link from "next/link";
import { useRef } from "react";
import { useFormStatus } from "react-dom";
import { saveNote } from "@/app/actions";
import { linkLabel } from "@/lib/format";
import { TAGS, type Note, type Person } from "@/lib/types";
import { Avatar } from "./bits";
import { Icon } from "./Icon";

function Save() {
  const { pending } = useFormStatus();
  return (
    <button className="btn" type="submit" disabled={pending}>
      Save
    </button>
  );
}

/** The line under a note's title. Everything on it is real: links open, the rest edits the note. */
export function NoteMeta({ note, people, due }: { note: Note; people: Person[]; due: string | null }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const map = new Map(people.map((p) => [p.id, p]));

  const edit = (field: string) => {
    dialog.current?.showModal();
    dialog.current?.querySelector<HTMLElement>(`[name="${field}"]`)?.focus();
  };

  return (
    <>
      <div className="note-meta">
        {note.prUrl ? (
          <a className="meta" href={note.prUrl} target="_blank" rel="noreferrer">
            <Icon name="pr" />
            {linkLabel(note.prUrl, "PR")}
          </a>
        ) : (
          <button className="meta add" onClick={() => edit("prUrl")}>
            <Icon name="pr" />
            Link a PR
          </button>
        )}
        {note.protoUrl ? (
          <a className="meta" href={note.protoUrl} target="_blank" rel="noreferrer">
            <Icon name="play" />
            Proto
          </a>
        ) : (
          <button className="meta add" onClick={() => edit("protoUrl")}>
            <Icon name="play" />
            Link a proto
          </button>
        )}
        <button className={`meta${due ? "" : " add"}`} onClick={() => edit("due")} title="Change the ship day">
          <Icon name="timeline" />
          {due ?? "Set a day"}
        </button>
        <span className="on">
          <span className="avatars">
            {note.peopleIds.map((p) => (
              <Link key={p} href={`/people/${p}`}>
                <Avatar person={map.get(p)} />
              </Link>
            ))}
          </span>
          <button className={note.peopleIds.length ? "" : "add"} onClick={() => edit("people")} title="Change who is on it">
            {note.peopleIds.length ? "on it" : "Nobody on it"}
          </button>
        </span>
        <button className="meta" onClick={() => edit("tag")} title="Change the tag">
          <Icon name="tag" />
          {note.tag}
        </button>
        <button className="add" onClick={() => edit("prUrl")}>
          Edit
        </button>
      </div>

      <dialog ref={dialog} onClick={(e) => e.target === dialog.current && dialog.current?.close()}>
        <h2>Edit note</h2>
        <form
          key={[note.prUrl, note.protoUrl, note.due, note.tag, note.peopleIds.join()].join("|")}
          action={async (data) => {
            await saveNote(data);
            dialog.current?.close();
          }}
        >
          <input type="hidden" name="noteId" value={note.id} />
          <label className="label">
            Pull request
            <input className="field" name="prUrl" defaultValue={note.prUrl ?? ""} placeholder="https://github.com/org/repo/pull/12" inputMode="url" autoComplete="off" />
          </label>
          <label className="label">
            Prototype
            <input className="field" name="protoUrl" defaultValue={note.protoUrl ?? ""} placeholder="Link to the prototype or preview" inputMode="url" autoComplete="off" />
          </label>
          <label className="label">
            Ship day
            <input className="field" type="date" name="due" defaultValue={note.due ?? ""} />
          </label>
          <div className="label">
            On it
            <div className="pick" role="group" aria-label="People on it">
              {people.map((p) => (
                <label key={p.id}>
                  <input type="checkbox" name="people" value={p.id} defaultChecked={note.peopleIds.includes(p.id)} />
                  <span className="chip">{p.name}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="label">
            Tag
            <div className="pick" role="group" aria-label="Tag">
              {TAGS.map((t) => (
                <label key={t}>
                  <input type="radio" name="tag" value={t} defaultChecked={t === note.tag} />
                  <span className="chip">{t}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="dialog-foot">
            <button type="button" className="cancel" onClick={() => dialog.current?.close()}>
              Cancel
            </button>
            <Save />
          </div>
        </form>
      </dialog>
    </>
  );
}
