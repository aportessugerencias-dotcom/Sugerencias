
export interface Suggestion {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  zona: string;
  descripcion: string;
  timestamp: number;
}

const STORAGE_KEY = 'barrio_sugerencias';

export const getSuggestions = (): Suggestion[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const addSuggestion = (suggestion: Omit<Suggestion, 'id' | 'timestamp'>) => {
  const suggestions = getSuggestions();
  const newSuggestion = {
    ...suggestion,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify([newSuggestion, ...suggestions]));
  return newSuggestion;
};
