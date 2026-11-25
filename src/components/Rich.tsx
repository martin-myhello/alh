import type { ReactNode } from "react";

/**
 * Renders the small Markdown subset the update editor writes: **bold**, *italic*,
 * `code`, [links](https://…), bare links, and "- " / "1. " lists. Builds React
 * nodes directly, so nothing typed by a user is ever treated as HTML.
 */

const INLINE = /(\*\*([^*\n]+)\*\*)|(\*([^*\n]+)\*)|(`([^`\n]+)`)|(\[([^\]\n]+)\]\((https?:\/\/[^\s)]+)\))|(https?:\/\/[^\s<]+[^\s<.,;:!?)])/g;

function inline(text: string, key: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let i = 0;
  for (const m of text.matchAll(INLINE)) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const k = `${key}-${i++}`;
    if (m[1]) out.push(<strong key={k}>{m[2]}</strong>);
    else if (m[3]) out.push(<em key={k}>{m[4]}</em>);
    else if (m[5]) out.push(<code key={k}>{m[6]}</code>);
    else if (m[7])
      out.push(
        <a key={k} href={m[9]} target="_blank" rel="noreferrer">
          {m[8]}
        </a>,
      );
    else
      out.push(
        <a key={k} href={m[10]} target="_blank" rel="noreferrer">
          {m[10].replace(/^https?:\/\//, "")}
        </a>,
      );
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

const BULLET = /^\s*[-*•]\s+(.*)$/;
const NUMBER = /^\s*\d+[.)]\s+(.*)$/;

export function Rich({ text }: { text: string }) {
  const blocks: ReactNode[] = [];
  const lines = text.replace(/\r/g, "").split("\n");
  let para: string[] = [];

  const flush = () => {
    if (!para.length) return;
    const k = `p${blocks.length}`;
    blocks.push(
      <p key={k}>
        {para.flatMap((line, i) => [i > 0 ? <br key={`${k}-br${i}`} /> : null, ...inline(line, `${k}-${i}`)])}
      </p>,
    );
    para = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const kind = BULLET.test(lines[i]) ? BULLET : NUMBER.test(lines[i]) ? NUMBER : null;
    if (kind) {
      flush();
      const items: string[] = [];
      while (i < lines.length && kind.test(lines[i])) items.push(lines[i++].match(kind)![1]);
      i--;
      const k = `l${blocks.length}`;
      const lis = items.map((item, n) => <li key={n}>{inline(item, `${k}-${n}`)}</li>);
      blocks.push(kind === BULLET ? <ul key={k}>{lis}</ul> : <ol key={k}>{lis}</ol>);
    } else if (!lines[i].trim()) flush();
    else para.push(lines[i]);
  }
  flush();
  return <>{blocks}</>;
}
