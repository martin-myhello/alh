import { NoteCard, Tabs, byId } from "@/components/bits";
import { Filter } from "@/components/dialogs";
import { People } from "@/components/People";
import { TopBar } from "@/components/TopBar";
import { getData } from "@/lib/db";
import { TAGS } from "@/lib/types";

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
  const { people, notes, unread } = await getData();
  const map = byId(people);

  const needle = q?.trim().toLowerCase();
  const list = notes.filter((n) => {
    if (tab !== "latest" && n.status !== tab) return false;
    if (tag && n.tag !== tag) return false;
    if (!needle) return true;
    const hay = [n.title, n.description, n.tag, ...n.peopleIds.map((id) => map.get(id)?.name ?? "")];
    return hay.join(" ").toLowerCase().includes(needle);
  });

  // What each person is working on right now floats above their face.
  const working: Record<string, string[]> = {};
  for (const p of people)
    working[p.id] = notes
      .filter((n) => n.peopleIds.includes(p.id) && (n.status === "cooking" || n.status === "testing"))
      .slice(0, 2)
      .map((n) => n.title)
      .reverse();

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
      <TopBar active="/" people={people} unread={unread} q={q} />
      <main className="column">
        <People people={people} working={working} />

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
