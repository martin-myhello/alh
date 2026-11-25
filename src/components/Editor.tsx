"use client";

import { useImperativeHandle, useRef, useState, type ReactNode, type Ref } from "react";
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

function Post({ disabled, children }: { disabled?: boolean; children: ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button className="btn" type="submit" disabled={pending || disabled}>
      {children}
    </button>
  );
}

export type RichHandle = {
  /** Writes the formatted text into `field` and appends the attached images as `images`. */
  fill(data: FormData, field: string): void;
  clear(): void;
};

/**
 * The text zone used for updates and for new notes: formatted text that looks
 * formatted while you type, a small toolbar, and up to four images that can be
 * picked, pasted or dropped. `children` sit on the right of the toolbar.
 */
export function RichArea({
  ref,
  placeholder,
  className = "",
  onBlank,
  children,
}: {
  ref: Ref<RichHandle>;
  placeholder: string;
  className?: string;
  onBlank?: (blank: boolean) => void;
  children?: ReactNode;
}) {
  const area = useRef<HTMLDivElement>(null);
  const picker = useRef<HTMLInputElement>(null);
  const [empty, setEmpty] = useState(true);
  const [pictures, setPictures] = useState<Picture[]>([]);
  const [over, setOver] = useState(false);

  const report = (isEmpty: boolean, count = pictures.length) => {
    setEmpty(isEmpty);
    onBlank?.(isEmpty && count === 0);
  };
  const isEmpty = () => !area.current?.textContent?.trim() && !area.current?.querySelector("li");

  useImperativeHandle(ref, () => ({
    fill(data, field) {
      const text = area.current ? toMarkdown(area.current) : "";
      data.set(field, text.replace(/\n{3,}/g, "\n\n").trim());
      pictures.forEach((p, i) => data.append("images", p.blob, `image-${i + 1}.jpg`));
    },
    clear() {
      pictures.forEach((p) => URL.revokeObjectURL(p.url));
      setPictures([]);
      if (area.current) area.current.innerHTML = "";
      report(true, 0);
    },
  }));

  /** Formats the selection in place, the way a word processor does. */
  const format = (command: "bold" | "italic" | "insertUnorderedList") => {
    area.current?.focus();
    document.execCommand(command);
    report(isEmpty());
  };

  const link = () => {
    area.current?.focus();
    const raw = window.prompt("Link to", "https://")?.trim();
    if (!raw || raw === "https://") return;
    const url = encodeURI(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
    if (window.getSelection()?.isCollapsed)
      document.execCommand("insertHTML", false, `<a href="${url}">${url.replace(/^https?:\/\//, "")}</a>&nbsp;`);
    else document.execCommand("createLink", false, url);
    report(false);
  };

  const add = async (files: Iterable<File>) => {
    const images = [...files].filter((f) => f.type.startsWith("image/"));
    const blobs = await Promise.all(images.slice(0, MAX_IMAGES - pictures.length).map(shrink));
    const fresh = blobs.filter((b): b is Blob => !!b).map((blob) => ({ blob, url: URL.createObjectURL(blob) }));
    if (!fresh.length) return;
    const next = [...pictures, ...fresh].slice(0, MAX_IMAGES);
    setPictures(next);
    onBlank?.(false);
  };

  const hold = (e: React.MouseEvent) => e.preventDefault();

  return (
    <div
      className={`editor ${className}${over ? " over" : ""}`}
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
      <div
        ref={area}
        className="rich"
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        aria-label={placeholder}
        data-placeholder={placeholder}
        data-empty={empty || undefined}
        onInput={() => report(isEmpty())}
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
                  const next = pictures.filter((x) => x !== p);
                  setPictures(next);
                  onBlank?.(empty && next.length === 0);
                }}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="tools">
        <button type="button" className="tool" title="Bold (⌘B)" aria-label="Bold" onMouseDown={hold} onClick={() => format("bold")}>
          <b>B</b>
        </button>
        <button type="button" className="tool" title="Italic (⌘I)" aria-label="Italic" onMouseDown={hold} onClick={() => format("italic")}>
          <i>I</i>
        </button>
        <button type="button" className="tool" title="Link (⌘K)" aria-label="Link" onMouseDown={hold} onClick={link}>
          <Icon name="link" />
        </button>
        <button type="button" className="tool" title="List" aria-label="Bullet list" onMouseDown={hold} onClick={() => format("insertUnorderedList")}>
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
        {children}
      </div>
    </div>
  );
}

/** The update composer on a note. */
export function Editor({ noteId, status }: { noteId: string; status: Status }) {
  const rich = useRef<RichHandle>(null);
  const [blank, setBlank] = useState(true);
  return (
    <form
      className="update-form"
      action={async (data) => {
        rich.current?.fill(data, "body");
        await postUpdate(data);
        rich.current?.clear();
      }}
    >
      <input type="hidden" name="noteId" value={noteId} />
      <RichArea ref={rich} placeholder="What changed?" onBlank={setBlank}>
        <select name="status" defaultValue={status} key={status} aria-label="Status">
          {(Object.keys(STATUS_LABEL) as Status[]).map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
            </option>
          ))}
        </select>
        <Post disabled={blank}>Post</Post>
      </RichArea>
    </form>
  );
}
