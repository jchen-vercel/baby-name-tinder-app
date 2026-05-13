/** Dark glass UI aligned with app design tokens for Clerk embedded flows. */
export const clerkDarkAppearance = {
  baseTheme: "dark" as const,
  variables: {
    colorPrimary: "#5E6AD2",
    colorBackground: "#0a0a0c",
    colorText: "#EDEDEF",
    colorTextSecondary: "#8A8F98",
    colorInputBackground: "#0F0F12",
    colorInputText: "#f3f4f6",
    borderRadius: "0.5rem",
  },
  elements: {
    card: "border border-white/[0.06] shadow-[var(--shadow-card)]",
    formButtonPrimary:
      "bg-[#5E6AD2] hover:bg-[#6872D9] shadow-[var(--shadow-cta)]",
  },
};
