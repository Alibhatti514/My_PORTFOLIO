import { useEffect, useRef, useState } from "react";

/** Decorative scene; all meaning is also present in normal HTML. */
export default function SystemScene({ reduced }: { reduced: boolean }) {
  const host = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);
  const [interactive, setInteractive] = useState(() => innerWidth > 760);
  useEffect(() => {
    if (
      !interactive ||
      reduced ||
      new URLSearchParams(location.search).get("webgl") === "off"
    )
      return;
    let cleanup = () => {};
    let cancelled = false;
    import("../scene/system")
      .then(({ mountSystem }) => {
        if (cancelled || !host.current) return;
        try {
          cleanup = mountSystem(host.current, () => setFailed(true));
        } catch {
          setFailed(true);
        }
      })
      .catch(() => setFailed(true));
    return () => {
      cancelled = true;
      cleanup();
    };
  }, [reduced, interactive]);
  return (
    <>
      <div className="system-visual" ref={host} aria-hidden="true">
        <div className="system-grid" />
        <img
          className={`system-poster ${!interactive || reduced || failed || new URLSearchParams(location.search).get("webgl") === "off" ? "poster-visible" : ""}`}
          src="/assets/optimized/system.webp"
          alt=""
          width="650"
          height="570"
        />
        <div
          className={`static-system ${reduced || failed || new URLSearchParams(location.search).get("webgl") === "off" ? "fallback-visible" : ""}`}
        >
          <i />
          <i />
          <i />
          <i />
          <b>⌘</b>
        </div>
        <span className="scene-label label-interface">01 / INTERFACE</span>
        <span className="scene-label label-logic">02 / LOGIC</span>
        <span className="scene-label label-data">03 / DATA</span>
        <span className="scene-coordinate">FIG. 01 — THE CONNECTED STACK</span>
        <span className="scene-live">
          SYSTEM / {reduced || failed || !interactive ? "STATIC" : "EXPLORABLE"}
        </span>
      </div>
      {!interactive &&
        !reduced &&
        new URLSearchParams(location.search).get("webgl") !== "off" && (
          <button className="scene-enable" onClick={() => setInteractive(true)}>
            Explore in 3D <span aria-hidden="true">↗</span>
          </button>
        )}
    </>
  );
}
