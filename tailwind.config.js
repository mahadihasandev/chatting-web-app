/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./lib/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: "hsl(var(--card))",
        primary: "hsl(var(--primary))",
        "primary-foreground": "hsl(var(--primary-foreground))",
        muted: "hsl(var(--muted))",
        "muted-foreground": "hsl(var(--muted-foreground))",
        border: "hsl(var(--border))",
        accent: "hsl(var(--accent))",
      },
      fontFamily: {
        sans: ["Plus Jakarta Sans", "Segoe UI", "sans-serif"],
      },
      boxShadow: {
        soft: "0 20px 60px rgba(8, 19, 40, 0.14)",
      },
      backgroundImage: {
        "mesh-gradient": "radial-gradient(circle at 10% 20%, rgba(40, 140, 255, 0.2) 0%, transparent 35%), radial-gradient(circle at 80% 10%, rgba(18, 204, 164, 0.24) 0%, transparent 30%), linear-gradient(145deg, #f5fbff 0%, #edf5ff 100%)",
      },
    },
  },
  plugins: [],
};
