import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { apiFetch } from '../lib/api';

export interface PlanPrice {
  token: number;
  full:  number;
}

export interface Prices {
  plans: {
    sapling: PlanPrice;
    adult:   PlanPrice;
    grand:   PlanPrice;
  };
  boxes: {
    chausa:  number;
    dasheri: number;
    langra:  number;
  };
}

const PricesContext = createContext<Prices | null>(null);

export function PricesProvider({ children }: { children: ReactNode }) {
  const [prices, setPrices] = useState<Prices | null>(null);

  useEffect(() => {
    apiFetch<Prices>('/api/prices').then(setPrices).catch(() => {});
  }, []);

  return <PricesContext.Provider value={prices}>{children}</PricesContext.Provider>;
}

export function usePrices() {
  return useContext(PricesContext);
}
