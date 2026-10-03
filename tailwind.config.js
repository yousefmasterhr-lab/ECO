/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        canvas: 'var(--bg-canvas)',
        surface: {
          DEFAULT: 'var(--bg-surface)',
          hover: 'var(--bg-hover)',
          card: 'var(--bg-surface)',
        },
        'border-theme': 'var(--border-color)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'accent-primary': 'var(--accent-primary)',
        'accent-secondary': 'var(--accent-secondary)',
        'accent-cta': 'var(--accent-cta, var(--accent-primary))',
        olive: {
          canvas: 'var(--bg-canvas)',
          card: 'var(--surface-card)',
          hover: 'var(--surface-hover)',
          sidebar: 'var(--brand-olive-sidebar)',
          primary: 'var(--brand-olive-primary)',
          border: 'var(--border-divider)',
          text: 'var(--text-primary)',
          muted: 'var(--text-secondary)',
          // Fixed hex shades for specific styling
          50: '#FBF9F5',
          100: '#F3EFE6',
          200: '#EAE4D7',
          300: '#E0D9CB',
          400: '#8FA392',
          500: '#5C665E',
          600: '#243324',
          700: '#1C291E',
          800: '#17231A',
          900: '#0E1610',
          950: '#080D0A',
        },
        amber: {
          accent: 'var(--accent-amber)',
          hover: 'var(--accent-amber-hover)',
          light: '#D99B26',
          lightHover: '#C58F38',
          dark: '#EBB34D',
          darkHover: '#F5C76D',
        },
        brand: {
          50: '#FBF9F5',
          100: '#F3EFE6',
          200: '#EAE4D7',
          300: '#E0D9CB',
          400: '#8FA392',
          500: '#D99B26', // Warm Radiant Amber
          600: '#C58F38', // Refined Mustard Amber
          700: '#243324', // Deep Olive
          800: '#1C291E', // Royal Olive
          900: '#17231A', // Dark Olive Slate
          950: '#0E1610', // Nocturnal Olive
        }
      },
      fontFamily: {
        cairo: ['Cairo', 'sans-serif'],
        inter: ['Cairo', 'sans-serif'],
        sans: ['Cairo', 'sans-serif'],
        mono: ['Cairo', 'monospace'],
        num: ['Cairo', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      }
    },
  },
  plugins: [],
}
