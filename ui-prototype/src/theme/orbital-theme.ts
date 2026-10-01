import { StyleSheet } from "react-native";

/*
  Orbital light theme
  -------------------
  Reusable design tokens and shared styles for React Native.

  Example:
    import { theme, sharedStyles } from "./orbital-theme";

    <View style={sharedStyles.card}>
      <Text style={sharedStyles.heading1}>My Heading</Text>
    </View>

  Keep screen-specific layout styles in each screen/component.
*/

export const theme = {
  colors: {
    // Brand-inspired colors
    navy: "#284765",
    gold: "#B1945D",

    // Neutral UI colors
    ink: "#1F2933",
    slate: "#647383",
    mist: "#E9EDF0",
    warmWhite: "#F7F5F1",
    white: "#FFFFFF",

    // Semantic aliases
    background: "#F7F5F1",
    surface: "#FFFFFF",
    primary: "#284765",
    accent: "#B1945D",
    text: "#1F2933",
    textMuted: "#647383",
    border: "#C8D0D6",
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 28,
  },

  radius: {
    sm: 4,
    md: 8,
    lg: 12,
  },

  typography: {
    heading1: {
      fontSize: 30,
      lineHeight: 36,
      fontWeight: "700" as const,
    },
    heading2: {
      fontSize: 20,
      lineHeight: 26,
      fontWeight: "600" as const,
    },
    body: {
      fontSize: 16,
      lineHeight: 24,
      fontWeight: "400" as const,
    },
    label: {
      fontSize: 13,
      lineHeight: 18,
      fontWeight: "600" as const,
    },
    button: {
      fontSize: 15,
      lineHeight: 20,
      fontWeight: "700" as const,
    },
    eyebrow: {
      fontSize: 12,
      lineHeight: 16,
      fontWeight: "700" as const,
      letterSpacing: 1.2,
    },
  },
};

export const sharedStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },

  content: {
    padding: theme.spacing.xl,
  },

  header: {
    minHeight: 58,
    paddingHorizontal: theme.spacing.xl,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: theme.colors.navy,
  },

  headerText: {
    color: theme.colors.white,
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 1.5,
  },

  heading1: {
    color: theme.colors.ink,
    ...theme.typography.heading1,
  },

  heading2: {
    color: theme.colors.navy,
    ...theme.typography.heading2,
  },

  body: {
    color: theme.colors.ink,
    ...theme.typography.body,
  },

  mutedText: {
    color: theme.colors.slate,
    ...theme.typography.body,
  },

  label: {
    color: theme.colors.slate,
    ...theme.typography.label,
  },

  input: {
    minHeight: 46,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.white,
    paddingHorizontal: theme.spacing.md,
    color: theme.colors.ink,
    fontSize: 16,
  },

  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 1.5,
    borderColor: theme.colors.navy,
    borderRadius: theme.radius.sm,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.white,
  },

  checkboxChecked: {
    backgroundColor: theme.colors.navy,
  },

  primaryButton: {
    minHeight: 46,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.navy,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: theme.spacing.lg,
  },

  primaryButtonText: {
    color: theme.colors.white,
    ...theme.typography.button,
  },

  secondaryButton: {
    minHeight: 46,
    borderWidth: 1.5,
    borderColor: theme.colors.gold,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.white,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: theme.spacing.lg,
  },

  secondaryButtonText: {
    color: theme.colors.navy,
    ...theme.typography.button,
  },

  card: {
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.mist,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,

    shadowColor: "#000000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },

    elevation: 2,
  },

  cardAccent: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.gold,
    marginBottom: theme.spacing.sm,
  },

  listItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },

  listBullet: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: theme.colors.gold,
  },
});

export default theme;
