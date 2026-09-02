import { SIGN_THEMES, type SignThemeId } from "../lib/signThemes";

type SignThemePickerProps = {
  selected: SignThemeId;
  accent: string;
  disabled?: boolean;
  busy?: boolean;
  pendingId?: SignThemeId | null;
  onChange: (id: SignThemeId) => void;
};

export function SignThemePicker({
  selected,
  accent,
  disabled = false,
  busy = false,
  pendingId = null,
  onChange,
}: SignThemePickerProps) {
  const inactive = disabled || busy;

  return (
    <fieldset className="mb-6 mt-12 block border-0 p-0" aria-busy={busy}>
      <legend className="mb-1.5 block text-[0.82rem] font-bold">Table sign design</legend>
      <p className="mb-3 mt-0 text-[0.9rem] text-ink-soft">
        Pick a look for the printables. Your accent color still carries through.
      </p>
      <div className="grid grid-cols-2 gap-2.5 min-[520px]:grid-cols-3">
        {SIGN_THEMES.map((theme) => {
          const isSelected = selected === theme.id;
          const isPending = pendingId === theme.id;
          return (
            <button
              key={theme.id}
              type="button"
              aria-pressed={isSelected}
              aria-busy={isPending}
              aria-label={`${theme.label}: ${theme.description}`}
              disabled={inactive}
              onClick={() => onChange(theme.id)}
              className={`flex items-center gap-2.5 rounded-[1rem] border-0 bg-cream px-3 py-2.5 text-left${isSelected ? " outline outline-3 outline-offset-2 outline-ink" : ""
                }${isPending && !isSelected ? " outline outline-2 outline-offset-2 outline-ink-soft" : ""
                }${inactive ? " cursor-not-allowed opacity-60" : " cursor-pointer"}`}
            >
              <span
                className="size-8 shrink-0 rounded-full shadow-[inset_0_0_0_1px_rgba(0,0,0,0.08)]"
                style={{
                  background: `linear-gradient(135deg, ${theme.paper} 55%, ${accent} 55%)`,
                }}
                aria-hidden
              />
              <span className="min-w-0">
                <span className="block text-[0.88rem] font-bold leading-tight">{theme.label}</span>
                <span className="block text-[0.75rem] leading-snug text-ink-soft">
                  {theme.description}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
