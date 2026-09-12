import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'kasseskabet:cost-basis:v1';

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

// Holder styr på "hvad har jeg selv sagt at jeg gav pr. stk." for hver vare
// (nøglet på item.id). Gemmes lokalt i browseren - arket havde ikke en
// entydig gennemsnitspris pr. kasse, så det er brugeren, der lægger den ind.
export function useCostBasis() {
  const [costBasis, setCostBasis] = useState(load);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(costBasis));
    } catch {
      // ikke kritisk
    }
  }, [costBasis]);

  const setItemCost = useCallback((itemId, valueDkk) => {
    setCostBasis((prev) => {
      const next = { ...prev };
      if (valueDkk === '' || valueDkk === null || Number.isNaN(valueDkk)) {
        delete next[itemId];
      } else {
        next[itemId] = valueDkk;
      }
      return next;
    });
  }, []);

  return { costBasis, setItemCost };
}
