/** V13 single palette source shared by Three.js and the generated CSS custom properties. */
export const atelier = {
  obsidian:'#101419', graphite:'#1B2229', porcelain:'#F4F0E8', copper:'#D78B60',
  teal:'#73B4AE', glass:'#283139', titanium:'#56616A',
} as const;
export function installAtelierTokens() {
  for(const [name,value] of Object.entries(atelier))document.documentElement.style.setProperty(`--atelier-${name}`,value);
}
