import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'], // Enable dark mode via a class
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        light: {
          background: 'hsl(0, 0%, 100%)',
          foreground: 'hsl(240, 10%, 3.9%)',
          primary: 'hsl(221.2, 83.2%, 53.3%)',
          secondary: 'hsl(240, 4.8%, 95.9%)',
          card: 'hsl(0, 0%, 100%)',
          border: 'hsl(240, 5.9%, 90%)',
          input: 'hsl(240, 10%, 3.9%)',
          ring: 'hsl(240, 5.9%, 10%)',
        },
        dark: {
          background: 'hsl(225, 24%, 16%)',
          foreground: 'hsl(0, 0%, 98%)',
          primary: 'hsl(0, 100%, 64.51%)',
          secondary: 'hsl(240, 3.7%, 15.9%)',
          card: 'hsl(231, 22%, 24%)',
          border: 'hsl(240, 3.7%, 15.9%)',
          input: 'hsl(240, 5.56%, 50.59%)',
          ring: 'hsl(240, 4.9%, 83.9%)',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
        flash: {
          '0%, 100%': {
            borderColor: 'transparent',
          },
          '50%': {
            borderColor: '#037bfc',
          },
        },
        borderGlow: {
          '0%': {
            borderColor: 'transparent',
            boxShadow: '0 0 3px rgba(255, 215, 0, 0.1)',
          },
          '50%': {
            borderColor: 'transparent',
            boxShadow: '0 0 6px rgba(255, 215, 0, 0.3)',
          },
          '100%': {
            borderColor: 'transparent',
            boxShadow: '0 0 3px rgba(255, 215, 0, 0.1)',
          },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'flashing-border': 'flash 1s infinite',
        'border-glow': 'borderGlow 1.5s infinite ease-in-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
