/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3b82f6',     // Vibrant Blue
        primaryHover: '#2563eb', // Darker Blue for hover
        secondary: '#f8fafc',   // Very light gray/blue background
        accent: '#f59e0b',      // Warm amber for highlights
        success: '#10b981',     // Clean green for success
        danger: '#ef4444',      // Crisp red for errors/deletes
        dark: '#f1f5f9',        // Background shade
        darker: '#e2e8f0',      // Borders/Dividers
        card: 'rgba(255, 255, 255, 0.7)', // Frosted Glass White
        text: '#0f172a',        // Main text (slate-900)
        muted: '#64748b',       // Subtext (slate-500)
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Avenir', 'Helvetica', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        'neon': '0 0 15px rgba(59, 130, 246, 0.5), 0 0 40px rgba(59, 130, 246, 0.2)',
      },
      animation: {
        'blob': 'blob 7s infinite',
      },
      keyframes: {
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        }
      }
    },
  },
  plugins: [],
}
