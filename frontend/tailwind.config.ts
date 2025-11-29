import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config: Config = {
	darkMode: ["class"],
	content: ["./index.html", "./src/**/*.{ts,tsx}"],
	theme: {
		container: {
			center: true,
			padding: "2rem",
		},
		extend: {
			colors: {
				border: "hsl(214 18% 86%)",
				input: "hsl(214 18% 92%)",
				ring: "#0F6FFF",
				background: "#f5f7fb",
				foreground: "#0b1220",
				brand: {
					DEFAULT: "#0F6FFF",
					dark: "#0B4CC5",
					light: "#E3F0FF",
				},
				slate: {
					850: "#1d2433",
				},
				muted: {
					DEFAULT: "hsl(215 16% 94%)",
					foreground: "hsl(215 20% 35%)",
				},
				card: {
					DEFAULT: "#ffffff",
					foreground: "#0b1220",
				},
			},
			borderRadius: {
				lg: "12px",
				md: "10px",
				sm: "8px",
			},
			boxShadow: {
				card: "0 1px 2px rgba(15, 32, 74, 0.08), 0 8px 24px rgba(15, 32, 74, 0.06)",
			},
			keyframes: {
				"accordion-down": {
					from: { height: "0" },
					to: { height: "var(--radix-accordion-content-height)" },
				},
				"accordion-up": {
					from: { height: "var(--radix-accordion-content-height)" },
					to: { height: "0" },
				},
			},
			animation: {
				"accordion-down": "accordion-down 0.2s ease-out",
				"accordion-up": "accordion-up 0.2s ease-out",
			},
		},
	},
	plugins: [animate],
};

export default config;
