import { useEffect, useState } from 'react';
import { Download, Menu, X } from 'lucide-react';

type NavItem = {
  label: string;
  href: string;
};

type NavbarProps = {
  brand: string;
  items: NavItem[];
  contactHref: string;
  resumeHref: string;
};

export default function Navbar({ brand, items, contactHref, resumeHref }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen]);

  return (
    <header className="sticky top-4 z-50 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1280px]">
        <div className="rounded-full border border-[#262626]/80 bg-[#0A0A0A]/75 px-4 py-3 shadow-[0_12px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl">
          <div className="flex items-center justify-between gap-4">
            <a href="#top" className="text-sm font-semibold tracking-[0.18em] uppercase text-[#F5F5F5]">
              {brand}
            </a>

            <nav aria-label="Main navigation" className="hidden items-center gap-7 lg:flex">
              {items.map((item) => (
                <a key={item.href} href={item.href} className="text-sm text-[#A1A1A1] transition-colors hover:text-[#F5F5F5]">
                  {item.label}
                </a>
              ))}
            </nav>

            <div className="hidden items-center gap-2 lg:flex">
              <a
                href={contactHref}
                className="inline-flex items-center justify-center rounded-full border border-[#262626] bg-[#111111] px-4 py-2 text-sm font-medium text-[#F5F5F5] transition-colors hover:border-[#3a3a3a] hover:bg-[#161616]"
              >
                Contact
              </a>
              <a
                href={resumeHref}
                className="inline-flex items-center gap-2 rounded-full border border-[#7DD3A7]/40 bg-[#7DD3A7]/10 px-4 py-2 text-sm font-medium text-[#F5F5F5] transition-colors hover:bg-[#7DD3A7]/15"
              >
                <Download className="h-4 w-4" />
                Download CV
              </a>
            </div>

            <button
              type="button"
              aria-label="Toggle navigation"
              aria-expanded={isOpen}
              aria-controls="mobile-nav"
              onClick={() => setIsOpen((value) => !value)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#262626] bg-[#111111] text-[#F5F5F5] transition-colors hover:border-[#3a3a3a] lg:hidden"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {isOpen ? (
          <div
            id="mobile-nav"
            className="mt-3 rounded-2xl border border-[#262626] bg-[#0A0A0A]/95 p-4 shadow-[0_18px_60px_rgba(0,0,0,0.4)] backdrop-blur-xl lg:hidden"
          >
            <nav aria-label="Mobile navigation" className="space-y-2">
              {items.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="block rounded-xl border border-[#262626] px-4 py-3 text-sm text-[#D4D4D4] transition-colors hover:border-[#3a3a3a] hover:bg-[#161616] hover:text-[#F5F5F5]"
                >
                  {item.label}
                </a>
              ))}
            </nav>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <a
                href={contactHref}
                onClick={() => setIsOpen(false)}
                className="inline-flex flex-1 items-center justify-center rounded-xl border border-[#262626] bg-[#111111] px-4 py-3 text-sm font-medium text-[#F5F5F5] transition-colors hover:border-[#3a3a3a] hover:bg-[#161616]"
              >
                Contact
              </a>
              <a
                href={resumeHref}
                onClick={() => setIsOpen(false)}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#7DD3A7]/40 bg-[#7DD3A7]/10 px-4 py-3 text-sm font-medium text-[#F5F5F5] transition-colors hover:bg-[#7DD3A7]/15"
              >
                <Download className="h-4 w-4" />
                Download CV
              </a>
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
}
