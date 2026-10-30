export interface SocialProfile {
  readonly id: string;
  readonly label: string;
  readonly href: string;
  readonly icon: string;
}

/** Preserve the supplied destinations verbatim, including their query strings. */
export const socials = [
  {
    id: 'linkedin',
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/muhammad-ali-ejaz-bhatti-629676442/',
    icon: '/assets/brands/linkedin.svg',
  },
  {
    id: 'freelancer',
    label: 'Freelancer',
    href: 'https://www.freelancer.com/u/Devalibhatti?sb=t@Devalibhatti%27s',
    icon: '/assets/brands/freelancer.svg',
  },
  {
    id: 'github',
    label: 'GitHub',
    href: 'https://github.com/Alibhatti514',
    icon: '/assets/brands/github.svg',
  },
  {
    id: 'fiverr',
    label: 'Fiverr',
    href: 'https://www.fiverr.com/dev_alibhatti?public_mode=true',
    icon: '/assets/brands/fiverr.svg',
  },
  {
    id: 'upwork',
    label: 'Upwork',
    href: 'https://www.upwork.com/freelancers/~01d8521e683ca03553?companyReference=1966580391923811613&mp_source=share',
    icon: '/assets/brands/upwork.svg',
  },
] as const satisfies readonly SocialProfile[];
