import { Suspense, lazy, useEffect, useRef, useState } from 'react';
import type { Components } from 'react-markdown';

// react-markdown is heavy (~100KB) and only needed when the user opens
// the modal — split it into its own chunk loaded on first open.
const ReactMarkdown = lazy(() => import('react-markdown'));

type ResumeModalProps = {
  content: string;
};

const markdownComponents: Components = {
  h1: ({ children }) => <h1 className="text-2xl font-semibold tracking-[-0.05em] text-[#F5F5F5]">{children}</h1>,
  h2: ({ children }) => <h2 className="mt-5 text-xl font-semibold tracking-[-0.04em] text-[#F5F5F5]">{children}</h2>,
  h3: ({ children }) => <h3 className="mt-4 text-base font-semibold tracking-[-0.03em] text-[#F5F5F5]">{children}</h3>,
  p: ({ children }) => <p className="text-sm leading-7 text-[#D4D4D4]">{children}</p>,
  ul: ({ children }) => <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-[#D4D4D4]">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal space-y-2 pl-5 text-sm leading-7 text-[#D4D4D4]">{children}</ol>,
  li: ({ children }) => <li className="pl-1">{children}</li>,
  a: ({ href, children }) => (
    <a
      href={href}
      target={href?.startsWith('http') ? '_blank' : undefined}
      rel={href?.startsWith('http') ? 'noreferrer' : undefined}
      className="text-[#7DD3A7] underline decoration-[#7DD3A7]/40 underline-offset-4 hover:decoration-[#7DD3A7]"
    >
      {children}
    </a>
  ),
  strong: ({ children }) => <strong className="font-semibold text-[#F5F5F5]">{children}</strong>,
  em: ({ children }) => <em className="italic text-[#E5E5E5]">{children}</em>,
  hr: () => <hr className="my-4 border-[#262626]" />,
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-[#262626] pl-4 text-sm leading-7 text-[#A1A1A1]">{children}</blockquote>
  ),
};

export default function ResumeModal({ content }: ResumeModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        return;
      }
      // Focus trap: keep Tab cycling inside the dialog.
      if (event.key === 'Tab') {
        const root = dialogRef.current;
        if (!root) return;
        const focusables = root.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
        );
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    // Move focus into the dialog on open.
    setTimeout(() => dialogRef.current?.querySelector<HTMLElement>('button')?.focus(), 0);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
      // Return focus to the trigger on close.
      triggerRef.current?.focus();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  return (
    <>
      <button
        type="button"
        ref={triggerRef}
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center justify-center rounded-md border border-[#262626] bg-[#111111] px-4 py-2 text-sm font-medium text-[#F5F5F5] transition-colors hover:border-[#3a3a3a] hover:bg-[#161616]"
      >
        View Resume
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm" onClick={() => setIsOpen(false)}>
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="resume-modal-title"
            onClick={(event) => event.stopPropagation()}
            className="flex max-h-[min(90vh,900px)] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-[#262626] bg-[#0d0d0d] shadow-2xl shadow-black/50"
          >
            <div className="flex items-start justify-between gap-4 border-b border-[#262626] px-5 py-4">
              <div>
                <p className="mono text-[10px] uppercase tracking-[0.22em] text-[#7DD3A7]">Resume</p>
                <h2 id="resume-modal-title" className="mt-1 text-xl font-semibold tracking-[-0.04em] text-[#F5F5F5]">
                  Curriculum Vitae
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-md border border-[#262626] px-3 py-1.5 text-sm text-[#F5F5F5] transition-colors hover:border-[#3a3a3a] hover:bg-[#161616]"
              >
                Close
              </button>
            </div>

            <div className="overflow-y-auto px-5 py-5">
              <div className="rounded-xl border border-[#262626] bg-[#0A0A0A] p-5">
                {content.trim() ? (
                  <div className="space-y-4">
                    <Suspense
                      fallback={
                        <p className="mono text-[11px] uppercase tracking-[0.16em] text-[#8a8a8a]">
                          Loading resume…
                        </p>
                      }
                    >
                      <ReactMarkdown components={markdownComponents}>{content}</ReactMarkdown>
                    </Suspense>
                  </div>
                ) : (
                  <p className="text-sm leading-7 text-[#A1A1A1]">CV markdown belum diisi.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
