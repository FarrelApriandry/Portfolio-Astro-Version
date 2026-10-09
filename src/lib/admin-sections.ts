export type SectionKey =
  | 'profile'
  | 'socials'
  | 'skill_groups'
  | 'experiences'
  | 'educations'
  | 'projects'
  | 'awards'
  | 'intellectual_properties';

export type SectionMeta = {
  key: SectionKey;
  label: string;
  description: string;
  /** One-line noun for list headings, e.g. "social link" */
  noun: string;
};

export const sections: SectionMeta[] = [
  { key: 'profile', label: 'Profile', description: 'Primary bio, role, and contact details.', noun: 'profile' },
  { key: 'socials', label: 'Socials', description: 'External links and profile icons.', noun: 'social link' },
  { key: 'skill_groups', label: 'Skill Groups', description: 'Grouped technical stack lists.', noun: 'skill group' },
  { key: 'experiences', label: 'Experiences', description: 'Professional timeline entries.', noun: 'experience' },
  { key: 'educations', label: 'Educations', description: 'Academic background entries.', noun: 'education' },
  { key: 'projects', label: 'Projects', description: 'Case-study style portfolio projects.', noun: 'project' },
  { key: 'awards', label: 'Awards', description: 'Awards and recognitions.', noun: 'award' },
  { key: 'intellectual_properties', label: 'IP Records', description: 'HKI / intellectual property records.', noun: 'IP record' },
];

export const sectionByKey = new Map(sections.map((section) => [section.key, section]));

export function isSectionKey(value: string): value is SectionKey {
  return sectionByKey.has(value as SectionKey);
}

export const successMessages: Record<string, string> = {
  'profile:create': 'Profile saved',
  'profile:update': 'Profile updated',
  'socials:create': 'Social link added',
  'socials:update': 'Social link updated',
  'socials:delete': 'Social link deleted',
  'skill_groups:create': 'Skill group added',
  'skill_groups:update': 'Skill group updated',
  'skill_groups:delete': 'Skill group deleted',
  'experiences:create': 'Experience added',
  'experiences:update': 'Experience updated',
  'experiences:delete': 'Experience deleted',
  'educations:create': 'Education added',
  'educations:update': 'Education updated',
  'educations:delete': 'Education deleted',
  'projects:create': 'Project added',
  'projects:update': 'Project updated',
  'projects:delete': 'Project deleted',
  'awards:create': 'Award added',
  'awards:update': 'Award updated',
  'awards:delete': 'Award deleted',
  'intellectual_properties:create': 'IP record added',
  'intellectual_properties:update': 'IP record updated',
  'intellectual_properties:delete': 'IP record deleted',
};
