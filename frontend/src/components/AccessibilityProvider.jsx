// src/components/AccessibilityProvider.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

const AccessibilityContext = createContext({});

export function AccessibilityProvider({ children }) {
  const { user } = useAuth();
  const needs = user?.accessibility_needs || '';

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('a11y-visual', 'a11y-dyslexia', 'a11y-autism', 'a11y-motor');
    if (needs === 'visual') root.classList.add('a11y-visual');
    if (needs === 'dislexia') root.classList.add('a11y-dyslexia');
    if (needs === 'autismo') root.classList.add('a11y-autism');
    if (needs === 'motora') root.classList.add('a11y-motor');
    return () => root.classList.remove('a11y-visual', 'a11y-dyslexia', 'a11y-autism', 'a11y-motor');
  }, [needs]);

  return (
    <AccessibilityContext.Provider value={{ needs }}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  return useContext(AccessibilityContext);
}
