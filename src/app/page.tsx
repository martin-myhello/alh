import Link from "next/link";
import { Avatar, NoteCard, Tabs, byId } from "@/components/bits";
import { Filter } from "@/components/dialogs";
import { TopBar } from "@/components/TopBar";
import { getData } from "@/lib/db";
import { agoLabel } from "@/lib/format";
import { TAGS, type Comment } from "@/lib/types";

export const dynamic = "force-dynamic";

const TABS: [string, string][] = [
  ["latest", "Latest"],
  ["cooking", "Cooking"],
  ["testing", "Testing"],
  ["shipped", "Shipped"],
];

export default async function Feed({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; tag?: string; q?: string }>;
}) {
  const { tab = "latest", tag, q } = await searchParams;
  const { people, notes } = await getData();
  const map = byId(people);

  const needle = q?.trim().toLowerCase();
  const list = notes.filter((n) => {
    if (tab !== "latest" && n.status !== tab) return false;
    if (tag && n.tag !== tag) return false;
    if (!needle) return true;
    const hay = [n.title, n.description, n.tag, ...n.peopleIds.map((id) => map.get(id)?.name ?? "")];
    return hay.join(" ").toLowerCase().includes(needle);
  });

  // What people said since yesterday floats above their face, like in the design.
  const said = new Map<string, Comment[]>();
  for (const n of notes)
    for (const u of n.updates)
      for (const c of u.comments)
        if (["Today", "Yesterday"].includes(agoLabel(c.createdAt)))
          said.set(c.personId, [...(said.get(c.personId) ?? []), c]);
  let previousSpoke = false;
  const bubbles = new Map<string, Comment[]>();
  for (const p of people) {
    const mine: Comment[] = previousSpoke ? [] : (said.get(p.id) ?? []).sort((a, b) => b.createdAt - a.createdAt).slice(0, 2);
    previousSpoke = mine.length > 0;
    bubbles.set(p.id, mine);
  }

  const qs = (next: { tag?: string }) => {
    const s = new URLSearchParams();
    if (tab !== "latest") s.set("tab", tab);
    if (next.tag) s.set("tag", next.tag);
    if (q) s.set("q", q);
    const out = s.toString();
    return out ? `/?${out}` : "/";
  };

  return (
    <>
      <TopBar active="/" people={people} q={q} />
      <main className="column">
        <div className="people-wrap">
          <div className="people">
            {people.map((p) => (
              <Link key={p.id} className="person" href={`/people/${p.id}`}>
                {bubbles.get(p.id)!.length > 0 && (
                  <span className="bubbles">
                    {bubbles.get(p.id)!.map((c) => (
                      <span key={c.id} className="chip">
                        {c.body}
                      </span>
                    ))}
                  </span>
                )}
                <Avatar person={p} size={68} />
                {p.name}
              </Link>
            ))}
          </div>
        </div>

        <div style={{ margin: "27px 0 25px" }}>
          <Tabs base="/" tabs={TABS} active={tab} params={{ tag, q }}>
            <span className="spacer" />
            <Filter
              tag={tag}
              hrefs={[["Everything", qs({})], ...TAGS.map((t): [string, string] => [t, qs({ tag: t })])]}
            />
          </Tabs>
        </div>

        <div className="cards">
          {list.map((n) => (
            <NoteCard key={n.id} note={n} people={map} />
          ))}
          {list.length === 0 && (
            <p className="empty">{q ? `Nothing matches “${q}”` : "Nothing here yet"}</p>
          )}
        </div>
      </main>
    </>
  );
}
