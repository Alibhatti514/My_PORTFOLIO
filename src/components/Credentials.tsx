import { useEffect, useRef, useState } from "react";
import credentials from "../data/certificates.json";
type Credential = (typeof credentials)[number];
export function IssuerMark({ issuer }: { issuer: string }) {
  return (
    <span
      className={`issuer-mark issuer-${issuer.split(" ")[0].toLowerCase()}`}
      aria-hidden="true"
    >
      {issuer === "Microsoft" ? (
        <>
          <i />
          <i />
          <i />
          <i />
        </>
      ) : issuer === "Meta" ? (
        "∞"
      ) : issuer === "University of London" ? (
        "UL"
      ) : issuer === "Duke University" ? (
        "D"
      ) : (
        "P"
      )}
    </span>
  );
}
export default function Credentials() {
  const [query, setQuery] = useState(""),
    [issuer, setIssuer] = useState("All issuers"),
    [kind, setKind] = useState("All types"),
    [selected, setSelected] = useState<Credential | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (selected) dialog.current?.showModal();
    else dialog.current?.close();
  }, [selected]);
  const filtered = credentials.filter(
    (c) =>
      (issuer === "All issuers" || c.issuer === issuer) &&
      (kind === "All types" || c.type === kind) &&
      `${c.title} ${c.issuer} ${c.type}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  return (
    <>
      <section id="credentials" className="section credentials-section">
        <div className="section-top">
          <span className="eyebrow">05 / CONTINUOUS LEARNING</span>
          <span className="mono">EVIDENCE, NOT JUST ENTHUSIASM.</span>
        </div>
        <div className="section-heading">
          <h2>
            Curiosity.
            <br />
            <em>With credentials.</em>
          </h2>
          <p>
            Completed programs in full stack engineering, modern frameworks, and
            the foundations behind them.
          </p>
        </div>
        <div className="featured-credentials">
          {credentials
            .filter((c) => c.featured)
            .sort((a, b) => a.type.localeCompare(b.type))
            .map((c) => (
              <article className="credential-card" key={c.id}>
                <div className="credential-card-top">
                  <IssuerMark issuer={c.issuer} />
                  <span className="mono">
                    {c.type === "Professional Certificate"
                      ? "PROFESSIONAL"
                      : "SPECIALIZATION"}
                  </span>
                </div>
                <span className="credential-issuer">{c.issuer}</span>
                <h3>{c.title}</h3>
                <div className="credential-bottom">
                  <span className="mono">{c.date}</span>
                  <button
                    onClick={() => setSelected(c)}
                    aria-label={`Preview ${c.title}`}
                  >
                    View credential <span aria-hidden="true">↗</span>
                  </button>
                </div>
              </article>
            ))}
        </div>
        <a className="text-link" href="#archive">
          Explore all {credentials.length} credentials{" "}
          <span aria-hidden="true">↓</span>
        </a>
      </section>
      <section id="archive" className="section archive-section">
        <div className="section-top">
          <span className="eyebrow">THE COMPLETE COLLECTION</span>
          <span className="mono">
            {credentials.length} CREDENTIALS / 5 ISSUERS
          </span>
        </div>
        <div className="archive-heading">
          <h2>
            Learning archive<span>.</span>
          </h2>
          <p>
            Courses, guided projects, specializations, and professional
            certificates. Preview the original or download a copy.
          </p>
        </div>
        <div className="archive-controls">
          <label>
            <span>Search credentials</span>
            <input
              aria-label="Search credentials"
              type="search"
              placeholder="Search by title, issuer, or topic…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <label>
            <span>Issuer</span>
            <select
              aria-label="Issuer"
              value={issuer}
              onChange={(e) => setIssuer(e.target.value)}
            >
              {[
                "All issuers",
                ...new Set(credentials.map((c) => c.issuer)),
              ].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>
          <label>
            <span>Credential type</span>
            <select
              aria-label="Credential type"
              value={kind}
              onChange={(e) => setKind(e.target.value)}
            >
              {[
                "All types",
                "Professional Certificate",
                "Specialization",
                "Course",
                "Guided Project",
              ].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>
        </div>
        <p className="archive-count mono" role="status">
          {filtered.length} OF {credentials.length} CREDENTIALS
          {query && ` / “${query}”`}
        </p>
        <div
          className="archive-list"
          tabIndex={0}
          role="region"
          aria-label="Certificate search results"
        >
          {filtered.map((c) => (
            <article className="archive-row" key={c.id}>
              <IssuerMark issuer={c.issuer} />
              <div>
                <span className="mono">
                  {c.issuer} · {c.type}
                </span>
                <h3>{c.title}</h3>
              </div>
              <time>{c.date}</time>
              <button
                onClick={() => setSelected(c)}
                aria-label={`Preview ${c.title}`}
              >
                Preview <span aria-hidden="true">↗</span>
              </button>
              <a
                href={c.downloadPath}
                download={`${c.id}.pdf`}
                aria-label={`Download ${c.title} PDF`}
              >
                PDF <span aria-hidden="true">↓</span>
              </a>
            </article>
          ))}
          {!filtered.length && (
            <div className="empty-state">
              <h3>No matching credentials.</h3>
              <p>Try another topic or reset the filters.</p>
              <button
                className="button secondary"
                onClick={() => {
                  setQuery("");
                  setIssuer("All issuers");
                  setKind("All types");
                }}
              >
                Reset filters ↻
              </button>
            </div>
          )}
        </div>
        <p className="archive-note">
          Original completion documents with issuer verification links. Program
          certificates are separate from individual course certificates.
        </p>
      </section>
      <dialog
        ref={dialog}
        className="credential-dialog"
        aria-labelledby="credential-title"
        onCancel={() => setSelected(null)}
        onClick={(e) => {
          if (e.target === e.currentTarget) setSelected(null);
        }}
      >
        {selected && (
          <>
            <div className="dialog-heading">
              <span className="eyebrow">
                {selected.issuer} / {selected.type}
              </span>
              <button
                className="close-dialog"
                onClick={() => setSelected(null)}
                aria-label="Close certificate preview"
              >
                ×
              </button>
            </div>
            <h2 id="credential-title">{selected.title}</h2>
            <img
              src={selected.preview}
              alt={`Original ${selected.title} certificate awarded to Muhammad Ali Ejaz Bhatti`}
            />
            <div className="dialog-actions">
              <span>{selected.date}</span>
              <a
                className="button secondary"
                href={selected.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                Issuer verification ↗
              </a>
              <a
                className="button"
                href={selected.downloadPath}
                download={`${selected.id}.pdf`}
              >
                Download PDF ↓
              </a>
            </div>
          </>
        )}
      </dialog>
    </>
  );
}
