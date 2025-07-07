/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/icons/**/*.{js,ts,jsx,tsx,svg}",
    "./src/styles/globals.css", // 👈 このように globals.css を追加
  ],
  safelist: ["text-project-template-blue-70"], // ✅ 明示的に safelist に追加
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
        projectTemplate: {
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
  plugins: [],
};
