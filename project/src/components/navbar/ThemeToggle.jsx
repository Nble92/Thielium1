import { Sun, Moon } from 'lucide-react';

export function ThemeToggle({ darkMode, setDarkMode }) {
  return (
    <button
      onClick={() => setDarkMode(!darkMode)}
      className="p-2 rounded-lg bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
      aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
    >
      {darkMode ? (
        <Sun className="w-5 h-5 text-gray-700 dark:text-gray-200" />
      ) : (
        <Moon className="w-5 h-5 text-gray-700 dark:text-gray-200" />
      )}
    </button>
  );
}