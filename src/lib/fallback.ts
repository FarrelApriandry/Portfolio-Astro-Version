import type {
  Award,
  Education,
  Experience,
  IntellectualProperty,
  Profile,
  Project,
  SkillGroup,
  Social,
} from './db';

// Static portfolio snapshot used when the database is unreachable.
// Keeps the public site (and admin read views) alive instead of 500-ing.
// Keep roughly in sync with production DB content.

export function getFallbackPortfolioData(): {
  profile: Profile | null;
  socials: Social[];
  skillGroups: SkillGroup[];
  experiences: Experience[];
  educations: Education[];
  projects: Project[];
  awards: Award[];
  intellectualProperties: IntellectualProperty[];
  degraded: boolean;
} {
  const profile: Profile = {
    id: 1,
    name: 'Farrel Apriandry',
    role: 'Full-Stack TypeScript / Software Engineer',
    value_statement:
      'I build complete software systems — from frontend interfaces and backend APIs to databases, infrastructure, and developer tooling.',
    status: 'Open to opportunities',
    location: 'Magelang, Indonesia',
    email: 'fapriandry@gmail.com',
    resume: '/resume.pdf',
  };

  const socials: Social[] = [
    { id: 1, profile_id: 1, platform: 'github', url: 'https://github.com/FarrelApriandry', icon: null },
    { id: 2, profile_id: 1, platform: 'linkedin', url: 'https://linkedin.com/in/farrelapriandry', icon: null },
    { id: 3, profile_id: 1, platform: 'email', url: 'mailto:fapriandry@gmail.com', icon: null },
  ];

  const skillGroups: SkillGroup[] = [
    { id: 1, label: 'Languages', items: ['TypeScript', 'JavaScript', 'Python', 'SQL', 'C++', 'Kotlin', 'PHP'] },
    { id: 2, label: 'Web & Backend', items: ['Node.js', 'Express', 'React', 'Next.js', 'Astro', 'REST APIs'] },
    { id: 3, label: 'Data & Infra', items: ['PostgreSQL', 'MySQL', 'Prisma', 'Drizzle', 'Docker', 'Git'] },
    { id: 4, label: 'Practices', items: ['System Architecture', 'Code Review', 'Algorithm Analysis', 'Technical Documentation'] },
    { id: 5, label: 'Other Domains', items: ['Unreal Engine 5', 'Flutter', 'Cybersecurity Fundamentals'] },
  ];

  const experiences: Experience[] = [
    {
      id: 1,
      role: 'Full-Stack & DevOps Engineer',
      company: 'Universitas Tidar',
      period: 'Dec 2024 — Present',
      description:
        'Architected and deployed the centralized HAKI (intellectual property) submission platform with Astro, Express, PostgreSQL, Prisma, and Docker.',
      sort_order: 1,
    },
    {
      id: 2,
      role: 'Lead Game Developer (P2MW Grant)',
      company: 'Nusantara: Pasar Bubrah',
      period: 'Jul 2025 — Dec 2025',
      description:
        'Led a 5-person team building an interactive game in Unreal Engine 5 with modular event-driven systems in C++ and Blueprints.',
      sort_order: 2,
    },
    {
      id: 3,
      role: 'Mobile Developer Intern',
      company: 'PT Teknoreka Inovasi Nusantara',
      period: 'Dec 2023 — May 2024',
      description:
        'Developed native Android applications in Kotlin with RESTful API integration for low-latency client-server communication.',
      sort_order: 3,
    },
    {
      id: 4,
      role: 'Game Developer Intern',
      company: 'PT Bodha Dharmaja Aryadhana',
      period: 'Oct 2022 — Feb 2023',
      description:
        'Engineered multiplayer networking mechanics, state synchronization, and data validation protocols in Unreal Engine.',
      sort_order: 4,
    },
  ];

  const educations: Education[] = [
    {
      id: 1,
      period: '2024 — Present',
      institution: 'Universitas Tidar',
      degree: 'S1 Teknologi Informasi (Information Technology)',
      details: 'Focus: Software Engineering, Systems Architecture, and Web Engineering.',
      sort_order: 1,
    },
    {
      id: 2,
      period: '2021 — 2024',
      institution: 'SMK Negeri 2 Kota Magelang',
      degree: 'Rekayasa Perangkat Lunak (RPL)',
      details: 'Head of Game Development Community; Brandoville Academy Game Development Bootcamp (Unreal Engine).',
      sort_order: 2,
    },
  ];

  const projects: Project[] = [
    {
      id: 'haki-untidar',
      title: 'HAKI-Untidar',
      year: 2025,
      category: 'Web Platform',
      role: 'Full-Stack & DevOps Engineer',
      summary: 'Centralized institutional intellectual-property submission platform replacing manual faculty workflows.',
      problem: 'Faculty IP submissions were handled manually with no central tracking.',
      solution: 'Built an end-to-end submission and review platform with role-based access control.',
      technologies: ['Astro', 'Express', 'PostgreSQL', 'Prisma', 'Docker'],
      image: null,
      alt: 'HAKI-Untidar platform',
      featured: true,
      links: { code: 'https://github.com/FarrelApriandry' },
      role_responsibilities: ['System architecture', 'Database schema design', 'REST API', 'Docker deployment'],
      architecture_notes: 'Astro frontend, Express REST API, PostgreSQL via Prisma ORM, JWT RBAC, containerized with Docker.',
      gallery: [],
    },
    {
      id: 'nusantara-pasar-bubrah',
      title: 'Nusantara: Pasar Bubrah',
      year: 2025,
      category: 'Game',
      role: 'Lead Game Developer',
      summary: 'P2MW national-grant-funded interactive game built in Unreal Engine 5.',
      problem: 'Needed an engaging cultural game experience delivered by a small student team.',
      solution: 'Led 5 engineers with modular event-driven systems and clear state management.',
      technologies: ['Unreal Engine 5', 'C++', 'Blueprints', 'Blender'],
      image: null,
      alt: 'Nusantara Pasar Bubrah game',
      featured: false,
      links: {},
      role_responsibilities: ['Team leadership', 'Gameplay systems', 'State management'],
      architecture_notes: 'Modular event-driven gameplay systems with C++ core logic and Blueprint scripting.',
      gallery: [],
    },
    {
      id: 'golekduit',
      title: 'GolekDuit',
      year: 2024,
      category: 'Data Pipeline',
      role: 'Developer',
      summary: 'Automated IDX stock-analysis data pipeline with a Telegram bot interface.',
      problem: 'Manual stock screening is slow and inconsistent.',
      solution: 'Automated technical-indicator pipeline pushing signals to Telegram.',
      technologies: ['Python', 'Pandas', 'TA-Lib', 'Telegram Bot API'],
      image: null,
      alt: 'GolekDuit stock pipeline',
      featured: false,
      links: {},
      role_responsibilities: ['Data pipeline', 'Bot development'],
      architecture_notes: 'Scheduled Pandas/TA-Lib analysis pipeline with Telegram delivery.',
      gallery: [],
    },
    {
      id: 'web-vocational',
      title: 'Web-VocaTIonal',
      year: 2024,
      category: 'Web Platform',
      role: 'Full-Stack Developer',
      summary: 'Student grievance reporting system with encrypted tracking codes.',
      problem: 'Student complaints had no transparent tracking channel.',
      solution: 'Built a reporting portal with encrypted ticket tracking.',
      technologies: ['PHP', 'MySQL', 'Docker', 'Tailwind CSS'],
      image: null,
      alt: 'Web-VocaTIonal reporting system',
      featured: false,
      links: {},
      role_responsibilities: ['Full-stack development', 'Encrypted tracking'],
      architecture_notes: 'PHP + MySQL monolith with encrypted ticket identifiers, containerized with Docker.',
      gallery: [],
    },
  ];

  const awards: Award[] = [
    {
      id: 1,
      year: 2025,
      title: '3rd Place — UAD Fair',
      issuer: 'UAD Fair 2025',
      description: 'Awarded for Nusantara: Pasar Bubrah game project.',
      link: '',
    },
    {
      id: 2,
      year: 2025,
      title: 'P2MW Grant Recipient',
      issuer: 'Belmawa Kemendiktisaintek',
      description: 'National entrepreneurship funding for Nusantara: Pasar Bubrah.',
      link: '',
    },
    {
      id: 3,
      year: 2025,
      title: 'Finalist — KMI Expo',
      issuer: 'KMI Expo 2025',
      description: 'National student entrepreneurship expo finalist.',
      link: '',
    },
  ];

  const intellectualProperties: IntellectualProperty[] = [
    {
      id: 1,
      year: 2025,
      title: 'Nusantara: Pasar Bubrah — Game Cipta',
      issuer: 'PDKI Kemenkumham',
      description: 'Registered intellectual property for the Nusantara game project.',
      link: '',
      type: 'Hak Cipta',
    },
  ];

  return {
    profile,
    socials,
    skillGroups,
    experiences,
    educations,
    projects,
    awards,
    intellectualProperties,
    degraded: true,
  };
}
