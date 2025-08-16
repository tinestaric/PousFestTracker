/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  safelist: [
    // Hero gradients
    'from-blue-600', 'via-cyan-500', 'to-teal-400',
    
    // Primary button gradients
    'from-purple-500', 'to-pink-400',
    'from-purple-600', 'to-pink-500',
    
    // Secondary button gradients  
    'from-orange-500', 'to-red-400',
    'from-orange-600', 'to-red-500',
    
    // Timetable day gradients (for multi-day support)
    'from-blue-600', 'to-cyan-500',        // day 1
    'from-purple-600', 'to-pink-500',      // day 2
    'from-green-600', 'to-emerald-500',    // day 3
    'from-orange-600', 'to-red-500',       // day 4
    'from-indigo-600', 'to-purple-500',    // day 5
    'from-teal-600', 'to-cyan-500',        // day 6
    'from-rose-600', 'to-pink-500',        // day 7
    'from-amber-600', 'to-orange-500',     // day 8
    'from-violet-600', 'to-purple-500',    // day 9
    
    // Social highlights gradients
    'from-blue-400', 'to-cyan-500',
    'from-purple-400', 'to-violet-500',
    
    // Navigation card gradients (updated for yacht week theme)
    'from-blue-600', 'to-cyan-500',      // guest
    'from-orange-500', 'to-red-500',     // recipes
    'from-green-500', 'to-blue-500',     // timetable
    'from-indigo-500', 'to-blue-500',    // food
    
    // Border colors for navigation cards (updated)
    'border-cyan-200', 'hover:border-cyan-200',       // guest
    'border-orange-200', 'hover:border-orange-200',   // recipes
    'border-green-200', 'hover:border-green-200',     // timetable
    'border-indigo-200', 'hover:border-indigo-200',   // food
    
    // Legacy border colors (for backward compatibility)
    'border-amber-200', 'hover:border-amber-200',
    'border-red-200', 'hover:border-red-200',
    'border-purple-200', 'hover:border-purple-200',
    
    // Additional gradient directions and hover states
    'bg-gradient-to-r', 'bg-gradient-to-br', 'bg-gradient-to-bl',
    'hover:from-blue-700', 'hover:via-cyan-600', 'hover:to-teal-500',
    'hover:from-orange-600', 'hover:to-red-600',
    'hover:from-green-600', 'hover:to-blue-600',
    'hover:from-indigo-600', 'hover:to-blue-600',
    
    // Additional color variants that might be used
    'from-amber-500', 'to-orange-500',   // legacy support
    'from-red-500', 'to-pink-500',       // legacy support
    'from-purple-500', 'to-indigo-500',  // legacy support
    
    // Text gradient classes
    'bg-clip-text', 'text-transparent',

    // Recipe UI accents (from config)
    'text-amber-600', 'hover:text-amber-700', 'text-amber-800', 'bg-amber-50', 'bg-amber-500',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
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
        secondary: {
          50: '#fdf4ff',
          100: '#fae8ff',
          200: '#f5d0fe',
          300: '#f0abfc',
          400: '#e879f9',
          500: '#d946ef',
          600: '#c026d3',
          700: '#a21caf',
          800: '#86198f',
          900: '#701a75',
        },
      },
    },
  },
  plugins: [],
} 