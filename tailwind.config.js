/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2340A1',
        accent: '#FF7A59',
        secondary: '#F4F6FA',
        slate: '#2D3748',
        background: '#FFFFFF',
        success: '#38B2AC',
        danger: '#E53E3E',
        link: '#3B82F6',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
      fontSize: {
        h1: '2.5rem',
        h2: '2rem',
        h3: '1.5rem',
        body: '1rem',
      },
      fontWeight: {
        regular: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },
      spacing: {
        8: '8px',
        16: '16px',
        24: '24px',
        32: '32px',
        48: '48px',
      },
      borderRadius: {
        DEFAULT: '4px',
        md: '6px',
        lg: '8px',
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        DEFAULT:
          '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      maxWidth: {
        container: '1200px',
      },
    },
  },
  plugins: [],
};
