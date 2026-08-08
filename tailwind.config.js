/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#05070d',
          900: '#0a0e1a',
          850: '#0d1220',
          800: '#111726',
          700: '#1a2236',
          600: '#243049',
          500: '#33415c',
          400: '#4a5a78',
          300: '#6b7a99',
          200: '#9aa6bf',
          100: '#c9d2e3',
          50: '#eef2fa',
        },
        navy: {
          950: '#070d1f',
          900: '#0a1430',
          800: '#0f1d44',
          700: '#16285f',
          600: '#1f3478',
          500: '#2a4694',
          400: '#3d63bd',
          300: '#6a8bdc',
          200: '#a6bfee',
          100: '#d4e0f8',
        },
        gold: {
          950: '#3a2c00',
          900: '#4d3a00',
          800: '#6b5100',
          700: '#8a6a00',
          600: '#a88400',
          500: '#d4af37',
          400: '#e3c25a',
          300: '#ead07f',
          200: '#f0dea0',
          100: '#f6e9c4',
        },
        bull: {
          DEFAULT: '#22c55e',
          soft: '#16a34a',
        },
        bear: {
          DEFAULT: '#ef4444',
          soft: '#dc2626',
        },
        neutral: {
          DEFAULT: '#94a3b8',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        display: ['"Sora"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        '2xs': '0.625rem',
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(5, 7, 13, 0.45)',
        'glass-lg': '0 20px 60px 0 rgba(5, 7, 13, 0.6)',
        gold: '0 0 24px 0 rgba(212, 175, 55, 0.35)',
        'gold-lg': '0 0 40px 0 rgba(212, 175, 55, 0.45)',
        'inner-gold': 'inset 0 0 0 1px rgba(212, 175, 55, 0.25)',
        glow: '0 0 60px -10px rgba(61, 99, 189, 0.5)',
      },
      backgroundImage: {
        'grid-navy': "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
        'radial-gold': 'radial-gradient(circle at 50% 0%, rgba(212,175,55,0.12), transparent 60%)',
        'radial-navy': 'radial-gradient(circle at 50% 0%, rgba(42,70,148,0.25), transparent 60%)',
      },
      backgroundSize: {
        grid: '40px 40px',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'float': {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        'pulse-glow': {
          '0%,100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        },
        'slide-right': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'spin-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'candle-rise': {
          '0%': { transform: 'scaleY(0.2)', opacity: '0' },
          '50%': { opacity: '1' },
          '100%': { transform: 'scaleY(1)', opacity: '1' },
        },
        'ticker': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.6s ease-out both',
        'fade-in': 'fade-in 0.8s ease-out both',
        'scale-in': 'scale-in 0.4s ease-out both',
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
        'slide-right': 'slide-right 2.5s ease-in-out infinite',
        'spin-slow': 'spin-slow 18s linear infinite',
        'candle-rise': 'candle-rise 1s ease-out both',
        'ticker': 'ticker 40s linear infinite',
      },
    },
  },
  plugins: [],
};
