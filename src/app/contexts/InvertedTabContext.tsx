"use client";
import React, { createContext, useContext } from "react";
import { useTheme } from "@/components/ui/ThemeToggle";

type Theme = "light" | "dark";

const InvertedThemeContext = createContext<boolean>(false);

export const useInvertedTheme = () => useContext(InvertedThemeContext);

export const InvertedThemeProvider = ({
  children,
  invert = false,
}: {
  children: React.ReactNode;
  invert?: boolean;
}) => {
  return (
    <InvertedThemeContext.Provider value={invert}>
      {children}
    </InvertedThemeContext.Provider>
  );
};

export const useEffectiveTheme = (): Theme => {
  const { theme } = useTheme();
  const isInverted = useInvertedTheme();

  if (isInverted) {
    return theme === "light" ? "dark" : "light";
  }
  return theme;
};
