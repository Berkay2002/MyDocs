module.exports = {
	mode: "jit",
	content: [
	  "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
	  "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
	  "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
	  extend: {
		screens: {
		  print: { raw: "print" },
		},
		animation: {
		  progress: "progress 1s ease-out infinite",
		},
		keyframes: {
		  progress: {
			"0%": { width: "0" },
			"100%": { width: "100%" },
		  },
		},
	  },
	},
	darkMode: "media",
	plugins: [],
  };
