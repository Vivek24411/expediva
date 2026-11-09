/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Theme-aware tokens: light values on :root (admin), dark values under
        // html.theme-dark (the public site). Defined in src/index.css.
        ivory: 'rgb(var(--c-ivory) / <alpha-value>)',
        paper: '#FCFAF5',
        sand: 'rgb(var(--c-sand) / <alpha-value>)',
        /** Main text colour — dark ink on the light admin, warm off-white on the dark site. */
        ink: {
          DEFAULT: 'rgb(var(--c-ink) / <alpha-value>)',
          soft: 'rgb(var(--c-ink-soft) / <alpha-value>)',
          muted: 'rgb(var(--c-ink-muted) / <alpha-value>)',
        },
        /** Near-black with a warm undertone for dark sections. */
        pitch: {
          DEFAULT: '#14120F',
          soft: '#211E19',
        },
        /** The single earthy accent. */
        ember: {
          DEFAULT: '#B8501F',
          bright: '#D06026',
          deep: '#8E3C15',
        },
        moss: '#5E7355',
        hairline: 'var(--c-hairline)',
        'hairline-invert': 'rgba(246, 242, 234, 0.18)',
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // Fluid display sizes — one scale from 360px to 1600px viewports.
        'display-sm': ['clamp(2.1rem, 6vw, 3.4rem)', { lineHeight: '0.98', letterSpacing: '-0.02em' }],
        'display-md': ['clamp(2.8rem, 9vw, 5.5rem)', { lineHeight: '0.94', letterSpacing: '-0.025em' }],
        'display-lg': ['clamp(3.4rem, 13vw, 9rem)', { lineHeight: '0.88', letterSpacing: '-0.035em' }],
        eyebrow: ['0.6875rem', { lineHeight: '1', letterSpacing: '0.22em' }],
      },
      maxWidth: {
        editorial: '78rem',
        prose: '38rem',
      },
      transitionTimingFunction: {
        editorial: 'cubic-bezier(0.65, 0, 0.35, 1)',
        exit: 'cubic-bezier(0.32, 0.72, 0, 1)',
      },
      transitionDuration: {
        900: '900ms',
        1100: '1100ms',
      },
      keyframes: {
        marquee: {
          from: { transform: 'translate3d(0, 0, 0)' },
          to: { transform: 'translate3d(-50%, 0, 0)' },
        },
        'fade-up': {
          from: { opacity: '0', transform: 'translate3d(0, 12px, 0)' },
          to: { opacity: '1', transform: 'translate3d(0, 0, 0)' },
        },
      },
      animation: {
        marquee: 'marquee 48s linear infinite',
        'fade-up': 'fade-up 0.5s cubic-bezier(0.65, 0, 0.35, 1) both',
      },
    },
  },
  plugins: [],
};
