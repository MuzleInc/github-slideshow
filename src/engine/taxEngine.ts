import { TAX_CONFIG_2026, TaxMode } from '../config/taxConfig2026';

export type TaxInput = {
  monthlyRevenue: number;
  monthlyCosts: number;
  mode: TaxMode;
  ryczaltRateKey?: keyof typeof TAX_CONFIG_2026.ryczalt.rates;
  includeZus?: boolean;
};

export type TaxResult = {
  monthlyTaxableBase: number;
  monthlyTaxAmount: number;
  monthlyZusAmount: number;
  monthlyTotalBurden: number;
  annualTaxableBase: number;
  annualTaxAmount: number;
  annualZusAmount: number;
  annualTotalBurden: number;
  effectiveRate: number;
};

const MONTHS_IN_YEAR = 12;
const nonNegative = (value: number): number => Math.max(0, value);

const calculateAnnualIncomeTax = (mode: TaxMode, annualRevenue: number, annualCosts: number, ryczaltRateKey?: keyof typeof TAX_CONFIG_2026.ryczalt.rates): { taxableBase: number; taxAmount: number } => {
  if (mode === 'ryczalt') {
    const rate = TAX_CONFIG_2026.ryczalt.rates[ryczaltRateKey ?? 'default'];
    const taxableBase = nonNegative(annualRevenue);
    return { taxableBase, taxAmount: taxableBase * rate };
  }

  const income = nonNegative(annualRevenue - annualCosts);

  if (mode === 'liniowy') {
    return {
      taxableBase: income,
      taxAmount: income * TAX_CONFIG_2026.liniowy.rate
    };
  }

  const { firstThreshold, firstRate, secondRate, kwotaWolna } = TAX_CONFIG_2026.skala;
  const taxableAfterAllowance = nonNegative(income - kwotaWolna);
  const firstPart = Math.min(taxableAfterAllowance, firstThreshold - kwotaWolna);
  const secondPart = nonNegative(taxableAfterAllowance - firstPart);

  return {
    taxableBase: taxableAfterAllowance,
    taxAmount: firstPart * firstRate + secondPart * secondRate
  };
};

export const calculateTax = (input: TaxInput): TaxResult => {
  const annualRevenue = nonNegative(input.monthlyRevenue) * MONTHS_IN_YEAR;
  const annualCosts = nonNegative(input.monthlyCosts) * MONTHS_IN_YEAR;

  const annualTax = calculateAnnualIncomeTax(input.mode, annualRevenue, annualCosts, input.ryczaltRateKey);

  const monthlyZusAmount = input.includeZus === false ? 0 : TAX_CONFIG_2026.zus.monthlySocial + TAX_CONFIG_2026.zus.monthlyHealth;
  const annualZusAmount = monthlyZusAmount * MONTHS_IN_YEAR;

  const annualTotalBurden = annualTax.taxAmount + annualZusAmount;
  const monthlyTaxAmount = annualTax.taxAmount / MONTHS_IN_YEAR;
  const monthlyTaxableBase = annualTax.taxableBase / MONTHS_IN_YEAR;

  return {
    monthlyTaxableBase,
    monthlyTaxAmount,
    monthlyZusAmount,
    monthlyTotalBurden: monthlyTaxAmount + monthlyZusAmount,
    annualTaxableBase: annualTax.taxableBase,
    annualTaxAmount: annualTax.taxAmount,
    annualZusAmount,
    annualTotalBurden,
    effectiveRate: annualRevenue > 0 ? annualTotalBurden / annualRevenue : 0
  };
};
