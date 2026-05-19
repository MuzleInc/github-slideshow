export type TaxMode = 'skala' | 'liniowy' | 'ryczalt';

export const TAX_CONFIG_2026 = {
  skala: {
    firstThreshold: 120_000,
    firstRate: 0.12,
    secondRate: 0.32,
    kwotaWolna: 30_000
  },
  liniowy: {
    rate: 0.19
  },
  ryczalt: {
    rates: {
      default: 0.12,
      it: 0.12,
      health: 0.14,
      rental: 0.085
    }
  }
} as const;
