"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { addComment, createNote, postUpdate } from "@/app/actions";
import { STATUS_LABEL, TAGS, type Person, type Status } from "@/lib/types";
import { Icon } from "./Icon";

function Submit({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button className="btn" type="submit" disabled={pending}>
      {children}
    </button>
  );
}

export function Search({ q }: { q?: string }) {
  const ref = useRef<HTMLDialogElement>(null);
  return (
    <>
      <button className="action" aria-label="Search" onClick={() => ref.current?.showModal()}>
        <Icon name="search" />
      </button>
      <dialog ref={ref} onClick={(e) => e.target === ref.current && ref.current?.close()}>
        <form className="search-form" action="/" method="get" onSubmit={() => ref.current?.close()}>
          <Icon name="search" />
          <input
            className="field"
            name="q"
            defaultValue={q}
            placeholder="Search notes, people, tags"
            autoComplete="off"
            autoFocus
          />
        </form>
      </dialog>
    </>
  );
}

export function NewNote({
  people,
  preset,
  label,
}: {
  people: Person[];
  preset?: string;
  label?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  return (
    <>
      {label ? (
        <button className="add" onClick={() => ref.current?.showModal()}>
          {label}
        </button>
      ) : (
        <button className="action" aria-label="New note" onClick={() => ref.current?.showModal()}>
          <Icon name="plus" />
        </button>
      )}
      <dialog ref={ref} onClick={(e) => e.target === ref.current && ref.current?.close()}>
        <h2>New note</h2>
        <form action={createNote}>
          <input className="field" name="title" placeholder="Title of the note" required maxLength={120} autoFocus />
          <textarea className="field" name="description" placeholder="What is it, in one or two sentences" rows={3} maxLength={280} />
          <div className="pick" role="group" aria-label="People on it">
            {people.map((p) => (
              <label key={p.id}>
                <input type="checkbox" name="people" value={p.id} defaultChecked={p.id === preset} />
                <span className="chip">{p.name}</span>
              </label>
            ))}
          </div>
          <div className="pick" role="group" aria-label="Tag">
            {TAGS.map((t, i) => (
              <label key={t}>
                <input type="radio" name="tag" value={t} defaultChecked={i === 0} />
                <span className="chip">{t}</span>
              </label>
            ))}
          </div>
          <div className="dialog-foot">
            <select className="select" name="status" defaultValue="next" aria-label="Status">
              {(Object.keys(STATUS_LABEL) as Status[]).map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABEL[s]}
                </option>
              ))}
            </select>
            <input className="select" type="date" name="due" aria-label="Ship day" />
            <span style={{ flex: 1 }} />
            <button type="button" className="cancel" onClick={() => ref.current?.close()}>
              Cancel
            </button>
            <Submit>Create</Submit>
          </div>
        </form>
      </dialog>
    </>
  );
}

export function Filter({ tag, hrefs }: { tag?: string; hrefs: [label: string, href: string][] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !ref.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);

  return (
    <div className={`filter${tag ? " on" : ""}`} ref={ref}>
      <button aria-expanded={open} aria-haspopup="true" onClick={() => setOpen(!open)}>
        <Icon name="filter" />
        {tag ?? "Filter"}
      </button>
      {open && (
        <div className="menu">
          {hrefs.map(([label, href]) => (
            <Link
              key={label}
              href={href}
              scroll={false}
              aria-current={(tag ?? "Everything") === label ? "true" : undefined}
              onClick={() => setOpen(false)}
            >
              {label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function CommentBox({ updateId }: { updateId: string }) {
  const [open, setOpen] = useState(false);
  const form = useRef<HTMLFormElement>(null);

  if (!open) {
    return (
      <button className="chip ghost" onClick={() => setOpen(true)}>
        New comment
      </button>
    );
  }
  return (
    <form
      ref={form}
      action={async (data) => {
        await addComment(data);
        form.current?.reset();
        setOpen(false);
      }}
    >
      <input type="hidden" name="updateId" value={updateId} />
      <input
        name="body"
        placeholder="Keep it short, end with an emoji"
        maxLength={80}
        autoComplete="off"
        autoFocus
        onBlur={(e) => !e.currentTarget.value && setOpen(false)}
        onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
      />
    </form>
  );
}

export function UpdateBox({ noteId, status }: { noteId: string; status: Status }) {
  const form = useRef<HTMLFormElement>(null);
  return (
    <form
      className="post"
      ref={form}
      action={async (data) => {
        await postUpdate(data);
        form.current?.reset();
      }}
    >
      <input type="hidden" name="noteId" value={noteId} />
      <input type="text" name="body" placeholder="What changed?" maxLength={600} autoComplete="off" required />
      <select name="status" defaultValue={status} key={status} aria-label="Status">
        {(Object.keys(STATUS_LABEL) as Status[]).map((s) => (
          <option key={s} value={s}>
            {STATUS_LABEL[s]}
          </option>
        ))}
      </select>
      <Submit>Post</Submit>
    </form>
  );
}
