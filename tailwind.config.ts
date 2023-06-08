import { type Config } from 'tailwindcss';

export default {
	content: ['./src/**/*.{js,ts,jsx,tsx}'],
	theme: {
		extend: {
			fontFamily: {
				serif: ['var(--font-darleston)'],
				sans: ['var(--font-gabriola)'],
			},
		},
	},
	plugins: [require('daisyui')],
	daisyui: {
		themes: ['pastel'],
	},
} satisfies Config;
