/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563EB', // Royal Blue
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
          950: '#172554',
        },
        secondary: {
          DEFAULT: '#14B8A6', // Teal
          50: '#F0FDFA',
          100: '#CCFBF1',
          200: '#99F6E4',
          300: '#5EEAD4',
          400: '#2DD4BF',
          500: '#14B8A6',
          600: '#0D9488',
          700: '#0F766E',
          800: '#115E59',
          900: '#134E4A',
          950: '#042F2E',
        },
        accent: {
          DEFAULT: '#F59E0B', // Amber
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
          800: '#92400E',
          900: '#78350F',
        },
        dark: {
          bg: '#0F172A',      // Slate-900
          surface: '#1E293B', // Slate-800
          card: '#1E293B',
          border: '#334155',  // Slate-700
          text: '#F8FAFC',    // Slate-50
          muted: '#94A3B8',   // Slate-400
        },
        light: {
          bg: '#F8FAFC',      // Slate-50
          surface: '#FFFFFF',
          card: '#FFFFFF',
          border: '#E2E8F0',  // Slate-200
          text: '#0F172A',    // Slate-900
          muted: '#64748B',   // Slate-500
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        display: ['Outfit', 'Poppins', 'Inter', 'sans-serif'],
        heading: ['Outfit', 'Poppins', 'Inter', 'sans-serif'],
        accent: ['Poppins', 'sans-serif'],
      },
      boxShadow: {
        'glow-primary': '0 0 25px -5px rgba(37, 99, 235, 0.35)',
        'glow-secondary': '0 0 25px -5px rgba(20, 184, 166, 0.35)',
        'glow-accent': '0 0 25px -5px rgba(245, 158, 11, 0.35)',
        'premium': '0 10px 30px -10px rgba(15, 23, 42, 0.08), 0 4px 6px -2px rgba(15, 23, 42, 0.03)',
        'premium-hover': '0 20px 40px -15px rgba(37, 99, 235, 0.15), 0 6px 12px -3px rgba(15, 23, 42, 0.05)',
        'card-dark': '0 10px 30px -10px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.2)',
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '24px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}
