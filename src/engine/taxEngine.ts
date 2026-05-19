import { TAX_CONFIG_2026, TaxMode } from '../config/taxConfig2026';

export type TaxInput = {
  annualRevenue: number;
  annualCosts: number;
  mode: TaxMode;
  ryczaltRateKey?: keyof typeof TAX_CONFIG_2026.ryczalt.rates;
};

export type TaxResult = {
  taxableBase: number;
  taxAmount: number;
  effectiveRate: number;
};

const nonNegative = (value: number): number => Math.max(0, value);

export const calculateTax = (input: TaxInput): TaxResult => {
  if (input.mode === 'ryczalt') {
    const rate = TAX_CONFIG_2026.ryczalt.rates[input.ryczaltRateKey ?? 'default'];
    const taxableBase = nonNegative(input.annualRevenue);
    const taxAmount = taxableBase * rate;
    return {
      taxableBase,
      taxAmount,
      effectiveRate: taxableBase > 0 ? taxAmount / taxableBase : 0
    };
  }

  const income = nonNegative(input.annualRevenue - input.annualCosts);

  if (input.mode === 'liniowy') {
    const taxAmount = income * TAX_CONFIG_2026.liniowy.rate;
    return {
      taxableBase: income,
      taxAmount,
      effectiveRate: income > 0 ? taxAmount / income : 0
    };
  }

  const { firstThreshold, firstRate, secondRate, kwotaWolna } = TAX_CONFIG_2026.skala;
  const taxableAfterAllowance = nonNegative(income - kwotaWolna);
  const firstPart = Math.min(taxableAfterAllowance, firstThreshold - kwotaWolna);
  const secondPart = nonNegative(taxableAfterAllowance - firstPart);
  const taxAmount = firstPart * firstRate + secondPart * secondRate;

  return {
    taxableBase: taxableAfterAllowance,
    taxAmount,
    effectiveRate: income > 0 ? taxAmount / income : 0
  };
};
