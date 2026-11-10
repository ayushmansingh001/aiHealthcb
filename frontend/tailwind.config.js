/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        teal: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
          950: '#042f2e',
        },
        sky: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        health: {
          primary: '#0d9488',
          secondary: '#38bdf8',
          accent: '#4ade80',
          light: '#f8fafc',
          muted: '#94a3b8',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'card': '0 1px 3px rgba(0,0,0,0.05), 0 4px 12px rgba(0,0,0,0.04)',
        'teal': '0 4px 14px 0 rgba(13, 148, 136, 0.39)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'bounce-dot': 'bounceDot 1.4s infinite ease-in-out both',
        'pulse-ring': 'pulseRing 1.5s cubic-bezier(0.215, 0.61, 0.355, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceDot: {
          '0%, 80%, 100%': { transform: 'scale(0)', opacity: '0.5' },
          '40%': { transform: 'scale(1)', opacity: '1' },
        },
        pulseRing: {
          '0%': { transform: 'scale(0.95)', boxShadow: '0 0 0 0 rgba(239, 68, 68, 0.7)' },
          '70%': { transform: 'scale(1)', boxShadow: '0 0 0 10px rgba(239, 68, 68, 0)' },
          '100%': { transform: 'scale(0.95)', boxShadow: '0 0 0 0 rgba(239, 68, 68, 0)' },
        },
      },
      backgroundImage: {
        'gradient-health': 'linear-gradient(135deg, #0d9488 0%, #38bdf8 100%)',
        'gradient-card': 'linear-gradient(135deg, #f0fdfa 0%, #e0f2fe 100%)',
      }
    },
  },
  plugins: [],
}
