import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        transparent: 'transparent',
        current: 'currentColor',
        bg: {
          DEFAULT: 'hsl(var(--color-bg))',
          subtle: 'hsl(var(--color-bg-subtle))',
        },
        surface: {
          DEFAULT: 'hsl(var(--color-surface))',
          hover: 'hsl(var(--color-surface-hover))',
          active: 'hsl(var(--color-surface-active))',
          sunken: 'hsl(var(--color-surface-sunken))',
        },
        border: {
          DEFAULT: 'hsl(var(--color-border))',
          strong: 'hsl(var(--color-border-strong))',
        },
        text: {
          DEFAULT: 'hsl(var(--color-text))',
          secondary: 'hsl(var(--color-text-secondary))',
          muted: 'hsl(var(--color-text-muted))',
          inverse: 'hsl(var(--color-text-inverse))',
        },
        brand: {
          DEFAULT: 'hsl(var(--color-brand))',
          hover: 'hsl(var(--color-brand-hover))',
          foreground: 'hsl(var(--color-brand-foreground))',
          subtle: 'hsl(var(--color-brand-subtle))',
          soft: 'hsl(var(--color-brand-soft))',
        },
        success: {
          DEFAULT: 'hsl(var(--color-success))',
          subtle: 'hsl(var(--color-success-subtle))',
        },
        warning: {
          DEFAULT: 'hsl(var(--color-warning))',
          subtle: 'hsl(var(--color-warning-subtle))',
        },
        danger: {
          DEFAULT: 'hsl(var(--color-danger))',
          subtle: 'hsl(var(--color-danger-subtle))',
        },
        info: {
          DEFAULT: 'hsl(var(--color-info))',
          subtle: 'hsl(var(--color-info-subtle))',
        },
      },
      borderRadius: {
        xs: 'var(--radius-xs)',
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
      },
      boxShadow: {
        xs: 'var(--shadow-xs)',
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        xl: 'var(--shadow-xl)',
      },
      fontFamily: {
        sans: ['var(--font-sans)'],
        mono: ['var(--font-mono)'],
        serif: ['var(--font-serif)'],
      },
      transitionDuration: {
        fast: 'var(--transition-fast)',
        base: 'var(--transition-base)',
        slow: 'var(--transition-slow)',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.97)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        'slide-in-right': {
          from: { opacity: '0', transform: 'translateX(16px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        'draw-check': {
          from: { strokeDashoffset: '24' },
          to: { strokeDashoffset: '0' },
        },
        'pop-in': {
          '0%': { opacity: '0', transform: 'scale(0.4)' },
          '80%': { transform: 'scale(1.06)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.55' },
        },
      },
      animation: {
        'fade-in': 'fade-in var(--transition-base) ease-out',
        'scale-in': 'scale-in var(--transition-fast) ease-out',
        'slide-in-right': 'slide-in-right var(--transition-base) ease-out',
        'draw-check': 'draw-check 300ms ease-out forwards',
        'pop-in': 'pop-in 320ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'pulse-soft': 'pulse 2.4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('tailwindcss-animate'),
  ],
};

export default config;