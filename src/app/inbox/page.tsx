import Link from "next/link";
import { Avatar, byId } from "@/components/bits";
import { TopBar } from "@/components/TopBar";
import { getData } from "@/lib/db";
import { agoLabel } from "@/lib/format";
import { ME, STATUS_LABEL } from "@/lib/types";

export const dynamic = "force-dynamic";
export const metadata = { title: "Inbox" };

type Item = { id: string; at: number; by: string; noteId: string; title: string; text: string; emoji?: string | null; mine: boolean };

export default async function Inbox() {
  const { people, notes } = await getData();
  const map = byId(people);
  const me = map.get(ME);

  // Everything other people did on notes, with the ones you are on first in line.
  const items: Item[] = [];
  for (const n of notes) {
    const mine = n.peopleIds.includes(ME);
    for (const u of n.updates) {
      if (u.personId !== ME)
        items.push({ id: u.id, at: u.createdAt, by: u.personId, noteId: n.id, title: n.title, text: `Moved to ${STATUS_LABEL[u.status]}. ${u.body}`, mine });
      for (const c of u.comments)
        if (c.personId !== ME)
          items.push({ id: c.id, at: c.createdAt, by: c.personId, noteId: n.id, title: n.title, text: c.body, emoji: c.emoji, mine: mine || u.personId === ME });
    }
  }
  items.sort((a, b) => b.at - a.at);

  const forYou = items.filter((i) => i.mine).slice(0, 12);
  const rest = items.filter((i) => !i.mine).slice(0, 14);

  const rows = (list: Item[]) => (
    <div className="rows">
      {list.map((i) => (
        <Link key={i.id} className="row" href={`/notes/${i.noteId}`}>
          <Avatar person={map.get(i.by)} />
          <span className="row-main">
            <div className="row-title">
              {map.get(i.by)?.name} on {i.title}
            </div>
            <div className="row-sub">
              {i.text} {i.emoji}
            </div>
          </span>
          <span className="when">{agoLabel(i.at)}</span>
          {agoLabel(i.at) === "Today" && <span className="dot" aria-label="New" />}
        </Link>
      ))}
      {list.length === 0 && <p className="empty">All caught up</p>}
    </div>
  );

  return (
    <>
      <TopBar active="/inbox" people={people} />
      <main className="column">
        <h1 className="page-title">Inbox</h1>
        <p className="page-sub">What happened on your notes, {me?.name}</p>
        <h2 className="section">For you</h2>
        {rows(forYou)}
        <h2 className="section">Around the office</h2>
        {rows(rest)}
      </main>
    </>
  );
}
