import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { QrPanel } from "./QrPanel.tsx";
import { renderKeepsafePng } from "../lib/keepsafe.ts";
import { clearKeepsafe } from "../lib/session.ts";
import { DEFAULT_THEME } from "../lib/types.ts";
import { copyText, downloadDataUrl, guestUrl, manageUrl, wallUrl } from "../lib/urls.ts";
import type { HostKeepsafe } from "../lib/types.ts";
import { Button, StatusNote } from "./ui.tsx";

export function HostKeepsafeCard({ keepsafe }: { keepsafe: HostKeepsafe }) {
  const [copied, setCopied] = useState<"host" | "guest" | null>(null);
  const [tableCount, setTableCount] = useState(8);
  const [printing, setPrinting] = useState(false);
  const hostLink = useMemo(
    () => manageUrl(keepsafe.slug, keepsafe.hostToken),
    [keepsafe.slug, keepsafe.hostToken],
  );
  const guestLink = useMemo(() => guestUrl(keepsafe.slug), [keepsafe.slug]);

  async function copy(kind: "host" | "guest") {
    const ok = await copyText(kind === "host" ? hostLink : guestLink);
    if (ok) {
      setCopied(kind);
      window.setTimeout(() => setCopied(null), 1800);
    }
  }

  async function downloadKeepsafe() {
    const png = await renderKeepsafePng({
      coupleNames: keepsafe.coupleNames,
      guestUrl: guestLink,
      manageUrl: hostLink,
      themeColor: keepsafe.themeColor || DEFAULT_THEME,
    });
    downloadDataUrl(png, `${keepsafe.slug}-host-keepsafe.png`);
  }

  const tables = Array.from({ length: Math.min(30, Math.max(1, tableCount)) }, (_, i) => String(i + 1));

  return (
    <section className="keepsafe">
      <StatusNote tone="warn">
        This host link is the only way to moderate the guestbook. It cannot be recovered if you lose it — there is no email, no account, no reset.
      </StatusNote>

      <h1>Save your host link</h1>
      <p className="lede">
        {keepsafe.coupleNames}’s guestbook is live. Print the guest QR for tables. Keep the host link somewhere only you can find.
      </p>

      <div className="link-block">
        <span>Private host link</span>
        <code>{hostLink}</code>
        <Button variant="primary" onClick={() => void copy("host")}>
          {copied === "host" ? "Copied" : "Copy host link"}
        </Button>
      </div>

      <div className="link-block">
        <span>Guest page</span>
        <code>{guestLink}</code>
        <Button variant="ghost" onClick={() => void copy("guest")}>
          {copied === "guest" ? "Copied" : "Copy guest link"}
        </Button>
      </div>

      <QrPanel slug={keepsafe.slug} />

      <div className="btn-row">
        <Button onClick={() => void downloadKeepsafe()}>Download keepsafe image</Button>
        <Button variant="ghost" href={wallUrl(keepsafe.slug)}>
          Open the wall
        </Button>
        <Button variant="ghost" href={hostLink}>
          Open host tools
        </Button>
      </div>

      <div className="table-print">
        <h2>Per-table QR codes</h2>
        <p>Print a unique card for each table so messages arrive already tagged.</p>
        <label className="field">
          <span className="field-label">Number of tables</span>
          <input
            type="number"
            min={1}
            max={30}
            value={tableCount}
            onChange={(e) => setTableCount(Number(e.target.value) || 1)}
          />
        </label>
        <Button variant="ghost" onClick={() => setPrinting(true)}>
          Preview table cards
        </Button>
      </div>

      {printing ? (
        <div className="table-sheet">
          {tables.map((table) => (
            <div className="table-card" key={table}>
              <p>Table {table}</p>
              <QrPanel slug={keepsafe.slug} table={table} caption={`Table ${table}`} />
            </div>
          ))}
          <div className="btn-row no-print">
            <Button onClick={() => window.print()}>Print table cards</Button>
            <Button variant="ghost" onClick={() => setPrinting(false)}>
              Close
            </Button>
          </div>
        </div>
      ) : null}

      <p className="fine-print">
        <Link to="/create" onClick={clearKeepsafe}>
          Create another guestbook
        </Link>
      </p>
    </section>
  );
}
