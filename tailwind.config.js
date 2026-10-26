/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,jsx,mdx}",
    "./src/components/**/*.{js,jsx,mdx}",
    "./src/app/**/*.{js,jsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eaf5f2",
          100: "#c8e7df",
          200: "#9ad4c5",
          300: "#65bda6",
          400: "#3aa389",
          500: "#176B5B", // Deep teal primary
          600: "#125448", // Primary hover
          700: "#0e3f36",
          800: "#0a2b25",
          900: "#061b17",
        },
        surface: {
          bg: "#F7F8FA",
          card: "#FFFFFF",
          subtle: "#F1F3F6",
        },
        ink: {
          primary: "#18212F",
          secondary: "#667085",
          muted: "#98A2B3",
        },
        border: {
          subtle: "#E4E7EC",
          strong: "#D0D5DD",
        },
        status: {
          available: "#16A34A",
          availableBg: "#F0FDF4",
          availableBorder: "#BBF7D0",
          occupied: "#DC2626",
          occupiedBg: "#FEF2F2",
          occupiedBorder: "#FECACA",
          reserved: "#D97706",
          reservedBg: "#FFFBEB",
          reservedBorder: "#FDE68A",
          blocked: "#6B7280",
          blockedBg: "#F9FAFB",
          blockedBorder: "#E5E7EB",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "sans-serif"],
      },
      borderRadius: {
        button: "10px",
        card: "12px",
      },
    },
  },
  plugins: [],
};
