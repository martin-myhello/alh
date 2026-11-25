import type { ReactNode } from "react";

/**
 * A screenshot attached to a note. Either a real image path, or "mock:<kind>",
 * which draws a small illustrative screen so the demo backlog has varied work
 * to show without shipping dozens of bitmaps.
 */

const BLUE = "#2f4a8a";
const NAVY = "#1d2f5c";
const PAPER = "#f7f5ef";
const LINE = "#d9d6cc";
const INK = "#2b2c30";
const MUTE = "#b9b6ab";
const ORANGE = "#f88435";

const bar = (x: number, y: number, w: number, h = 6, fill = LINE, r = h / 2) => (
  <rect key={`${x}-${y}-${w}`} x={x} y={y} width={w} height={h} rx={r} fill={fill} />
);

function Chrome({ children, bg = "#fff" }: { children: ReactNode; bg?: string }) {
  return (
    <>
      <rect width="439" height="241" fill={bg} />
      <rect width="439" height="22" fill="#ecebe6" />
      <circle cx="13" cy="11" r="3.5" fill="#ff6159" />
      <circle cx="25" cy="11" r="3.5" fill="#ffbf2f" />
      <circle cx="37" cy="11" r="3.5" fill="#2aca44" />
      <rect x="120" y="5" width="200" height="12" rx="6" fill="#fff" />
      {children}
    </>
  );
}

function Wordmark({ x, y, size = 13, fill = "#fff" }: { x: number; y: number; size?: number; fill?: string }) {
  return (
    <text x={x} y={y} fontSize={size} fontWeight="800" letterSpacing="0.06em" fill={fill}>
      DUNDER MIFFLIN
    </text>
  );
}

