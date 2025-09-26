"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()

  // Log current theme states for debugging
  React.useEffect(() => {
    console.log("ThemeToggle: Current 'theme' state:", theme);
    console.log("ThemeToggle: Current 'resolvedTheme' state:", resolvedTheme);
    // Also check if the 'dark' class is on the html element
    const htmlElement = document.documentElement;
    console.log("ThemeToggle: HTML element has 'dark' class:", htmlElement.classList.contains('dark'));
  }, [theme, resolvedTheme]);

  const toggleTheme = () => {
    const newTheme = resolvedTheme === "dark" ? "light" : "dark";
    console.log("ThemeToggle: Attempting to set theme to:", newTheme);
    setTheme(newTheme);
  }

  return (
    <Button variant="outline" size="icon" onClick={toggleTheme}>
      {resolvedTheme === "dark" ? (
        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all" />
      ) : (
        <Moon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}