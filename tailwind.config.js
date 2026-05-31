/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0d1117",
        surface: "#161b22",
        "surface-2": "#1c2128",
        border: "#30363d",
        "border-muted": "#21262d",
        accent: "#58a6ff",
        danger: "#f85149",
        success: "#3fb950",
        warning: "#d29922",
        muted: "#8b949e",
        "text-primary": "#e6edf3",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "'SF Mono'", "Menlo", "monospace"],
      },
      fontSize: {
        "2xs": "0.6875rem",
      },
    },
  },
  plugins: [],
};
