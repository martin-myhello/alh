import { notFound } from "next/navigation";
import { Avatar, Back, NoteCard, Tabs, byId } from "@/components/bits";
import { NewNote } from "@/components/dialogs";
import { getData } from "@/lib/db";

export const dynamic = "force-dynamic";

const TABS: [string, string][] = [
  ["updated", "Last updated"],
  ["working", "Working on"],
  ["shipped", "Just shipped"],
];

export default async function Profile({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const [{ id }, { tab = "updated" }] = await Promise.all([params, searchParams]);
  const { people, notes } = await getData();
  const person = people.find((p) => p.id === id);
  if (!person) notFound();

  const list = notes
    .filter((n) => n.peopleIds.includes(id))
    .filter((n) =>
      tab === "working"
        ? n.status === "cooking" || n.status === "testing"
        : tab === "shipped"
          ? n.status === "shipped"
          : true,
    );

  return (
    <div className="profile">
      <aside className="side">
        <Back />
        <div className="side-body">
          <div className="who">
            <Avatar person={person} size={68} />
            <h1>{person.name}</h1>
          </div>
          <p className="bio">{person.bio}</p>
          <p className="gh">
            Github <b>{person.github}</b>
          </p>
          {person.away && <p className="away">{person.away}</p>}
        </div>
        <NewNote people={people} preset={person.id} label="Add a note" />
      </aside>
      <main className="main">
        <Tabs base={`/people/${id}`} tabs={TABS} active={tab} />
        <div className="cards">
          {list.map((n) => (
            <NoteCard key={n.id} note={n} people={byId(people)} />
          ))}
          {list.length === 0 && <p className="empty">Nothing here yet</p>}
        </div>
      </main>
    </div>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { people } = await getData();
  return { title: people.find((p) => p.id === id)?.name ?? "Profile" };
}
