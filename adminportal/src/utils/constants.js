export const PAGE_TYPES = {
  ABOUT: 'about',
  TERMS: 'terms',
  PRIVACY: 'privacy',
  BLOG: 'blog',
  CUSTOM: 'custom',
};

export const PAGE_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
};

export const PAGE_TYPE_OPTIONS = [
  { value: PAGE_TYPES.ABOUT, label: 'About Us' },
  { value: PAGE_TYPES.TERMS, label: 'Terms & Conditions' },
  { value: PAGE_TYPES.PRIVACY, label: 'Privacy Policy' },
  { value: PAGE_TYPES.BLOG, label: 'Blog Post' },
  { value: PAGE_TYPES.CUSTOM, label: 'Custom Page' },
];

export const PAGE_STATUS_OPTIONS = [
  { value: PAGE_STATUS.DRAFT, label: 'Draft' },
  { value: PAGE_STATUS.PUBLISHED, label: 'Published' },
  { value: PAGE_STATUS.ARCHIVED, label: 'Archived' },
];
