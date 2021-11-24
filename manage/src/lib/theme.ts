/**
 * The functions here are for tracking and setting the current theme.
 * localStorage is used to store the currently preferred them, though
 * that doesn't work on the server, where we just use a default.
 */

const selector = 'link[data-name="eui-theme"]';
export const defaultTheme = 'light';

function getThemes(): HTMLLinkElement[] {
  // @ts-ignore
  return [...document.querySelectorAll(selector)];
}

export function setTheme(name: string): void {
  localStorage.setItem('theme', name);

  for (const theme of getThemes()) {
    theme.disabled = theme.dataset.theme !== name;
  }
}

export function getTheme(): string {
  const storedTheme = localStorage.getItem('theme');

  return storedTheme || defaultTheme;
}

export function setInitialTheme(): string {
  if (typeof window !== 'object') {
    return defaultTheme;
  }

  const theme = getTheme();
  setTheme(theme);
  return theme;
}

export interface Theme {
  id: string;
  name: string;
  publicPath: string;
}

// This is supplied to the app as JSON by Webpack - see next.config.js
export interface ThemeConfig {
  availableThemes: Array<Theme>;
  copyConfig: Array<{
    from: string;
    to: string;
  }>;
}

// The config is generated during the build and made available in a JSON string.
export const themeConfig: ThemeConfig =
  typeof process.env.THEME_CONFIG === 'string'
    ? JSON.parse(process.env.THEME_CONFIG!)
    : process.env.THEME_CONFIG;
