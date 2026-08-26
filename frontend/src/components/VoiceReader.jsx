// src/components/VoiceReader.jsx
import { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

export function VoiceReader() {
  const [reading, setReading] = useState(false);

  function toggleRead() {
    if (reading) {
      window.speechSynthesis.cancel();
      setReading(false);
      return;
    }
    const main = document.querySelector('main') || document.getElementById('root');
    if (!main) return;
    const text = main.innerText;
    if (!text.trim()) return;
    const utterance = new SpeechSynthesisUtterance(text.slice(0, 3000));
    utterance.lang = 'pt-BR';
    utterance.rate = 0.9;
    utterance.onend = () => setReading(false);
    utterance.onerror = () => setReading(false);
    window.speechSynthesis.speak(utterance);
    setReading(true);
  }

  if (!('speechSynthesis' in window)) return null;

  return (
    <button
      type="button"
      onClick={toggleRead}
      aria-label={reading ? 'Parar leitura em voz alta' : 'Ler página em voz alta'}
      className="fixed bottom-20 left-4 z-40 rounded-full p-3 shadow-lg focus-ring transition-colors"
      style={{
        background: reading ? 'var(--c-pink)' : 'var(--c-purple-dark)',
        color: 'white',
      }}
    >
      {reading ? <VolumeX size={20} /> : <Volume2 size={20} />}
    </button>
  );
}
