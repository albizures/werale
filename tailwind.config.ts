import { type Config } from 'tailwindcss';

export default {
	content: ['./src/**/*.{js,ts,jsx,tsx}'],
	theme: {
		extend: {
			colors: {
				olive: '#AC983C',
			},
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
