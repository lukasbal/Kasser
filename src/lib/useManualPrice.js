import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'kasseskabet:manual-price:v1';

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

// Til varer, hvor CSFloat ikke kan give et entydigt prisopslag automatisk
// (fx en bestemt Doppler-fase, eller en vare vi ikke kunne genkende).
export function useManualPrice() {
  const [manualPrices, setManualPrices] = useState(load);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(manualPrices));
    } catch {
      // ikke kritisk
    }
  }, [manualPrices]);

  const setManualPriceDkk = useCallback((itemId, valueDkk) => {
    setManualPrices((prev) => {
      const next = { ...prev };
      if (valueDkk === '' || valueDkk === null || Number.isNaN(valueDkk)) {
        delete next[itemId];
      } else {
        next[itemId] = valueDkk;
      }
      return next;
    });
  }, []);

  return { manualPrices, setManualPriceDkk };
}
