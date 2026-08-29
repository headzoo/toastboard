import { useEffect, useRef } from "react";
import { SIGN_THEMES, type SignThemeId } from "../lib/signThemes.ts";
import {
  MOTION_STYLES,
  SLIDESHOW_DURATIONS,
  type MotionStyle,
  type SlideshowDuration,
  type SlideshowPreferences,
} from "../lib/slideshow.ts";

type Props = {
  preferences: SlideshowPreferences;
  accent: string;
  eventSignTheme: SignThemeId;
  onChange: (preferences: SlideshowPreferences) => void;
  onClose: () => void;
  restoreFocusRef: React.RefObject<HTMLButtonElement | null>;
};

export function SlideshowSettingsDialog({
  preferences,
  accent,
  eventSignTheme,
  onChange,
  onClose,
  restoreFocusRef,
}: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const selectedTheme = preferences.signTheme ?? eventSignTheme;

  useEffect(() => {
    const firstControl = dialogRef.current?.querySelector<HTMLButtonElement>("button");
    firstControl?.focus();
    const restoreFocusTarget = restoreFocusRef.current;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const controls = [...(dialogRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ) ?? [])];
      if (!controls.length) return;
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      restoreFocusTarget?.focus();
    };
  }, [restoreFocusRef]);

  const selectDuration = (duration: SlideshowDuration) => onChange({ ...preferences, duration });
  const selectMotion = (motion: MotionStyle) => onChange({ ...preferences, motion });
  const selectSignTheme = (signTheme: SignThemeId) => onChange({ ...preferences, signTheme });

  return (
    <div className="slideshow-dialog-backdrop" role="presentation" onMouseDown={onClose}>
      <div
        ref={dialogRef}
        className="slideshow-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="slideshow-settings-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="slideshow-dialog-heading">
          <h2 id="slideshow-settings-title">Slideshow settings</h2>
          <button className="slideshow-icon-button" type="button" onClick={onClose} aria-label="Close settings">
            ×
          </button>
        </div>
        <section aria-labelledby="duration-label">
          <h3 id="duration-label">Time per toast</h3>
          <div className="slideshow-chips">
            {SLIDESHOW_DURATIONS.map((duration) => (
              <button
                key={duration}
                className="slideshow-chip"
                type="button"
                aria-pressed={preferences.duration === duration}
                onClick={() => selectDuration(duration)}
              >
                {duration / 1000}s
              </button>
            ))}
          </div>
        </section>
        <section aria-labelledby="motion-label">
          <h3 id="motion-label">Motion</h3>
          <div className="slideshow-chips">
            {MOTION_STYLES.map((motion) => (
              <button
                key={motion}
                className="slideshow-chip"
                type="button"
                aria-pressed={preferences.motion === motion}
                onClick={() => selectMotion(motion)}
              >
                {motion[0].toUpperCase() + motion.slice(1)}
              </button>
            ))}
          </div>
        </section>
        <section aria-labelledby="sign-design-label">
          <h3 id="sign-design-label">Sign design</h3>
          <div className="slideshow-theme-grid">
            {SIGN_THEMES.map((theme) => (
              <button
                key={theme.id}
                className="slideshow-theme-chip"
                type="button"
                aria-pressed={selectedTheme === theme.id}
                aria-label={`${theme.label}: ${theme.description}`}
                onClick={() => selectSignTheme(theme.id)}
              >
                <span
                  className="slideshow-theme-swatch"
                  style={{
                    background: `linear-gradient(135deg, ${theme.paper} 55%, ${accent} 55%)`,
                  }}
                  aria-hidden
                />
                <span className="slideshow-theme-label">{theme.label}</span>
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
