/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        muted: 'var(--muted)',
        border: 'var(--border)',
        card: 'var(--card)',
        accent: {
          DEFAULT: 'var(--accent)',
          hover: 'var(--accent-hover)',
          light: 'var(--accent-light)',
        },
        urgent: {
          DEFAULT: 'var(--urgent)',
          light: 'var(--urgent-light)',
          border: 'var(--urgent-border)',
        },
        high: {
          DEFAULT: 'var(--high)',
          light: 'var(--high-light)',
          border: 'var(--high-border)',
        },
        normal: {
          DEFAULT: 'var(--normal)',
          light: 'var(--normal-light)',
          border: 'var(--normal-border)',
        },
        low: {
          DEFAULT: 'var(--low)',
          light: 'var(--low-light)',
          border: 'var(--low-border)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '8px',
        sm: '6px',
        md: '10px',
        lg: '14px',
        xl: '18px',
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0,0,0,0.06), 0 1px 2px -1px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 12px 0 rgba(0,0,0,0.08)',
        input: '0 0 0 3px rgba(83,74,183,0.15)',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in': {
          from: { opacity: '0', transform: 'translateX(-8px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        // Dialog-safe: only opacity+scale, never overrides centering transforms
        'dialog-in': {
          from: { opacity: '0', scale: '0.96' },
          to: { opacity: '1', scale: '1' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.18s ease-out',
        'slide-in': 'slide-in 0.15s ease-out',
        'dialog-in': 'dialog-in 0.15s ease-out',
      },
    },
  },
  plugins: [],
}
