import { useState } from 'react';

type ContactFormProps = {
  email: string;
};

export default function ContactForm({ email }: ContactFormProps) {
  const [copied, setCopied] = useState(false);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(email);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = email;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const mailto = `mailto:${email}?subject=${encodeURIComponent(
    name ? `Hello from ${name} — via portfolio` : 'Hello via portfolio',
  )}&body=${encodeURIComponent(message)}`;

  return (
    <div className="mt-6 space-y-4">
      <div className="flex flex-wrap gap-3">
        <a
          href={`mailto:${email}`}
          className="inline-flex items-center gap-2 rounded-full border border-[#7DD3A7]/40 bg-[#7DD3A7]/10 px-4 py-2 text-sm font-medium text-[#F5F5F5] transition-colors hover:bg-[#7DD3A7]/15"
        >
          {email}
        </a>
        <button
          type="button"
          onClick={copyEmail}
          aria-live="polite"
          className="mono inline-flex items-center gap-2 rounded-full border border-[#262626] bg-[#111111] px-4 py-2 text-[11px] uppercase tracking-[0.14em] text-[#A1A1A1] transition-colors hover:border-[#3a3a3a] hover:text-[#F5F5F5]"
        >
          {copied ? 'Copied ✓' : 'Copy email'}
        </button>
      </div>

      <form
        className="grid gap-3 rounded-2xl border border-[#262626] bg-[#0A0A0A] p-4"
        onSubmit={(e) => {
          e.preventDefault();
          window.location.href = mailto;
        }}
      >
        <label className="grid gap-1.5">
          <span className="mono text-[10px] uppercase tracking-[0.18em] text-[#A1A1A1]">Your name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jane Doe"
            autoComplete="name"
            className="w-full rounded-md border border-[#262626] bg-[#111111] px-3 py-2.5 text-sm text-[#F5F5F5] outline-none transition-colors placeholder:text-[#8a8a8a] focus:border-[#7DD3A7]"
          />
        </label>
        <label className="grid gap-1.5">
          <span className="mono text-[10px] uppercase tracking-[0.18em] text-[#A1A1A1]">Message</span>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="What do you want to build?"
            rows={3}
            required
            className="w-full resize-y rounded-md border border-[#262626] bg-[#111111] px-3 py-2.5 text-sm text-[#F5F5F5] outline-none transition-colors placeholder:text-[#8a8a8a] focus:border-[#7DD3A7]"
          />
        </label>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="mono text-[10px] uppercase tracking-[0.14em] text-[#8a8a8a]">
            Opens your mail app · replies within ~2 days (WIB)
          </p>
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-full border border-[#7DD3A7]/40 bg-[#7DD3A7]/10 px-5 py-2.5 text-sm font-medium text-[#F5F5F5] transition-colors hover:bg-[#7DD3A7]/15"
          >
            Compose email
          </button>
        </div>
      </form>
    </div>
  );
}
