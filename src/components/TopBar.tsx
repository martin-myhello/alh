import Link from "next/link";
import type { Person } from "@/lib/types";
import { Icon, type IconName } from "./Icon";
import { NewNote, Search } from "./dialogs";

const NAV: [href: string, label: string, icon: IconName][] = [
  ["/", "Feed", "feed"],
  ["/today", "Today", "today"],
  ["/inbox", "Inbox", "inbox"],
  ["/timeline", "Timeline", "timeline"],
];

export function TopBar({
  active,
  people,
  unread = 0,
  q,
}: {
  active: string;
  people: Person[];
  unread?: number;
  q?: string;
}) {
  return (
    <header className="topbar">
      <Link className="brand" href="/" title="Act Like Human">
        ALH
      </Link>
      <nav className="nav" aria-label="Main">
        {NAV.map(([href, label, icon]) => (
          <Link key={href} href={href} aria-current={href === active ? "page" : undefined}>
            <Icon name={icon} />
            {label}
            {href === "/inbox" && unread > 0 && (
              <span className="badge" aria-label={`${unread} unread`}>
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </Link>
        ))}
      </nav>
      <div className="actions">
        <Search q={q} />
        <NewNote people={people} />
      </div>
    </header>
  );
}
