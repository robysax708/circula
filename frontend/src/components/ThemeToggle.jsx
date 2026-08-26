import { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';

export function ThemeToggle() {
  const [dark, setDark] = useState(() => localStorage.getItem('circula_theme') === 'dark');

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('circula_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('circula_theme', 'light');
    }
  }, [dark]);

  return (
    <button
      type="button"
      onClick={() => setDark((d) => !d)}
      aria-label={dark ? 'Modo claro' : 'Modo escuro'}
      className="p-2 rounded-full focus-ring transition-colors"
      style={{ background: dark ? 'var(--c-yellow)' : 'var(--c-purple-dark)', color: dark ? '#221833' : 'white' }}
    >
      {dark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}