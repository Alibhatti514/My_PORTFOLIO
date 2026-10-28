import { useEffect, useRef, useState } from "react";
import certificates from "../data/certificates.json";
import { CredentialPreview } from "./CredentialPreview";
export { CredentialPreview, type Credential } from "./CredentialPreview";
import type { Credential } from "./CredentialPreview";
export default function CredentialLibrary({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null),
    [query, setQuery] = useState(""),
    [issuer, setIssuer] = useState("All issuers"),
    [type, setType] = useState("All types"),
    [preview, setPreview] = useState<Credential | null>(null);
  useEffect(() => {
    if (open && !ref.current?.open) ref.current?.showModal();
    else if (!open) ref.current?.close();
  }, [open]);
  const results = certificates.filter(
    (c) =>
      (issuer === "All issuers" || c.issuer === issuer) &&
      (type === "All types" || c.type === type) &&
      `${c.title} ${c.issuer}`.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <>
      <dialog
        ref={ref}
        className="library-dialog"
        onCancel={onClose}
        aria-labelledby="library-title"
      >
        <div className="dialog-bar">
          <span className="eyebrow">
            THE COMPLETE COLLECTION / 40 ORIGINAL DOCUMENTS
          </span>
          <button onClick={onClose} aria-label="Close certificate library">
            ×
          </button>
        </div>
        <h2 id="library-title">
          A record of <em>curiosity.</em>
        </h2>
        <p>
          Professional programs, specializations, courses and guided projects.
          Every original, in one place.
        </p>
        <div className="library-filters">
          <label>
            Search credentials
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Title, institution, technology…"
            />
          </label>
          <label>
            Issuer
            <select
              aria-label="Issuer"
              value={issuer}
              onChange={(e) => setIssuer(e.target.value)}
            >
              {[
                "All issuers",
                ...new Set(certificates.map((c) => c.issuer)),
              ].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <label>
            Credential type
            <select
              aria-label="Credential type"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              {[
                "All types",
                "Professional Certificate",
                "Specialization",
                "Course",
                "Guided Project",
              ].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
        </div>
        <p className="mono" role="status">
          {results.length} OF 40 CREDENTIALS
        </p>
        <div className="library-results">
          {results.map((c) => (
            <article className="library-row" key={c.id}>
              <button
                className="preview-thumb"
                onClick={() => setPreview(c)}
                aria-label={`Preview ${c.title}`}
              >
                <img src={c.preview} alt="" loading="lazy" />
              </button>
              <div>
                <span className="eyebrow">
                  {c.issuer} · {c.type}
                </span>
                <h3>{c.title}</h3>
                <time>{c.date}</time>
              </div>
              <div className="row-actions">
                <button
                  onClick={() => setPreview(c)}
                  aria-label={`Inspect ${c.title}`}
                >
                  Preview ↗
                </button>
                <a
                  href={c.downloadPath}
                  download
                  aria-label={`Download ${c.title}`}
                >
                  PDF ↓
                </a>
                <a
                  href={c.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Verify ${c.title}`}
                >
                  Verify ↗
                </a>
              </div>
            </article>
          ))}
          {!results.length && (
            <div className="empty-state">
              <h3>No matching credentials</h3>
              <button
                className="button"
                onClick={() => {
                  setQuery("");
                  setIssuer("All issuers");
                  setType("All types");
                }}
              >
                Reset filters
              </button>
            </div>
          )}
        </div>
      </dialog>
      <CredentialPreview
        credential={preview}
        onClose={() => setPreview(null)}
      />
    </>
  );
}
