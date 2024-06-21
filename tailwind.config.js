import { fluidExtractor, fluidCorePlugins, defaultThemeScreensInRems, defaultThemeFontSizeInRems } from 'fluid-tailwind'
const defaultTheme = require('tailwindcss/defaultTheme')

/** @type {import('tailwindcss').Config} */
const config = {
	darkMode: "selector",
	content: ["./src/**/*.{html,js,svelte,ts}"],
  	safelist: ["dark"],
	theme: {
		fontSize: defaultThemeFontSizeInRems,
    	screens: defaultThemeScreensInRems,
		extend: {
			colors: {
				primary: {
					DEFAULT: '#EE761C',
					  50: '#FCEADC',
					  100: '#FBDDC7',
					  200: '#F8C39C',
					  300: '#F4AA71',
					  400: '#F19047',
					  500: '#EE761C',
					  600: '#C35C0F',
					  700: '#8F430B',
					  800: '#5B2B07',
					  900: '#271203',
					  950: '#0D0601'
					},
				secondary: '#2B2A29',
				border: "hsl(var(--border) / <alpha-value>)",
				input: "hsl(var(--input) / <alpha-value>)",
				ring: "hsl(var(--ring) / <alpha-value>)",
				background: "hsl(var(--background) / <alpha-value>)",
				foreground: "hsl(var(--foreground) / <alpha-value>)",
				destructive: {
					DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
					foreground: "hsl(var(--destructive-foreground) / <alpha-value>)"
				},
				muted: {
					DEFAULT: "hsl(var(--muted) / <alpha-value>)",
					foreground: "hsl(var(--muted-foreground) / <alpha-value>)"
				},
				accent: {
					DEFAULT: "hsl(var(--accent) / <alpha-value>)",
					foreground: "hsl(var(--accent-foreground) / <alpha-value>)"
				},
				popover: {
					DEFAULT: "hsl(var(--popover) / <alpha-value>)",
					foreground: "hsl(var(--popover-foreground) / <alpha-value>)"
				},
				card: {
					DEFAULT: "hsl(var(--card) / <alpha-value>)",
					foreground: "hsl(var(--card-foreground) / <alpha-value>)"
				}
			},
			fontFamily: {
				sans: ["Inter", defaultTheme.fontFamily.sans]
			},
			animation: {
				'spin-slow': 'spin 2s linear infinite',
			}
		}
	},
	plugins: [
		fluidCorePlugins,
		require('tailwind-scrollbar'),
	],
};

export default config;