import { useMemo, useState } from 'react';
import { Code2, ExternalLink, Gamepad2, ImageOff, TerminalSquare } from 'lucide-react';
import type { Project } from '../lib/db';

export type FilterKey = 'All' | 'Web & Systems' | 'Game Dev' | 'Tools / CLI';

/**
 * Slim card payload — only what the explorer renders. Built server-side
 * via toCardData() so heavy case-study fields (problem/solution/gallery)
 * never ship in island props. bucket is precomputed, so the client only filters.
 */
export type ProjectCardData = Pick<
  Project,
  'id' | 'title' | 'year' | 'category' | 'role' | 'summary' | 'technologies' | 'image' | 'alt' | 'featured' | 'links'
> & {
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
  const { id, title, year, category, role, summary, technologies, image, alt, featured, links } = project;
  return { id, title, year, category, role, summary, technologies, image: normalizeImage(image), alt, featured, links, bucket };
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
      return <Gamepad2 className="h-3.5 w-3.5" />;
    case 'Tools / CLI':
      return <TerminalSquare className="h-3.5 w-3.5" />;
    case 'Web & Systems':
      return <Code2 className="h-3.5 w-3.5" />;
    default:
      return null;
  }
}

function ProjectVisual({ project }: { project: ProjectCardData }) {
  if (project.image) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-[#1F1F1F] bg-[#0A0A0A]">
        <img
          src={project.image}
          alt={project.alt || project.title}
          className="aspect-[16/9] h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          loading="lazy"
          decoding="async"
          width={640}
          height={360}
        />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-[220px] items-end overflow-hidden rounded-2xl border border-[#1F1F1F] bg-[radial-gradient(circle_at_top_left,rgba(125,211,167,0.10),transparent_35%),linear-gradient(180deg,#131313,#0B0B0B)] p-5">
      <div className="relative">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#262626] bg-[#111111] text-[#7DD3A7]">
          <ImageOff className="h-4 w-4" />
        </div>
        <p className="mt-4 max-w-[16ch] text-2xl font-semibold tracking-[-0.04em] text-[#F5F5F5]">{project.title}</p>
      </div>
    </div>
  );
}

function ProjectCard({ project, featured = false }: { project: ProjectCardData; featured?: boolean }) {
  return (
    <article
      className={[
        'group flex h-full flex-col',
        featured ? 'lg:grid lg:grid-cols-[1.05fr_0.95fr] lg:gap-12' : '',
      ].join(' ')}
    >
      <div className={featured ? 'lg:order-2' : ''}>
        <ProjectVisual project={project} />
      </div>

      <div className={['flex flex-1 flex-col', featured ? 'mt-7 lg:mt-0 lg:order-1 lg:justify-center' : 'mt-5'].join(' ')}>
        <div className="flex flex-wrap items-center gap-2">
          <span className="mono inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.14em] text-[#7DD3A7]">
            {bucketIcon(project.bucket)}
            {project.bucket}
          </span>
          {project.featured ? (
            <span className="mono text-[11px] uppercase tracking-[0.14em] text-[#8a8a8a]">· Featured</span>
          ) : null}
        </div>

        <h3 className={['mt-3 font-semibold tracking-[-0.04em] text-[#F5F5F5]', featured ? 'text-3xl md:text-4xl' : 'text-2xl'].join(' ')}>
          {project.title}
        </h3>
        <p className="mt-2 text-sm text-[#8a8a8a]">
          {project.category} · {project.year} · {project.role}
        </p>

        <p className={['leading-7 text-[#A1A1A1]', featured ? 'mt-5 max-w-xl text-base' : 'mt-3 text-sm'].join(' ')}>
          {project.summary}
        </p>

        <div className="mt-5 flex flex-wrap gap-x-4 gap-y-1.5">
          {project.technologies.slice(0, 4).map((technology) => (
            <span key={technology} className="text-[13px] text-[#8a8a8a]">
              {technology}
            </span>
          ))}
        </div>

        <div className={['flex flex-wrap items-center gap-4', featured ? 'mt-8' : 'mt-auto pt-6'].join(' ')}>
          <a
            href={`/projects/${project.id}`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#F5F5F5] transition-colors hover:text-[#7DD3A7]"
          >
            Read case study
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
          {featured && project.links
            ? Object.entries(project.links).slice(0, 2).map(([key, value]) => (
                <a
                  key={key}
                  href={value}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-[#A1A1A1] transition-colors hover:text-[#F5F5F5]"
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
  // bucket precomputed server-side by toCardData() — client only filters.
  const [activeFilter, setActiveFilter] = useState<FilterKey>('All');
  const [expanded, setExpanded] = useState(false);

  const filteredProjects = useMemo(
    () => (activeFilter === 'All' ? projects : projects.filter((project) => project.bucket === activeFilter)),
    [activeFilter, projects]
  );

  const featuredProject = filteredProjects.find((project) => project.featured) ?? filteredProjects[0] ?? projects[0];
  const rest = filteredProjects.filter((project) => project.id !== featuredProject?.id);
  const supportingProjects = expanded ? rest : rest.slice(0, 4);

  return (
    <section className="scroll-mt-28 pb-28 md:pb-36" id="projects">
      <div className="mb-12 max-w-2xl md:mb-16">
        <p className="mono text-[11px] uppercase tracking-[0.24em] text-[#7DD3A7]">Projects</p>
        <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-[#F5F5F5] md:text-5xl">
          Selected work, from web platforms to game systems.
        </h2>
      </div>

      <div className="mb-10 flex flex-wrap gap-2" role="group" aria-label="Filter projects">
        {filters.map((filter) => (
          <button
            key={filter}
            type="button"
            aria-pressed={activeFilter === filter}
            onClick={() => setActiveFilter(filter)}
            className={[
              'min-h-[40px] rounded-full border px-5 text-sm transition-colors',
              activeFilter === filter
                ? 'border-[#7DD3A7]/50 bg-[#7DD3A7]/10 text-[#F5F5F5]'
                : 'border-[#262626] text-[#A1A1A1] hover:border-[#3a3a3a] hover:text-[#F5F5F5]',
            ].join(' ')}
          >
            {filter}
          </button>
        ))}
      </div>

      {featuredProject ? (
        <div className="space-y-16 md:space-y-20">
          <ProjectCard project={featuredProject} featured />
          {supportingProjects.length ? (
            <div className="grid gap-x-10 gap-y-14 md:grid-cols-2">
              {supportingProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : null}
          {rest.length > 4 ? (
            <div className="flex justify-start pt-2">
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                aria-expanded={expanded}
                className="min-h-[44px] rounded-full border border-[#262626] px-6 text-sm text-[#A1A1A1] transition-colors hover:border-[#3a3a3a] hover:text-[#F5F5F5]"
              >
                {expanded ? 'Show less' : `Show all ${rest.length} projects`}
              </button>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="rounded-2xl border border-[#262626] p-8 text-sm text-[#A1A1A1]">No projects match the selected filter.</div>
      )}
    </section>
  );
}
