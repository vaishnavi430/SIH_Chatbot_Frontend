module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx,css}'
  ],
  theme: {
    extend: {
      boxShadow: {
        // soft shadow used throughout the app
        'soft': '0 8px 24px rgba(16, 24, 40, 0.06)'
      },
      colors: {
        // primary brand color: slightly darker green
        primary: {
          DEFAULT: '#059669'
        },
        accent: {
          DEFAULT: '#F59E0B'
        },
        surface: '#FFFFFF'
      }
    }
  },
  plugins: []
};
