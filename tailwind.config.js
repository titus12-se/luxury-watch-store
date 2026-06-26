/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#C9A227',
          50: '#FAF5E6',
          100: '#F5EBCC',
          200: '#ECD799',
          300: '#E0C366',
          400: '#C9A227',
          500: '#B08A1A',
          600: '#8F7014',
          700: '#6E560F',
          800: '#4D3C0A',
          900: '#2C2206',
        },
        navy: {
          DEFAULT: '#0F1E3A',
          50: '#E8ECF2',
          100: '#D1D9E5',
          200: '#A3B3CB',
          300: '#758DB1',
          400: '#476797',
          500: '#2A4A7D',
          600: '#1C3560',
          700: '#0F1E3A',
          800: '#0A1528',
          900: '#050C16',
        },
        pearl: {
          DEFAULT: '#FAFAF8',
          100: '#F3F4F6',
          200: '#E5E7EB',
        },
        soft: '#F3F4F6',
        black: '#1A1A1A',
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'slide-up': 'slideUp 0.6s ease-out forwards',
        'slide-in-right': 'slideInRight 0.4s ease-out forwards',
        'scale-in': 'scaleIn 0.3s ease-out forwards',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      backgroundImage: {
        'gradient-gold': 'linear-gradient(135deg, #C9A227 0%, #E0C366 50%, #C9A227 100%)',
        'gradient-navy': 'linear-gradient(135deg, #0F1E3A 0%, #1C3560 100%)',
        'gradient-pearl': 'linear-gradient(180deg, #FAFAF8 0%, #F3F4F6 100%)',
      },
    },
  },
  plugins: [],
};
