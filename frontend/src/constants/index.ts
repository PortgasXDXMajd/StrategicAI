interface NavbarLink {
  label: string;
  route: string;
  icon?: string;
}

export const navbarLinks: NavbarLink[] = [];

export const themes = [
  { value: 'dark', label: 'Dark', icon: 'material-symbols:dark-mode' },
  { value: 'light', label: 'Light', icon: 'material-symbols:light-mode' },
  {
    value: 'system',
    label: 'System',
    icon: 'material-symbols:computer-outline',
  },
];

export const appConfig = {
  appName: 'StrategicAI',
  hideCreatedBy: true,
  appDescription: 'A simple Next.js starter template',
  appKeywords: 'next.js, typescript, tailwindcss, eslint, prettier',
};
