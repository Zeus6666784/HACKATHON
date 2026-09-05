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
        primary: "var(--color-primary)",
        accent: "var(--color-accent)",
        background: "var(--color-background)",
        foreground: "var(--color-foreground)",
        muted: "var(--color-muted)",
        border: "var(--color-border)",
        danger: "var(--color-destructive)",
      },
      fontFamily: {
        display: ["var(--font-figtree)", "sans-serif"],
        sans: ["var(--font-noto)", "sans-serif"],
      },
      boxShadow: {
        soft: "8px 8px 16px #c5d4db, -8px -8px 16px #ffffff",
        insetSoft: "inset 6px 6px 12px #d7e4ea, inset -6px -6px 12px #ffffff",
      },
    },
  },
  plugins: [],
} satisfies Config;
