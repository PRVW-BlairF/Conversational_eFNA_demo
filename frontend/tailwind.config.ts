import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        copilot: {
          teal: '#17383A',
          tealDark: '#122C2E',
          lime: '#CFE84A',
          panel: '#D8D9D5',
          soft: '#C9CDD1',
          bg: '#F3F4EF',
          text: '#1E2F30',
          inverse: '#F9FAF8',
          border: '#B8C0BC'
        }
      },
      borderRadius: {
        xl2: '20px'
      },
      boxShadow: {
        card: '0 10px 30px rgba(23,56,58,0.08)'
      }
    }
  },
  plugins: []
};

export default config;
