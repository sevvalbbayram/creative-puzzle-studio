import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Global Brand Colors
        brand: {
          purple: {
            DEFAULT: '#9333EA',
            light: '#A855F7',
            dark: '#7E22CE',
            50: '#FAF5FF',
            100: '#F3E8FF',
            200: '#E9D5FF',
            300: '#D8B4FE',
            400: '#C084FC',
            500: '#A855F7',
            600: '#9333EA',
            700: '#7E22CE',
            800: '#6B21A8',
            900: '#581C87',
          },
          orange: {
            DEFAULT: '#F97316',
            light: '#FB923C',
            dark: '#EA580C',
            50: '#FFF7ED',
            100: '#FFEDD5',
            200: '#FED7AA',
            300: '#FDBA74',
            400: '#FB923C',
            500: '#F97316',
            600: '#EA580C',
            700: '#C2410C',
            800: '#9A3412',
            900: '#7C2D12',
          },
        },

        // Background Colors
        background: {
          DEFAULT: '#F5F5F7',
          light: '#FFFFFF',
          dark: '#E5E5E7',
        },

        // Text Colors
        text: {
          primary: '#1F2937',
          secondary: '#6B7280',
          light: '#9CA3AF',
          dark: '#111827',
        },

        // Status Colors
        status: {
          success: '#10B981',
          warning: '#F59E0B',
          error: '#EF4444',
          info: '#3B82F6',
        },

        // Observatory Hub Colors
        observatory: {
          space: {
            DEFAULT: '#1E3A8A',
            light: '#3B82F6',
            dark: '#1E40AF',
          },
          gold: {
            DEFAULT: '#FCD34D',
            light: '#FDE68A',
            dark: '#F59E0B',
          },
          cosmic: {
            DEFAULT: '#7C3AED',
            light: '#8B5CF6',
            dark: '#6D28D9',
          },
          nebula: {
            DEFAULT: '#EC4899',
            light: '#F472B6',
            dark: '#DB2777',
          },
          starlight: '#FBBF24',
        },

        // Alchemist's Workshop Colors
        alchemist: {
          purple: {
            DEFAULT: '#6B21A8',
            light: '#7C3AED',
            dark: '#581C87',
            glow: '#A855F7',
          },
          green: {
            DEFAULT: '#059669',
            light: '#10B981',
            dark: '#047857',
            potion: '#34D399',
          },
          gold: {
            DEFAULT: '#D97706',
            light: '#F59E0B',
            dark: '#B45309',
            shine: '#FBBF24',
          },
          blue: {
            DEFAULT: '#0EA5E9',
            light: '#38BDF8',
            dark: '#0284C7',
            crystal: '#7DD3FC',
          },
          shadow: {
            DEFAULT: '#374151',
            light: '#4B5563',
            dark: '#1F2937',
          },
        },

        // Gardener's Journey Colors
        gardener: {
          brown: {
            DEFAULT: '#92400E',
            light: '#B45309',
            dark: '#78350F',
            soil: '#451A03',
          },
          green: {
            DEFAULT: '#16A34A',
            light: '#22C55E',
            dark: '#15803D',
            leaf: '#4ADE80',
            sprout: '#86EFAC',
          },
          pink: {
            DEFAULT: '#F472B6',
            light: '#F9A8D4',
            dark: '#EC4899',
            blossom: '#FBCFE8',
          },
          sky: {
            DEFAULT: '#38BDF8',
            light: '#7DD3FC',
            dark: '#0EA5E9',
          },
          yellow: {
            DEFAULT: '#FCD34D',
            light: '#FDE68A',
            dark: '#F59E0B',
            flower: '#FEF08A',
          },
        },

        // Explorer's Map Colors
        explorer: {
          parchment: {
            DEFAULT: '#FEF3C7',
            light: '#FEF9C3',
            dark: '#FDE68A',
            aged: '#FCD34D',
          },
          gold: {
            DEFAULT: '#CA8A04',
            light: '#EAB308',
            dark: '#A16207',
            compass: '#F59E0B',
          },
          ocean: {
            DEFAULT: '#0284C7',
            light: '#0EA5E9',
            dark: '#0369A1',
            deep: '#075985',
          },
          forest: {
            DEFAULT: '#15803D',
            light: '#16A34A',
            dark: '#166534',
          },
          ink: {
            DEFAULT: '#18181B',
            light: '#27272A',
            dark: '#09090B',
          },
          sepia: '#92400E',
        },
      },

      // Gradient Backgrounds
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        
        // Observatory Gradients
        'observatory-space': 'linear-gradient(to bottom, #1E3A8A, #1E1B4B)',
        'observatory-nebula': 'radial-gradient(circle, #7C3AED, #EC4899, #1E3A8A)',
        
        // Alchemist Gradients
        'alchemist-workshop': 'linear-gradient(to bottom, #6B21A8, #1F2937)',
        'alchemist-potion': 'linear-gradient(135deg, #059669, #0EA5E9)',
        'alchemist-gold': 'linear-gradient(135deg, #D97706, #FBBF24)',
        
        // Gardener Gradients
        'gardener-earth': 'linear-gradient(to bottom, #38BDF8, #16A34A, #92400E)',
        'gardener-growth': 'linear-gradient(135deg, #16A34A, #4ADE80)',
        
        // Explorer Gradients
        'explorer-parchment': 'linear-gradient(135deg, #FEF3C7, #FDE68A)',
        'explorer-ocean': 'linear-gradient(to bottom, #0EA5E9, #0369A1)',
      },

      // Box Shadows
      boxShadow: {
        'glow-purple': '0 0 20px rgba(147, 51, 234, 0.5)',
        'glow-orange': '0 0 20px rgba(249, 115, 22, 0.5)',
        'glow-green': '0 0 20px rgba(16, 185, 129, 0.5)',
        'glow-blue': '0 0 20px rgba(59, 130, 246, 0.5)',
        'glow-gold': '0 0 20px rgba(251, 191, 36, 0.5)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'inner-glow': 'inset 0 0 20px rgba(147, 51, 234, 0.3)',
      },

      // Animation Keyframes
      keyframes: {
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        'rotate-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0)' },
          '100%': { transform: 'scale(1)' },
        },
        'sparkle': {
          '0%, 100%': { opacity: '0', transform: 'scale(0)' },
          '50%': { opacity: '1', transform: 'scale(1)' },
        },
      },

      // Animation Classes
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'rotate-slow': 'rotate-slow 20s linear infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'fade-in': 'fade-in 0.5s ease-out',
        'slide-up': 'slide-up 0.5s ease-out',
        'scale-in': 'scale-in 0.3s ease-out',
        'sparkle': 'sparkle 1s ease-in-out infinite',
      },

      // Font Families
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-montserrat)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-roboto-mono)', 'monospace'],
      },

      // Spacing
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },

      // Border Radius
      borderRadius: {
        '4xl': '2rem',
      },

      // Z-Index
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },

      // Transitions
      transitionDuration: {
        '2000': '2000ms',
      },
    },
  },
  plugins: [],
}

export default config
