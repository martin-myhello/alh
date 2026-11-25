"use client";

import { useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { postUpdate } from "@/app/actions";
import { STATUS_LABEL, type Status } from "@/lib/types";
import { Icon } from "./Icon";

const MAX_IMAGES = 4;
const MAX_SIDE = 1600;

type Picture = { blob: Blob; url: string };

/** Shrinks a picked image in the browser so uploads stay small and are always JPEG. */
async function shrink(file: File): Promise<Blob | null> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    return await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.84));
  } catch {
    return null;
  }
}

/** Turns what was typed in the edit area into the Markdown subset that updates are stored as. */
function toMarkdown(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) return (node.textContent ?? "").replace(/\u00a0/g, " ");
  if (!(node instanceof HTMLElement)) return "";
  const inner = () => [...node.childNodes].map(toMarkdown).join("");
  const wrap = (mark: string) => {
    const text = inner();
    const core = text.trim();
    if (!core) return text;
    return text.slice(0, text.indexOf(core)) + mark + core + mark + text.slice(text.indexOf(core) + core.length);
  };
  switch (node.nodeName) {
    case "BR":
      return "\n";
    case "B":
    case "STRONG":
      return wrap("**");
    case "I":
    case "EM":
      return wrap("*");
    case "A": {
      const href = node.getAttribute("href") ?? "";
      return /^https?:\/\//.test(href) ? `[${inner().trim() || href}](${href})` : inner();
    }
    case "UL":
    case "OL":
      return (
        "\n" +
        [...node.children]
          .map((li, i) => `${node.nodeName === "UL" ? "-" : `${i + 1}.`} ${toMarkdown(li).trim()}`)
          .join("\n") +
        "\n"
      );
    case "DIV":
    case "P":
      return `\n${inner()}`;
    default:
      return inner();
  }
}

function Post({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button className="btn" type="submit" disabled={pending || disabled}>
      {pending ? "Posting" : "Post"}
    </button>
  );
}

/** The update composer on a note: formatted text plus up to four images. */
export function Editor({ noteId, status }: { noteId: string; status: Status }) {
  const area = useRef<HTMLDivElement>(null);
  const picker = useRef<HTMLInputElement>(null);
  const [empty, setEmpty] = useState(true);
  const [pictures, setPictures] = useState<Picture[]>([]);
  const [over, setOver] = useState(false);

  /** Formats the selection in place, the way a word processor does. */
  const format = (command: "bold" | "italic" | "insertUnorderedList") => {
    area.current?.focus();
    document.execCommand(command);
    setEmpty(!area.current?.textContent?.trim() && !area.current?.querySelector("li"));
  };

  const link = () => {
    area.current?.focus();
    const raw = window.prompt("Link to", "https://")?.trim();
    if (!raw || raw === "https://") return;
    const url = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    if (window.getSelection()?.isCollapsed) document.execCommand("insertHTML", false, `<a href="${encodeURI(url)}">${encodeURI(url).replace(/^https?:\/\//, "")}</a>&nbsp;`);
    else document.execCommand("createLink", false, url);
    setEmpty(false);
  };

  const add = async (files: Iterable<File>) => {
    const images = [...files].filter((f) => f.type.startsWith("image/"));
    const room = MAX_IMAGES - pictures.length;
    const blobs = await Promise.all(images.slice(0, room).map(shrink));
    const fresh = blobs.filter((b): b is Blob => !!b).map((blob) => ({ blob, url: URL.createObjectURL(blob) }));
    if (fresh.length) setPictures((p) => [...p, ...fresh].slice(0, MAX_IMAGES));
  };

  const clear = () => {
    pictures.forEach((p) => URL.revokeObjectURL(p.url));
    setPictures([]);
    if (area.current) area.current.innerHTML = "";
    setEmpty(true);
  };

  return (
    <form
      className={`editor${over ? " over" : ""}`}
      action={async (data) => {
        const body = area.current ? toMarkdown(area.current) : "";
        data.set("body", body.replace(/\n{3,}/g, "\n\n").trim());
        pictures.forEach((p, i) => data.append("images", p.blob, `image-${i + 1}.jpg`));
        await postUpdate(data);
        clear();
      }}
      onDragOver={(e) => {
        if (!e.dataTransfer.types.includes("Files")) return;
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        add(e.dataTransfer.files);
      }}
    >
      <input type="hidden" name="noteId" value={noteId} />
      <div
        ref={area}
        className="rich"
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        aria-label="What changed?"
        data-placeholder="What changed?"
        data-empty={empty || undefined}
        onInput={(e) => setEmpty(!e.currentTarget.textContent?.trim() && !e.currentTarget.querySelector("li"))}
        onPaste={(e) => {
          e.preventDefault();
          if (e.clipboardData.files.length) return void add(e.clipboardData.files);
          // Paste as plain text so foreign styles never leak in.
          document.execCommand("insertText", false, e.clipboardData.getData("text/plain"));
        }}
        onKeyDown={(e) => {
          if (!(e.metaKey || e.ctrlKey)) return;
          if (e.key === "k") {
            e.preventDefault();
            link();
          }
          if (e.key === "Enter") {
            e.preventDefault();
            e.currentTarget.closest("form")?.requestSubmit();
          }
        }}
      />

      {pictures.length > 0 && (
        <div className="thumbs">
          {pictures.map((p, i) => (
            <span key={p.url} className="thumb">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.url} alt={`Attached image ${i + 1}`} />
              <button
                type="button"
                aria-label={`Remove image ${i + 1}`}
                onClick={() => {
                  URL.revokeObjectURL(p.url);
                  setPictures((all) => all.filter((x) => x !== p));
                }}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="tools">
        <button type="button" className="tool" title="Bold (⌘B)" aria-label="Bold" onMouseDown={(e) => e.preventDefault()} onClick={() => format("bold")}>
          <b>B</b>
        </button>
        <button type="button" className="tool" title="Italic (⌘I)" aria-label="Italic" onMouseDown={(e) => e.preventDefault()} onClick={() => format("italic")}>
          <i>I</i>
        </button>
        <button type="button" className="tool" title="Link (⌘K)" aria-label="Link" onMouseDown={(e) => e.preventDefault()} onClick={link}>
          <Icon name="link" />
        </button>
        <button type="button" className="tool" title="List" aria-label="Bullet list" onMouseDown={(e) => e.preventDefault()} onClick={() => format("insertUnorderedList")}>
          <Icon name="list" />
        </button>
        <button
          type="button"
          className="tool"
          title="Add images"
          aria-label="Add images"
          disabled={pictures.length >= MAX_IMAGES}
          onClick={() => picker.current?.click()}
        >
          <Icon name="image" />
        </button>
        <input
          ref={picker}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => {
            if (e.target.files) add(e.target.files);
            e.target.value = "";
          }}
        />
        <span className="spacer" />
        <select name="status" defaultValue={status} key={status} aria-label="Status">
          {(Object.keys(STATUS_LABEL) as Status[]).map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
            </option>
          ))}
        </select>
        <Post disabled={empty && pictures.length === 0} />
      </div>
    </form>
  );
}
