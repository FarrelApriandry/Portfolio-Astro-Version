import { useEffect, useMemo, useState } from 'react';
import { ActivityCalendar } from 'react-activity-calendar';
import type { Activity } from 'react-activity-calendar';
import 'react-activity-calendar/tooltips.css';
import { ArrowUpRight } from 'lucide-react';

// Served via our own /api/github-activity proxy (edge-cached 6h) so a
// third-party outage degrades to a cached/empty graph instead of a
// client-side error, and the username can't be tampered with client-side.
const API_BASE = '/api/github-activity';

// Five-level green ramp tuned to the site palette:
// surface-elevated -> accent-dark ramp -> accent (#7DD3A7)
const THEME_DARK = ['#161616', '#1d3a2d', '#2a5a44', '#3f8f70', '#7dd3a7'];

type Status = 'loading' | 'ready' | 'error';

type GitHubActivityProps = {
  username: string;
};

function parseDateKey(key: string): Date {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function formatTooltipDate(key: string): string {
  return parseDateKey(key).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function clampLevel(level: number): number {
  if (Number.isNaN(level)) return 0;
  return Math.min(4, Math.max(0, Math.round(level)));
}

function computeStats(data: Activity[]) {
  let total = 0;
  let longest = 0;
  let run = 0;

  for (const day of data) {
    total += day.count;
    if (day.count > 0) {
      run += 1;
      longest = Math.max(longest, run);
    } else {
      run = 0;
    }
  }

  // Current streak: walk back from the end, skipping today/future days
  // that simply have no contributions recorded yet.
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  let end = data.length - 1;
  while (end >= 0 && data[end].count === 0 && parseDateKey(data[end].date) >= startOfToday) {
    end -= 1;
  }

  let current = 0;
  for (let i = end; i >= 0 && data[i].count > 0; i -= 1) {
    current += 1;
  }

  return { total, current, longest };
}

export default function GitHubActivity({ username }: GitHubActivityProps) {
  const [year, setYear] = useState('last');
  const [data, setData] = useState<Activity[]>([]);
  const [status, setStatus] = useState<Status>('loading');

  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const options = [{ value: 'last', label: 'Last 12 mo' }];
    for (let y = currentYear; y >= currentYear - 5; y -= 1) {
      options.push({ value: String(y), label: String(y) });
    }
    return options;
  }, []);

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');

    fetch(`${API_BASE}?y=${year}`)
      .then((response) => {
        if (!response.ok) throw new Error(`GitHub activity API responded with ${response.status}`);
        return response.json() as Promise<{ contributions?: Activity[] }>;
      })
      .then((json) => {
        if (cancelled) return;
        const contributions = (json.contributions ?? []).map((day) => ({
          date: day.date,
          count: day.count,
          level: clampLevel(day.level),
        }));
        setData(contributions);
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, [username, year]);

  const stats = useMemo(() => computeStats(data), [data]);
  const profileUrl = `https://github.com/${username}`;

  const statItems = [
    { label: 'Contributions', value: stats.total.toLocaleString('en-US') },
    { label: 'Current streak', value: `${stats.current}d` },
    { label: 'Longest streak', value: `${stats.longest}d` },
  ];

  return (
    <section id="activity" className="scroll-mt-28 pb-28 md:pb-36">
      <div className="mb-12 max-w-2xl md:mb-16">
        <p className="mono text-[11px] uppercase tracking-[0.24em] text-[#7DD3A7]">Open Source</p>
        <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-[#F5F5F5] md:text-5xl">
          Shipped work, day by day.
        </h2>
      </div>

      <div className="mb-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
          {statItems.map((stat) => (
            <div key={stat.label}>
              <p className="text-3xl font-semibold tracking-[-0.03em] text-[#F5F5F5]">
                {status === 'loading' ? '—' : stat.value}
              </p>
              <p className="mt-1 text-[13px] text-[#8a8a8a]">{stat.label}</p>
            </div>
          ))}
          <a
            href={profileUrl}
            target="_blank"
            rel="noreferrer"
            className="group inline-flex items-center gap-1.5 text-sm text-[#A1A1A1] transition-colors hover:text-[#F5F5F5]"
          >
            github.com/{username}
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>
        </div>

        <div className="flex flex-wrap gap-2" role="group" aria-label="Select year">
          {yearOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setYear(option.value)}
              aria-pressed={year === option.value}
              className={`min-h-[40px] rounded-full border px-4 text-sm transition-colors ${
                year === option.value
                  ? 'border-[#7DD3A7]/50 bg-[#7DD3A7]/10 text-[#F5F5F5]'
                  : 'border-[#262626] text-[#A1A1A1] hover:border-[#3a3a3a] hover:text-[#F5F5F5]'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="github-activity-calendar__scroll overflow-x-auto pb-2">
        {status === 'error' ? (
          <div className="flex min-h-[180px] flex-col items-center justify-center gap-3 rounded-2xl border border-[#262626] p-6 text-center">
            <p className="text-sm text-[#D4D4D4]">Could not load the contribution graph right now.</p>
            <button
              type="button"
              onClick={() => setYear((current) => current)}
              className="min-h-[40px] rounded-full border border-[#7DD3A7]/50 bg-[#7DD3A7]/10 px-5 text-sm text-[#F5F5F5] transition-colors hover:bg-[#7DD3A7]/15"
            >
              Retry
            </button>
          </div>
        ) : status === 'ready' && data.length === 0 ? (
          <div className="flex min-h-[180px] items-center justify-center rounded-2xl border border-[#262626] p-6">
            <p className="text-sm text-[#8a8a8a]">No contributions recorded in this period.</p>
          </div>
        ) : status === 'ready' ? (
          <ActivityCalendar
            data={data}
            theme={{ dark: THEME_DARK }}
            colorScheme="dark"
            blockSize={12}
            blockMargin={4}
            blockRadius={3}
            fontSize={12}
            showWeekdayLabels={['mon', 'wed', 'fri']}
            showTotalCount={false}
            showColorLegend={false}
            className="github-activity-calendar"
            tooltips={{
              activity: {
                text: (activity: Activity) =>
                  `${activity.count} contribution${activity.count === 1 ? '' : 's'} on ${formatTooltipDate(activity.date)}`,
              },
            }}
          />
        ) : (
          <div
            className="grid animate-pulse grid-flow-col grid-rows-7 gap-1"
            role="status"
            aria-label="Loading contribution graph"
          >
            {Array.from({ length: 26 * 7 }).map((_, index) => (
              <span
                key={index}
                className="inline-block h-[10px] w-[10px] rounded-[3px] border border-white/5 bg-[#161616]"
              />
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 flex items-center gap-2 border-t border-[#1F1F1F] pt-5">
        <span className="text-[13px] text-[#8a8a8a]">Less</span>
        <span className="flex items-center gap-1" aria-hidden="true">
          {THEME_DARK.map((color) => (
            <span
              key={color}
              className="inline-block h-[10px] w-[10px] rounded-[3px] border border-white/5"
              style={{ backgroundColor: color }}
            />
          ))}
        </span>
        <span className="text-[13px] text-[#8a8a8a]">More</span>
      </div>
    </section>
  );
}
