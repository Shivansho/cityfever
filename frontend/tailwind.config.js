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
        command: {
          bg: '#020817',
          panel: 'rgba(8, 20, 40, 0.75)',
          panelHover: 'rgba(12, 28, 56, 0.85)',
          border: 'rgba(56, 189, 248, 0.18)',
          borderGlow: 'rgba(0, 242, 254, 0.4)',
          accent: '#00f2fe',
          cyan: '#00d2ff',
          purple: '#8b5cf6',
          purpleGlow: 'rgba(139, 92, 246, 0.35)',
          darkNavy: '#040d1a',
        },
      },
      fontFamily: {
        sans: ['Space Grotesk', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'glow-cyan': '0 0 20px -3px rgba(0, 242, 254, 0.35)',
        'glow-purple': '0 0 25px -4px rgba(139, 92, 246, 0.4)',
        'glow-red': '0 0 25px -4px rgba(239, 68, 68, 0.5)',
        'panel': '0 8px 32px 0 rgba(0, 0, 0, 0.45)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'radar-sweep': 'radarSweep 4s linear infinite',
      },
      keyframes: {
        radarSweep: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
    },
  },
  plugins: [],
}