const MOCKS: Record<string, ReactNode> = {
  home: (
    <Chrome bg={PAPER}>
      <rect y="22" width="439" height="30" fill={BLUE} />
      <Wordmark x={18} y={42} size={11} />
      {[250, 296, 342].map((x) => bar(x, 34, 30, 5, "#8fa3d6"))}
      <rect x="388" y="30" width="36" height="14" rx="7" fill="#fff" />
      <text x="18" y="96" fontSize="27" fontWeight="700" letterSpacing="-0.02em" fill={INK}>
        Limitless paper
      </text>
      <text x="18" y="124" fontSize="27" fontWeight="700" letterSpacing="-0.02em" fill={BLUE}>
        in a paperless world
      </text>
      {bar(18, 142, 170)}
      {bar(18, 154, 130)}
      <rect x="18" y="176" width="92" height="26" rx="13" fill={INK} />
      <rect x="118" y="176" width="80" height="26" rx="13" fill="none" stroke={MUTE} />
      <g transform="rotate(-8 350 150)">
        <rect x="286" y="84" width="124" height="150" rx="4" fill="#fff" stroke={LINE} />
        <rect x="294" y="76" width="124" height="150" rx="4" fill="#fff" stroke={LINE} />
        <rect x="302" y="68" width="124" height="150" rx="4" fill="#fff" stroke={LINE} />
        <rect x="302" y="68" width="124" height="34" rx="4" fill={BLUE} />
        <Wordmark x={312} y={89} size={8} />
      </g>
    </Chrome>
  ),
  wire: (
    <>
      <rect width="439" height="241" fill="#fff" />
      <rect x="16" y="14" width="407" height="18" rx="3" fill="#f1f1f2" />
      <rect x="16" y="42" width="407" height="78" rx="4" fill="none" stroke="#c9c9cc" strokeDasharray="4 3" />
      <line x1="16" y1="42" x2="423" y2="120" stroke="#dedee0" />
      <line x1="423" y1="42" x2="16" y2="120" stroke="#dedee0" />
      {[16, 120, 224, 328].map((x) => (
        <g key={x}>
          <rect x={x} y="132" width="95" height="58" rx="4" fill="#f1f1f2" />
          {bar(x, 198, 70, 5, "#dedee0")}
          {bar(x, 209, 44, 5, "#ebebec")}
        </g>
      ))}
      <rect x="24" y="19" width="40" height="8" rx="2" fill="#c9c9cc" />
      <circle cx="400" cy="60" r="11" fill={ORANGE} />
      <text x="400" y="64.5" textAnchor="middle" fontSize="11" fontWeight="700" fill="#fff">
        1
      </text>
      <circle cx="78" cy="150" r="11" fill={ORANGE} />
      <text x="78" y="154.5" textAnchor="middle" fontSize="11" fontWeight="700" fill="#fff">
        2
      </text>
    </>
  ),
  mobile: (
    <>
      <rect width="439" height="241" fill="#eef0f6" />
      {[70, 180, 290].map((x, i) => (
        <g key={x}>
          <rect x={x} y="18" width="80" height="246" rx="14" fill={INK} />
          <rect x={x + 4} y="22" width="72" height="238" rx="11" fill={i === 1 ? BLUE : "#fff"} />
          <rect x={x + 28} y="27" width="24" height="5" rx="2.5" fill={INK} />
          {i === 1 ? (
            <>
              {[58, 82, 106, 130, 154].map((y) => bar(x + 14, y, 30 + ((y * 7) % 24), 6, "#9fb1df"))}
              <rect x={x + 14} y="188" width="52" height="18" rx="9" fill="#fff" />
            </>
          ) : (
            <>
              <rect x={x + 10} y="44" width="60" height="44" rx="5" fill={i ? "#f1efe8" : "#dfe5f5"} />
              {bar(x + 10, 98, 52, 6, INK)}
              {bar(x + 10, 111, 40)}
              {bar(x + 10, 122, 46)}
              <rect x={x + 10} y="142" width="27" height="34" rx="4" fill="#f1efe8" />
              <rect x={x + 43} y="142" width="27" height="34" rx="4" fill="#f1efe8" />
              <rect x={x + 10} y="190" width="60" height="18" rx="9" fill={INK} />
            </>
          )}
        </g>
      ))}
    </>
  ),
  code: (
    <>
      <rect width="439" height="241" fill="#1c1d22" />
      <rect width="439" height="24" fill="#26272d" />
      <rect x="12" y="0" width="96" height="24" fill="#1c1d22" />
      {bar(24, 9, 60, 6, "#8b8d96")}
      {bar(128, 9, 54, 6, "#4a4b53")}
      {(
        [
          [0, 0, 46, "#c586c0"], [0, 54, 80, "#9cdcfe"],
          [1, 12, 28, "#569cd6"], [1, 48, 110, "#ce9178"],
          [2, 12, 40, "#569cd6"], [2, 60, 64, "#dcdcaa"], [2, 132, 50, "#9cdcfe"],
          [3, 24, 70, "#9cdcfe"], [3, 102, 90, "#ce9178"],
          [4, 24, 54, "#9cdcfe"], [4, 86, 40, "#b5cea8"],
          [5, 12, 18, "#d4d4d4"],
          [7, 0, 52, "#c586c0"], [7, 60, 96, "#dcdcaa"],
          [8, 12, 44, "#c586c0"], [8, 64, 150, "#9cdcfe"],
          [9, 12, 86, "#6a9955"],
          [10, 0, 12, "#d4d4d4"],
        ] as [number, number, number, string][]
      ).map(([line, x, w, fill], i) => (
        <rect key={i} x={44 + x} y={40 + line * 15} width={w} height="6" rx="3" fill={fill} />
      ))}
      {Array.from({ length: 13 }, (_, i) => (
        <rect key={i} x="18" y={40 + i * 15} width="10" height="6" rx="3" fill="#3a3b42" />
      ))}
      <rect x="300" y="196" width="124" height="30" rx="8" fill="#23432e" />
      <circle cx="317" cy="211" r="5" fill="#2ac670" />
      {bar(330, 208, 78, 6, "#7fd6a3")}
    </>
  ),
  catalogue: (
    <Chrome bg="#fff">
      <rect x="0" y="22" width="96" height="219" fill={PAPER} />
      {bar(14, 40, 44, 6, INK)}
      {[58, 76, 94, 112].map((y, i) => (
        <g key={y}>
          <rect x="14" y={y} width="10" height="10" rx="3" fill={i === 1 ? BLUE : "#fff"} stroke={i === 1 ? BLUE : MUTE} />
          {bar(31, y + 2, 34 + i * 6)}
        </g>
      ))}
      {bar(14, 142, 36, 6, INK)}
      <rect x="14" y="160" width="68" height="4" rx="2" fill={LINE} />
      <rect x="14" y="160" width="40" height="4" rx="2" fill={BLUE} />
      <circle cx="54" cy="162" r="6" fill="#fff" stroke={BLUE} strokeWidth="2" />
      {[0, 1, 2].map((c) =>
        [0, 1].map((r) => (
          <g key={`${c}${r}`} transform={`translate(${112 + c * 106} ${38 + r * 100})`}>
            <rect width="96" height="62" rx="5" fill={["#e9edf8", "#f4f0e4", "#eaf4ee", "#f6eae4", "#ecebe6", "#e9edf8"][c + r * 3]} />
            <rect x="30" y="12" width="36" height="42" rx="2" fill="#fff" stroke={LINE} />
            <rect x="30" y="12" width="36" height="11" rx="2" fill={BLUE} />
            {bar(0, 70, 66, 6, INK)}
            {bar(0, 82, 38)}
          </g>
        )),
      )}
    </Chrome>
  ),
  table: (
    <>
      <rect width="439" height="241" fill="#fff" />
      <rect width="439" height="34" fill={PAPER} />
      {[20, 150, 268, 362].map((x, i) => bar(x, 14, [56, 44, 50, 36][i], 6, MUTE))}
      {[0, 1, 2, 3, 4, 5].map((r) => (
        <g key={r} transform={`translate(0 ${34 + r * 34})`}>
          <line x1="0" y1="0" x2="439" y2="0" stroke="#ecebe6" />
          <circle cx="27" cy="17" r="7" fill={r < 4 ? "#2ac670" : "none"} stroke={r < 4 ? "#2ac670" : MUTE} />
          {r < 4 && <path d="M23.5 17l2.5 2.5 4.5-5" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />}
          {bar(44, 14, 60 + ((r * 23) % 40), 6, INK)}
          {bar(150, 14, 70 + ((r * 17) % 30))}
          {bar(268, 14, 44 + ((r * 11) % 30))}
          <rect x="362" y="8" width="54" height="18" rx="9" fill={["#e5f7ed", "#e5f7ed", "#e6efff", "#fdeee2", "#f1f1f2", "#f1f1f2"][r]} />
        </g>
      ))}
    </>
  ),
  cart: (
    <Chrome bg={PAPER}>
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(${20 + i * 84} 38)`}>
          <circle cx="8" cy="8" r="8" fill={i === 0 ? BLUE : i === 1 ? INK : "#fff"} stroke={i === 2 ? MUTE : "none"} />
          {bar(22, 5, 40, 6, i < 2 ? INK : MUTE)}
        </g>
      ))}
      <rect x="20" y="70" width="240" height="152" rx="8" fill="#fff" stroke={LINE} />
      {[0, 1].map((i) => (
        <g key={i} transform={`translate(32 ${84 + i * 62})`}>
          <rect width="46" height="46" rx="5" fill="#e9edf8" />
          <rect x="14" y="8" width="18" height="30" rx="1.5" fill="#fff" stroke={LINE} />
          {bar(58, 8, 96, 6, INK)}
          {bar(58, 22, 60)}
          <rect x="170" y="10" width="44" height="20" rx="10" fill="none" stroke={MUTE} />
        </g>
      ))}
      <rect x="276" y="70" width="143" height="152" rx="8" fill="#fff" stroke={LINE} />
      {bar(290, 86, 62, 6, INK)}
      {[108, 124, 140].map((y) => (
        <g key={y}>
          {bar(290, y, 50)}
          {bar(376, y, 28)}
        </g>
      ))}
      <line x1="290" y1="160" x2="405" y2="160" stroke={LINE} />
      {bar(290, 170, 36, 7, INK)}
      {bar(366, 170, 38, 7, INK)}
      <rect x="290" y="190" width="115" height="22" rx="11" fill={BLUE} />
    </Chrome>
  ),
  product: (
    <Chrome bg="#fff">
      <rect x="20" y="38" width="176" height="186" rx="8" fill="#e9edf8" />
      <g transform="rotate(-6 108 131)">
        <rect x="62" y="66" width="92" height="130" rx="3" fill="#fff" stroke={LINE} />
        <rect x="62" y="66" width="92" height="30" rx="3" fill={BLUE} />
        <Wordmark x={70} y={85} size={7} />
        {bar(72, 110, 54)}
        {bar(72, 122, 40)}
      </g>
      {bar(216, 44, 50, 5, ORANGE)}
      <text x="216" y="78" fontSize="19" fontWeight="700" letterSpacing="-0.02em" fill={INK}>
        Premium copy 80g
      </text>
      {bar(216, 92, 180)}
      {bar(216, 104, 140)}
      <rect x="216" y="124" width="203" height="62" rx="6" fill={PAPER} />
      {[0, 1, 2].map((r) => (
        <g key={r}>
          {bar(228, 136 + r * 16, 60, 5, r === 0 ? INK : MUTE)}
          {bar(330, 136 + r * 16, 30, 5, r === 0 ? INK : MUTE)}
          {bar(380, 136 + r * 16, 26, 5, r === 2 ? "#2ac670" : MUTE)}
        </g>
      ))}
      <rect x="216" y="198" width="112" height="26" rx="13" fill={INK} />
      <rect x="336" y="198" width="83" height="26" rx="13" fill="none" stroke={MUTE} />
    </Chrome>
  ),
  type: (
    <>
      <rect width="439" height="241" fill={PAPER} />
      <text x="24" y="118" fontSize="104" fontWeight="700" letterSpacing="-0.04em" fill={INK}>
        Aa
      </text>
      <text x="26" y="150" fontSize="11" fill="#8b887c">
        Inter, 400 / 500 / 700
      </text>
      {[
        [32, 700, "Limitless paper", 62],
        [21, 600, "Bulk orders made simple", 98],
        [15, 500, "Delivered to your branch", 128],
        [12, 400, "Body copy, 12 on 18. Plain words.", 154],
      ].map(([size, weight, label, y]) => (
        <text key={y} x="212" y={y} fontSize={size} fontWeight={weight} letterSpacing="-0.01em" fill={INK}>
          {label}
        </text>
      ))}
      <line x1="212" y1="176" x2="415" y2="176" stroke={LINE} />
      {[212, 252, 292, 332, 372].map((x, i) => (
        <text key={x} x={x} y="206" fontSize={[11, 13, 15, 21, 32][i]} fontWeight="600" fill={BLUE}>
          Ag
        </text>
      ))}
    </>
  ),
  logo: (
    <>
      <rect width="439" height="241" fill="#fff" />
      <rect width="220" height="241" fill={BLUE} />
      <Wordmark x={28} y={112} size={17} />
      <path d="M92 138c-9 0-14 5-14 10s5 10 14 10c12 0 24-20 36-20 9 0 14 5 14 10s-5 10-14 10c-12 0-24-20-36-20z" fill="none" stroke="#fff" strokeWidth="3.5" />
      <rect x="252" y="30" width="78" height="78" rx="16" fill={PAPER} />
      <path d="M277 59c-6 0-9 4-9 10s3 10 9 10c9 0 19-20 28-20 6 0 9 4 9 10s-3 10-9 10c-9 0-19-20-28-20z" fill="none" stroke={BLUE} strokeWidth="3.5" />
      <rect x="342" y="30" width="78" height="78" rx="16" fill={NAVY} />
      <text x="381" y="76" textAnchor="middle" fontSize="22" fontWeight="800" fill="#fff">
        DM
      </text>
      <Wordmark x={252} y={150} size={12} fill={BLUE} />
      <text x="252" y="166" fontSize="8" letterSpacing="0.3em" fill="#8b887c">
        PAPER COMPANY
      </text>
      {[16, 24, 32].map((s, i) => (
        <rect key={s} x={252 + [0, 26, 60][i]} y={212 - s} width={s} height={s} rx={s / 4} fill={BLUE} />
      ))}
    </>
  ),
  palette: (
    <>
      <rect width="439" height="241" fill="#fff" />
      {[
        [BLUE, "Dunder blue", "#2F4A8A"],
        [NAVY, "Ink navy", "#1D2F5C"],
        [PAPER, "Paper white", "#F7F5EF"],
        [ORANGE, "Sticky note", "#F88435"],
        ["#2ac670", "Shipped", "#2AC670"],
      ].map(([c, name, hex], i) => (
        <g key={hex} transform={`translate(${20 + i * 82} 22)`}>
          <rect width="72" height="132" rx="10" fill={c} stroke={c === PAPER ? LINE : "none"} />
          <text x="0" y="154" fontSize="10" fontWeight="600" fill={INK}>
            {name}
          </text>
          <text x="0" y="168" fontSize="9" fill="#8b887c">
            {hex}
          </text>
        </g>
      ))}
      {[10, 20, 30, 40, 50, 60, 70, 80, 90].map((n, i) => (
        <rect key={n} x={20 + i * 44.5} y="194" width="38" height="26" rx="6" fill={`rgba(43,44,48,${0.04 + i * 0.115})`} />
      ))}
    </>
  ),
  doc: (
    <>
      <rect width="439" height="241" fill="#ecebe6" />
      <rect x="84" y="18" width="271" height="240" rx="4" fill="#fff" />
      {bar(112, 44, 40, 5, ORANGE)}
      <text x="112" y="80" fontSize="19" fontWeight="700" letterSpacing="-0.02em" fill={INK}>
        Infinity 2.0
      </text>
      {[98, 110, 122].map((y, i) => bar(112, y, [214, 196, 130][i]))}
      {bar(112, 148, 72, 6, INK)}
      {[166, 184, 202].map((y, i) => (
        <g key={y}>
          <circle cx="116" cy={y + 3} r="4" fill="none" stroke={BLUE} strokeWidth="1.5" />
          {bar(130, y, [170, 150, 186][i])}
        </g>
      ))}
      <rect x="296" y="140" width="96" height="40" rx="6" fill="#fff3c9" transform="rotate(4 344 160)" />
      <rect x="306" y="150" width="60" height="5" rx="2.5" fill="#d9b84a" transform="rotate(4 344 160)" />
      <rect x="306" y="162" width="42" height="5" rx="2.5" fill="#d9b84a" transform="rotate(4 344 160)" />
    </>
  ),
  chart: (
    <>
      <rect width="439" height="241" fill="#fff" />
      {[
        ["LCP", "1.6s"],
        ["JS", "94kb"],
        ["Score", "98"],
      ].map(([k, v], i) => (
        <g key={k} transform={`translate(${20 + i * 136} 18)`}>
          <rect width="126" height="58" rx="8" fill={PAPER} />
          <text x="12" y="22" fontSize="10" fill="#8b887c">
            {k}
          </text>
          <text x="12" y="46" fontSize="20" fontWeight="700" letterSpacing="-0.02em" fill={INK}>
            {v}
          </text>
          <circle cx="108" cy="18" r="4" fill="#2ac670" />
        </g>
      ))}
      {[110, 140, 170, 200].map((y) => (
        <line key={y} x1="20" y1={y} x2="419" y2={y} stroke="#ecebe6" />
      ))}
      <line x1="20" y1="146" x2="419" y2="146" stroke={ORANGE} strokeDasharray="4 4" />
      <path d="M20 118C60 112 80 130 120 126S180 150 220 156s70 14 110 20 60 8 89 10V222H20Z" fill="#e9edf8" />
      <path d="M20 118C60 112 80 130 120 126S180 150 220 156s70 14 110 20 60 8 89 10" fill="none" stroke={BLUE} strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="419" cy="186" r="4.5" fill="#fff" stroke={BLUE} strokeWidth="2.5" />
    </>
  ),
  sitemap: (
    <>
      <rect width="439" height="241" fill={PAPER} />
      <rect x="179" y="20" width="80" height="28" rx="7" fill={BLUE} />
      {bar(197, 31, 44, 6, "#fff")}
      <path d="M219 48v20M51 88V68h336v20M135 68v20M219 68v20M303 68v20" fill="none" stroke={MUTE} />
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i} transform={`translate(${14 + i * 84} 88)`}>
          <rect width="74" height="26" rx="6" fill="#fff" stroke={LINE} />
          {bar(12, 10, 34 + ((i * 9) % 16), 6, INK)}
          <path d={`M37 26v${14}`} stroke={MUTE} />
          {Array.from({ length: [3, 4, 2, 3, 2][i] }, (_, r) => (
            <g key={r} transform={`translate(8 ${40 + r * 24})`}>
              <rect width="58" height="18" rx="5" fill="#fff" stroke={LINE} />
              {bar(9, 6, 26 + ((r * 13 + i * 5) % 18), 5)}
            </g>
          ))}
        </g>
      ))}
    </>
  ),
  branch: (
    <Chrome bg="#fff">
      <rect y="22" width="439" height="84" fill="#dfe5f5" />
      <path d="M0 106V78l40-18 36 14 44-30 52 26 40-16 60 28 48-22 44 18 75-26v54Z" fill="#c3cdea" />
      <rect x="300" y="50" width="56" height="56" fill={BLUE} />
      {[0, 1, 2].map((r) => [0, 1, 2].map((c) => <rect key={`${r}${c}`} x={308 + c * 15} y={58 + r * 15} width="9" height="9" fill="#9fb1df" />))}
      <text x="20" y="140" fontSize="19" fontWeight="700" letterSpacing="-0.02em" fill={INK}>
        Scranton branch
      </text>
      {bar(20, 154, 190)}
      {bar(20, 166, 150)}
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i} transform={`translate(${20 + i * 44} 190)`}>
          <circle cx="16" cy="16" r="16" fill={["#e9edf8", "#f4f0e4", "#eaf4ee", "#f6eae4", "#ecebe6"][i]} />
          <circle cx="16" cy="13" r="5" fill={MUTE} />
          <path d="M6 28a10 10 0 0120 0" fill={MUTE} />
        </g>
      ))}
      <rect x="290" y="126" width="129" height="96" rx="8" fill={PAPER} />
      {bar(302, 140, 50, 6, INK)}
      {[158, 172, 186].map((y) => (
        <g key={y}>
          {bar(302, y, 36)}
          {bar(362, y, 44)}
        </g>
      ))}
      <rect x="302" y="200" width="105" height="14" rx="7" fill={BLUE} />
    </Chrome>
  ),
};

export function Shot({ src, alt = "" }: { src: string; alt?: string }) {
  if (src.startsWith("mock:")) {
    const kind = src.slice(5);
    return (
      <span className="shot">
        <svg viewBox="0 0 439 241" preserveAspectRatio="xMidYMid slice" role="img" aria-label={alt || `${kind} mockup`}>
          {MOCKS[kind] ?? MOCKS.wire}
        </svg>
      </span>
    );
  }
  return (
    <span className="shot">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} loading="lazy" />
    </span>
  );
}
