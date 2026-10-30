import { useEffect, useRef } from "react";
export interface Credential {
  id: string;
  title: string;
  issuer: string;
  type: string;
  date: string;
  url: string;
  preview: string;
  downloadPath: string;
}
export function CredentialPreview({
  credential,
  onClose,
}: {
  credential: Credential | null;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (credential && !ref.current?.open) ref.current?.showModal();
    else if (!credential) ref.current?.close();
  }, [credential]);
  return (
    <dialog
      ref={ref}
      className="preview-dialog"
      onCancel={onClose}
      aria-labelledby="preview-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {credential && (
        <>
          <div className="dialog-bar">
            <span className="eyebrow">
              {credential.issuer} / {credential.type}
            </span>
            <button onClick={onClose} aria-label="Close certificate preview">
              ×
            </button>
          </div>
          <h2 id="preview-title">{credential.title}</h2>
          <img
            src={credential.preview}
            alt={`Original certificate awarded to Muhammad Ali Ejaz Bhatti: ${credential.title}`}
          />
          <div className="dialog-actions">
            <time>{credential.date}</time>
            <a href={credential.url} target="_blank" rel="noopener noreferrer">
              Verify credential ↗
            </a>
            <a className="button" href={credential.downloadPath} download>
              Download PDF ↓
            </a>
          </div>
        </>
      )}
    </dialog>
  );
}
