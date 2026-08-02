/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Warm paper base — never pure white.
        ivory: '#F6F2EA',
        paper: '#FCFAF5',
        sand: '#EDE6DA',
        /** Deep forest ink — the text colour, not black. */
        ink: {
          DEFAULT: '#1B2A22',
          soft: '#41544A',
          // 4.67:1 on ivory, 5.00:1 on paper — clears WCAG AA for small text.
          muted: '#627066',
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
        hairline: 'rgba(27, 42, 34, 0.14)',
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
