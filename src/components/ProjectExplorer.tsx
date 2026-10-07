import { useMemo, useState } from 'react';
import { Code2, ExternalLink, Filter, Gamepad2, ImageOff, Layers3, TerminalSquare } from 'lucide-react';
import type { Project } from '../lib/db';

export type FilterKey = 'All' | 'Web & Systems' | 'Game Dev' | 'Tools / CLI';

/**
 * Slim card payload — only what the explorer renders. Built server-side
 * via toCardData() so heavy case-study fields (problem/solution/gallery)
 * never ship in island props. bucket/impact are precomputed, so the
 * client only filters.
 */
export type ProjectCardData = Pick<
  Project,
  'id' | 'title' | 'year' | 'category' | 'role' | 'summary' | 'technologies' | 'image' | 'alt' | 'featured' | 'links'
> & {
  impact: string;
  bucket: FilterKey;
};

type ProjectExplorerProps = {
  projects: ProjectCardData[];
};

const filters: FilterKey[] = ['All', 'Web & Systems', 'Game Dev', 'Tools / CLI'];

export function toCardData(project: Project): ProjectCardData {
  const haystack = [project.title, project.category, project.summary, project.role, project.technologies.join(' ')]
    .join(' ')
    .toLowerCase();
  const bucket: FilterKey =
    haystack.includes('game') || haystack.includes('unreal') || haystack.includes('blueprint') || haystack.includes('c++')
      ? 'Game Dev'
      : haystack.includes('cli') ||
          haystack.includes('tool') ||
          haystack.includes('bot') ||
          haystack.includes('automation') ||
          haystack.includes('pipeline')
        ? 'Tools / CLI'
        : 'Web & Systems';
  const impact =
    project.architecture_notes ||
    project.role_responsibilities[0] ||
    project.summary.split('.')[0] ||
    'System-level product work';
  const { id, title, year, category, role, summary, technologies, image, alt, featured, links } = project;
  return { id, title, year, category, role, summary, technologies, image: normalizeImage(image), alt, featured, links, impact, bucket };
}

/** DB stores relative asset paths ("assets/..." without leading slash) or
 * absolute URLs. Normalize + drop paths that don't exist in public/. */
