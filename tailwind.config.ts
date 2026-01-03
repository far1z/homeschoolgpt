import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Warm educational palette
        cream: {
          50: "#FEFDFB",
          100: "#FAF7F2",
          200: "#F5EFE6",
          300: "#EDE4D6",
        },
        terracotta: {
          50: "#FDF5F3",
          100: "#FAE8E3",
          200: "#F5D0C5",
          300: "#EDB3A1",
          400: "#E38E74",
          500: "#D97050",
          600: "#C45A3A",
          700: "#A3482E",
          800: "#873E2A",
          900: "#713728",
        },
        sage: {
          50: "#F4F9F6",
          100: "#E7F2EC",
          200: "#CEE5D9",
          300: "#A8D1BB",
          400: "#7BB89A",
          500: "#5A9E7D",
          600: "#458064",
          700: "#386651",
          800: "#305242",
          900: "#2A4538",
        },
        navy: {
          50: "#F4F5F7",
          100: "#E3E5EA",
          200: "#C7CBD5",
          300: "#A3AAB9",
          400: "#7A8396",
          500: "#5F677B",
          600: "#4D5468",
          700: "#424757",
          800: "#3A3E4A",
          900: "#33363F",
        },
        honey: {
          50: "#FEFBF3",
          100: "#FCF5E1",
          200: "#F9E9C2",
          300: "#F5D898",
          400: "#F0C46C",
          500: "#E9AC42",
          600: "#D6922F",
          700: "#B27426",
          800: "#8F5C24",
          900: "#754C21",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      animation: {
        "fade-up": "fadeUp 0.6s ease-out forwards",
        "fade-in": "fadeIn 0.4s ease-out forwards",
        "slide-in": "slideIn 0.5s ease-out forwards",
        "scale-in": "scaleIn 0.3s ease-out forwards",
        "bounce-soft": "bounceSoft 0.6s ease-out",
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideIn: {
          "0%": { opacity: "0", transform: "translateX(-20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        bounceSoft: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
