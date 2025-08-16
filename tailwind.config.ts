import type { Config } from 'tailwindcss'
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: { extend: {
    colors: {
      bg: '#0d1021',
      surface: '#1b1f3b',
      surface2: '#262b52',
      text: '#e7e9ff',
      muted: '#a2a7d4',
      accent: '#6f6cf6',
      accent2: '#b06bf3',
      ctaStart: '#7a6cf9',
      ctaEnd: '#ff9f68'
    },
    boxShadow: {
      neu: '0 10px 25px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.05)',
      glow: '0 0 24px rgba(177,151,255,.45)'
    },
    borderRadius: { '2xl': '1rem' },} },
  plugins: [],
}
export default config
