import { useEffect, useMemo, useState, type FormEvent } from "react";
import { HostKeepsafeCard } from "../components/HostKeepsafeCard.tsx";
import { Button, Field, Shell, StatusNote } from "../components/ui.tsx";
import { createEvent } from "../lib/api.ts";
import { loadKeepsafe, saveKeepsafe } from "../lib/session.ts";
import { applyTheme } from "../lib/theme.ts";
import { DEFAULT_THEME, THEME_SWATCHES } from "../lib/types.ts";

export function CreatePage() {
  const existing = useMemo(() => loadKeepsafe(), []);
  const [coupleNames, setCoupleNames] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [themeColor, setThemeColor] = useState(DEFAULT_THEME);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [keepsafe, setKeepsafe] = useState(existing);

  useEffect(() => {
    applyTheme(themeColor);
  }, [themeColor]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const created = await createEvent({
        coupleNames,
        eventDate,
        welcomeMessage,
        themeColor,
      });
      const next = {
        slug: created.slug,
        hostToken: created.hostToken,
        coupleNames: coupleNames.trim(),
        themeColor,
      };
      saveKeepsafe(next);
      setKeepsafe(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn’t create the guestbook.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Shell>
      {keepsafe ? (
        <HostKeepsafeCard keepsafe={keepsafe} />
      ) : (
        <section className="narrow">
          <p className="kicker">One-time setup</p>
          <h1>Create a guestbook</h1>
          <p className="lede">No account. We’ll give you a host link once — save it like a key.</p>

          <form className="stack" onSubmit={(e) => void onSubmit(e)}>
            <Field label="Couple’s names" hint="Shown on the guest page and the wall.">
              <input
                required
                maxLength={120}
                placeholder="Maya & James"
                value={coupleNames}
                onChange={(e) => setCoupleNames(e.target.value)}
              />
            </Field>
            <Field label="Event date" hint="Optional">
              <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
            </Field>
            <Field label="Welcome message" hint="Optional — a line guests see before they write.">
              <textarea
                maxLength={500}
                rows={3}
                placeholder="Leave us a toast — a memory, a wish, a terrible joke."
                value={welcomeMessage}
                onChange={(e) => setWelcomeMessage(e.target.value)}
              />
            </Field>
            <fieldset className="field">
              <legend className="field-label">Theme color</legend>
              <div className="swatches">
                {THEME_SWATCHES.map((swatch) => (
                  <button
                    key={swatch.value}
                    type="button"
                    className={`swatch${themeColor === swatch.value ? " is-on" : ""}`}
                    style={{ background: swatch.value }}
                    aria-label={swatch.label}
                    onClick={() => setThemeColor(swatch.value)}
                  />
                ))}
                <input
                  type="color"
                  value={themeColor}
                  aria-label="Custom color"
                  onChange={(e) => setThemeColor(e.target.value)}
                />
              </div>
            </fieldset>
            {error ? <StatusNote tone="error">{error}</StatusNote> : null}
            <Button type="submit" disabled={busy}>
              {busy ? "Creating…" : "Create guestbook"}
            </Button>
          </form>
        </section>
      )}
    </Shell>
  );
}
