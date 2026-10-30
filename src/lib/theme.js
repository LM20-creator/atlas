/** Palette d'une ville ou d'un quartier exposée en variables CSS (--theme-ink, --theme-gold, …). */
export function themeVariables(theme = {}) {
  return Object.fromEntries(Object.entries(theme).map(([name, value]) => [`--theme-${name}`, value]));
}
