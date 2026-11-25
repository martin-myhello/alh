import { openNotification, markAllRead } from "@/app/actions";
import { Avatar, byId } from "@/components/bits";
import { TopBar } from "@/components/TopBar";
import { getData } from "@/lib/db";
import { agoLabel } from "@/lib/format";
import type { Notification } from "@/lib/types";

export const dynamic = "force-dynamic";
export const metadata = { title: "Inbox" };

const VERB: Record<Notification["kind"], string> = {
  comment: "commented on",
  update: "posted an update on",
  added: "added you to",
};

export default async function Inbox() {
  const { people, notes, me, inbox, unread } = await getData();
  const map = byId(people);
  const titles = new Map(notes.map((n) => [n.id, n.title]));

  const fresh = inbox.filter((n) => !n.readAt);
  const earlier = inbox.filter((n) => n.readAt).slice(0, 30);

  const rows = (list: Notification[], empty: string) => (
    <div className="rows">
      {list.map((n) => (
        <form key={n.id} action={openNotification}>
          <input type="hidden" name="id" value={n.id} />
          <input type="hidden" name="noteId" value={n.noteId} />
          <button className="row">
            <Avatar person={map.get(n.actorId)} />
            <span className="row-main">
              <div className="row-title">
                {map.get(n.actorId)?.name} {VERB[n.kind]} {titles.get(n.noteId) ?? "a note"}
              </div>
              {n.body && <div className="row-sub">{n.body}</div>}
            </span>
            <span className="when">{agoLabel(n.createdAt)}</span>
            {!n.readAt && <span className="dot" aria-label="Unread" />}
          </button>
        </form>
      ))}
      {list.length === 0 && <p className="empty">{empty}</p>}
    </div>
  );

  return (
    <>
      <TopBar active="/inbox" people={people} unread={unread} />
      <main className="column">
        <h1 className="page-title">Inbox</h1>
        <p className="page-sub">
          {unread ? `${unread} new for you, ${me.name}` : `You are all caught up, ${me.name}`}
        </p>

        <div className="section split">
          <h2>New</h2>
          {unread > 0 && (
            <form action={markAllRead}>
              <button>Mark all read</button>
            </form>
          )}
        </div>
        {rows(fresh, "Nothing new")}

        <h2 className="section">Earlier</h2>
        {rows(earlier, "Nothing yet")}
      </main>
    </>
  );
}