function normalizeImage(image: string | null): string | null {
  if (!image) return null;
  if (/^https?:\/\//.test(image)) return image;
  const withSlash = image.startsWith('/') ? image : `/${image}`;
  return withSlash;
}

function labelLink(key: string) {
  const normalized = key.toLowerCase();

  if (normalized === 'code') return 'Case Study';
  if (normalized === 'demo' || normalized === 'live') return 'Live Demo';
  return key.replace(/_/g, ' ');
}

function bucketIcon(bucket: FilterKey) {
  switch (bucket) {
    case 'Game Dev':
      return <Gamepad2 className="h-4 w-4" />;
    case 'Tools / CLI':
      return <TerminalSquare className="h-4 w-4" />;
    case 'Web & Systems':
      return <Code2 className="h-4 w-4" />;
    default:
      return <Layers3 className="h-4 w-4" />;
  }
}

function ProjectVisual({ project }: { project: ProjectCardData }) {
  if (project.image) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-[#262626] bg-[#0A0A0A]">
        <img
          src={project.image}
          alt={project.alt || project.title}
          className="aspect-[16/9] h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          loading="lazy"
          decoding="async"
          width={640}
          height={360}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-[240px] items-end overflow-hidden rounded-2xl border border-[#262626] bg-[radial-gradient(circle_at_top_left,rgba(125,211,167,0.14),transparent_30%),linear-gradient(180deg,#171717,#0d0d0d)] p-5">
      <div className="absolute inset-0 border border-white/5" />
      <div className="relative space-y-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#2e2e2e] bg-[#111111] text-[#7DD3A7]">
          <ImageOff className="h-5 w-5" />
        </div>
        <div>
          <p className="mono text-[10px] uppercase tracking-[0.22em] text-[#A1A1A1]">Project preview</p>
          <p className="mt-2 max-w-[14ch] text-3xl font-semibold tracking-[-0.06em] text-[#F5F5F5]">{project.title}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {project.technologies.slice(0, 3).map((technology) => (
            <span key={technology} className="mono rounded-full border border-[#262626] bg-[#111111] px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] text-[#A1A1A1]">
              {technology}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProjectCard({ project, featured = false }: { project: ProjectCardData; featured?: boolean }) {
  return (
    <article
      className={[
        'group rounded-3xl border border-[#262626] bg-[#111111] p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] transition-all duration-300 hover:-translate-y-1 hover:border-[#3a3a3a] hover:shadow-[0_20px_60px_rgba(0,0,0,0.45)]',
        featured ? 'lg:grid lg:grid-cols-[1.05fr_0.95fr] lg:gap-6' : '',
      ].join(' ')}
    >
      <div className={featured ? 'lg:order-2' : ''}>
        <ProjectVisual project={project} />
      </div>

      <div className={featured ? 'mt-6 lg:mt-0 lg:order-1 lg:flex lg:flex-col lg:justify-between' : 'mt-5'}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="mono inline-flex items-center gap-1 rounded-full border border-[#262626] bg-[#0A0A0A] px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-[#A1A1A1]">
                {bucketIcon(project.bucket)}
                {project.bucket}
              </span>
              {project.featured ? <span className="mono rounded-full border border-[#1f3f2b] bg-[#0f1b14] px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-[#7DD3A7]">Featured</span> : null}
            </div>
            <h3 className="mt-4 text-2xl font-semibold tracking-[-0.06em] text-[#F5F5F5]">{project.title}</h3>
            <p className="mt-2 text-sm uppercase tracking-[0.14em] text-[#A1A1A1]">
              {project.category} · {project.year} · {project.role}
            </p>
          </div>
          <span className="mono text-[10px] uppercase tracking-[0.18em] text-[#7DD3A7]">{project.year}</span>
        </div>

        <p className="mt-4 text-sm leading-7 text-[#D4D4D4] md:text-base">{project.summary}</p>

        <div className="mt-5 rounded-2xl border border-[#262626] bg-[#0A0A0A] p-4">
          <p className="mono text-[10px] uppercase tracking-[0.18em] text-[#A1A1A1]">Impact</p>
          <p className="mt-2 text-sm leading-6 text-[#F5F5F5]">{project.impact}</p>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {project.technologies.slice(0, 5).map((technology) => (
            <span key={technology} className="mono rounded-full border border-[#262626] px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] text-[#A1A1A1]">
              {technology}
            </span>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          {project.links
            ? Object.entries(project.links).map(([key, value]) => (
                <a
                  key={key}
                  href={value}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-[#262626] px-4 py-2 text-sm text-[#F5F5F5] transition-colors hover:border-[#3a3a3a] hover:bg-[#161616]"
                >
                  {labelLink(key)}
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              ))
            : null}
        </div>
      </div>
    </article>
  );
}

export default function ProjectExplorer({ projects }: ProjectExplorerProps) {
  // bucket/impact precomputed server-side by toCardData() — client only filters.
  const [activeFilter, setActiveFilter] = useState<FilterKey>('All');

  const filteredProjects = useMemo(
    () => (activeFilter === 'All' ? projects : projects.filter((project) => project.bucket === activeFilter)),
    [activeFilter, projects]
  );

  const featuredProject = filteredProjects.find((project) => project.featured) ?? filteredProjects[0] ?? projects[0];
  const supportingProjects = filteredProjects.filter((project) => project.id !== featuredProject?.id).slice(0, 4);

  return (
    <section className="pb-16 md:pb-20 lg:pb-24" id="projects">
      <div className="mb-8 flex flex-col gap-4 border-b border-[#262626] pb-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mono text-[11px] uppercase tracking-[0.24em] text-[#7DD3A7]">Projects</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.06em] text-[#F5F5F5] md:text-4xl">
            Product work, systems thinking, and experimental builds.
          </h2>
        </div>

        <div className="inline-flex items-center gap-2 self-start rounded-full border border-[#262626] bg-[#111111] p-1">
          <Filter className="ml-2 h-4 w-4 text-[#7DD3A7]" />
          {filters.map((filter) => (
            <button
              key={filter}
              type="button"
              aria-pressed={activeFilter === filter}
              onClick={() => setActiveFilter(filter)}
              className={[
                'rounded-full px-3 py-2 text-sm transition-colors',
                activeFilter === filter ? 'bg-[#7DD3A7] text-[#0A0A0A]' : 'text-[#A1A1A1] hover:text-[#F5F5F5]',
              ].join(' ')}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {featuredProject ? (
        <div className="space-y-6">
          <ProjectCard project={featuredProject} featured />
          {supportingProjects.length ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {supportingProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : null}
        </div>
      ) : (
        <div className="rounded-3xl border border-[#262626] bg-[#111111] p-8 text-sm text-[#A1A1A1]">No projects match the selected filter.</div>
      )}
    </section>
  );
}
