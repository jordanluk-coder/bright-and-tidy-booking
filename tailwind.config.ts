import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Brand: fresh aqua-teal primary, deep navy ink, soft mint accents
        brand: {
          50: '#effcfb',
          100: '#d4f6f4',
          200: '#adece9',
          300: '#77dcd9',
          400: '#3fc4c3',
          500: '#22a8a9',
          600: '#1a878a',
          700: '#196c6f',
          800: '#19575a',
          900: '#19494c',
          950: '#082c2f',
        },
        sky: {
          50: '#f2f9fe',
          100: '#e3f1fd',
          200: '#c1e4fb',
          300: '#89cef7',
          400: '#4bb4f0',
          500: '#2199df',
          600: '#137abe',
          700: '#12619a',
          800: '#14527f',
          900: '#17456a',
        },
        mint: {
          50: '#f0fdf7',
          100: '#dcfceb',
          200: '#bbf7d7',
          300: '#86efb8',
          400: '#4ade91',
          500: '#22c470',
          600: '#16a25a',
          700: '#157f4a',
          800: '#16653d',
          900: '#145334',
        },
        ink: {
          50: '#f6f8fa',
          100: '#eceff3',
          200: '#d5dbe3',
          300: '#b1bcc9',
          400: '#8696a9',
          500: '#67798e',
          600: '#526175',
          700: '#434f5f',
          800: '#3a4350',
          900: '#1f2733',
          950: '#0f141b',
        },
        cloud: {
          50: '#fcfdfe',
          100: '#f7f9fb',
          200: '#f1f5f8',
          300: '#e7edf2',
        },
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 1px 2px rgba(15, 23, 42, 0.04), 0 4px 16px rgba(15, 23, 42, 0.06)',
        card: '0 1px 3px rgba(15, 23, 42, 0.05), 0 12px 32px -8px rgba(15, 23, 42, 0.10)',
        lift: '0 2px 6px rgba(15, 23, 42, 0.06), 0 24px 48px -12px rgba(15, 23, 42, 0.18)',
        glow: '0 0 0 4px rgba(34, 168, 169, 0.18)',
        'brand-lg': '0 12px 32px -8px rgba(34, 168, 169, 0.45)',
        inset: 'inset 0 1px 0 rgba(255,255,255,0.6)',
      },
      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '1.75rem',
        '4xl': '2.25rem',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #22a8a9 0%, #2199df 100%)',
        'hero-glow':
          'radial-gradient(60% 60% at 20% 10%, rgba(173,236,233,0.7) 0%, rgba(255,255,255,0) 70%), radial-gradient(50% 50% at 90% 20%, rgba(193,228,251,0.7) 0%, rgba(255,255,255,0) 70%)',
        'grid-fade':
          'linear-gradient(to right, rgba(15,23,42,0.045) 1px, transparent 1px), linear-gradient(to bottom, rgba(15,23,42,0.045) 1px, transparent 1px)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) both',
        'fade-in': 'fade-in 0.5s ease-out both',
        float: 'float 6s ease-in-out infinite',
        shimmer: 'shimmer 2s linear infinite',
        'scale-in': 'scale-in 0.25s cubic-bezier(0.22, 1, 0.36, 1) both',
      },
      transitionTimingFunction: {
        spring: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
} satisfies Config
