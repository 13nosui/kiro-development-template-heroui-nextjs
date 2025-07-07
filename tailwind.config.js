const { heroui } = require("@heroui/theme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/icons/**/*.{js,ts,jsx,tsx,svg}",
    "./src/styles/globals.css",
    // HeroUI content
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: ["text-nidomi-blue-70"],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "16px",
        sm: "16px",
        md: "16px",
        lg: "16px",
        xl: "16px",
        "2xl": "16px",
      },
      screens: {
        DEFAULT: "100%",
        sm: "100%",
        md: "100%",
        lg: "480px",
        xl: "480px",
        "2xl": "480px",
      },
    },
    extend: {
      screens: {
        xs: "480px",
        sm: "640px",
      },
      maxWidth: {
        "screen-xs": "480px",
      },
      colors: {
        // Tailwindデフォルトカラーの拡張（システム系）
        background: "var(--background)",
        foreground: "var(--foreground)",
        nidomi: {
          // セマンティックカラー（役割ベース）
          primary: "var(--primary)",
          "primary-foreground": "var(--on-primary)",
          secondary: "var(--secondary)",
          "secondary-foreground": "var(--on-secondary)",

          // 状態カラー
          error: "var(--error)",
          "error-foreground": "var(--on-error)",
          "error-container": "var(--error-container)",
          "error-container-foreground": "var(--on-error-container)",

          // サーフェス系
          surface: "var(--surface)",
          "surface-foreground": "var(--on-surface)",
          "surface-dim": "var(--surface-dim)",
          "surface-variant": "var(--surface-variant)",
          "surface-variant-foreground": "var(--on-surface-variant)",
          "surface-tint": "var(--surface-tint)",

          // アウトライン系
          outline: "var(--outline)",
          "outline-variant": "var(--outline-variant)",

          // インバース系
          "inverse-surface": "var(--inverse-surface)",
          "inverse-surface-foreground": "var(--inverse-on-surface)",
          "inverse-surface-variant": "var(--inverse-surface-variant)",
          "inverse-surface-variant-foreground":
            "var(--inverse-on-surface-variant)",
          "inverse-primary": "var(--inverse-primary)",
          "inverse-primary-foreground": "var(--inverse-on-primary)",
          "inverse-secondary": "var(--inverse-secondary)",
          "inverse-secondary-foreground": "var(--inverse-on-secondary)",
          "inverse-error": "var(--inverse-error)",
          "inverse-error-foreground": "var(--inverse-on-error)",
          "inverse-error-container": "var(--inverse-error-container)",
          "inverse-error-container-foreground":
            "var(--inverse-on-error-container)",

          // その他
          shadow: "var(--shadow)",
          scrim: "var(--scrim)",

          // テキストリンク
          "blue-70": "#1A89FF",
        },
      },
      spacing: {
        1: "var(--space-4)",
        2: "var(--space-8)",
        3: "var(--space-12)",
        4: "var(--space-16)",
        5: "var(--space-20)",
        6: "var(--space-24)",
        7: "var(--space-28)",
        8: "var(--space-32)",
        10: "var(--space-40)",
        11: "var(--space-44)",
        12: "var(--space-48)",
        13: "var(--space-52)",
        14: "var(--space-56)",
        15: "var(--space-60)",
        16: "var(--space-64)",
        18: "var(--space-72)",
        19: "var(--space-76)",
        20: "var(--space-80)",
        21: "var(--space-84)",
      },
      borderRadius: {
        12: "var(--radius-12)",
        24: "var(--radius-24)",
        full: "var(--radius-full)",
      },
      fontFamily: {
        sans: ["var(--font-family-base)", "sans-serif"],
      },
      fontSize: {
        large: [
          "var(--font-size-large)",
          { lineHeight: "var(--line-height-large)" },
        ],
        medium: [
          "var(--font-size-medium)",
          { lineHeight: "var(--line-height-medium)" },
        ],
        small: [
          "var(--font-size-small)",
          { lineHeight: "var(--line-height-small)" },
        ],
      },
      fontWeight: {
        regular: "var(--font-weight-regular)",
        bold: "var(--font-weight-bold)",
      },
    },
  },
  darkMode: "class",
  plugins: [
    heroui({
      // HeroUIカスタムテーマ設定
      themes: {
        light: {
          colors: {
            background: "#ffffff",
            foreground: "#262626", 
            primary: {
              50: "#f0f9ff",
              100: "#e0f2fe", 
              200: "#bae6fd",
              300: "#7dd3fc",
              400: "#38bdf8",
              500: "#0ea5e9",
              600: "#0284c7",
              700: "#0369a1",
              800: "#075985",
              900: "#0c4a6e",
              DEFAULT: "#0ea5e9",
              foreground: "#ffffff",
            },
            secondary: {
              50: "#f8fafc",
              100: "#f1f5f9", 
              200: "#e2e8f0",
              300: "#cbd5e1",
              400: "#94a3b8",
              500: "#64748b",
              600: "#475569",
              700: "#334155",
              800: "#1e293b",
              900: "#0f172a",
              DEFAULT: "#64748b",
              foreground: "#ffffff",
            },
          },
        },
        dark: {
          colors: {
            background: "#262626",
            foreground: "#dedede",
            primary: {
              50: "#0f172a",
              100: "#1e293b",
              200: "#334155", 
              300: "#475569",
              400: "#64748b",
              500: "#94a3b8",
              600: "#cbd5e1",
              700: "#e2e8f0",
              800: "#f1f5f9",
              900: "#f8fafc",
              DEFAULT: "#94a3b8",
              foreground: "#262626",
            },
            secondary: {
              50: "#0c4a6e",
              100: "#075985",
              200: "#0369a1",
              300: "#0284c7", 
              400: "#0ea5e9",
              500: "#38bdf8",
              600: "#7dd3fc",
              700: "#bae6fd",
              800: "#e0f2fe",
              900: "#f0f9ff",
              DEFAULT: "#38bdf8",
              foreground: "#262626",
            },
          },
        },
      },
    }),
  ],
};
