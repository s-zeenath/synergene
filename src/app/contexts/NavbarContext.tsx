"use client";
import React, { createContext, useContext, useState } from "react";

interface NavbarContextType {
  pageTitle: string;
  setPageTitle: (title: string) => void;
}

const NavbarContext = createContext<NavbarContextType | undefined>(undefined);

export const NavbarProvider = ({ children }: { children: React.ReactNode }) => {
  const [pageTitle, setPageTitle] = useState("dashboard");

  return (
    <NavbarContext.Provider value={{ pageTitle, setPageTitle }}>
      {children}
    </NavbarContext.Provider>
  );
};

export const useNavbar = () => {
  const context = useContext(NavbarContext);
  if (!context) throw new Error("useNavbar must be used within NavbarProvider");
  return context;
};
