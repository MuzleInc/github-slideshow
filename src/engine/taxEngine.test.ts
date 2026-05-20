import { describe, expect, it } from 'vitest';
import { calculateTax } from './taxEngine';

describe('calculateTax', () => {
  it('calculates monthly skala podatkowa and includes ZUS', () => {
    const result = calculateTax({ mode: 'skala', monthlyRevenue: 25_000, monthlyCosts: 4_000 });
    expect(result.annualTaxableBase).toBe(222_000);
    expect(result.annualTaxAmount).toBeCloseTo(49_840, 2);
    expect(result.monthlyZusAmount).toBe(2_300);
    expect(result.annualTotalBurden).toBeCloseTo(77_440, 2);
  });

  it('calculates monthly podatek liniowy and includes ZUS', () => {
    const result = calculateTax({ mode: 'liniowy', monthlyRevenue: 20_000, monthlyCosts: 5_000 });
    expect(result.annualTaxableBase).toBe(180_000);
    expect(result.annualTaxAmount).toBeCloseTo(34_200, 2);
    expect(result.monthlyZusAmount).toBe(2_300);
    expect(result.monthlyTotalBurden).toBeCloseTo(5_150, 2);
  });

  it('calculates monthly ryczalt with selected rate and optional no ZUS', () => {
    const result = calculateTax({ mode: 'ryczalt', monthlyRevenue: 18_000, monthlyCosts: 2_000, ryczaltRateKey: 'rental', includeZus: false });
    expect(result.annualTaxableBase).toBe(216_000);
    expect(result.annualTaxAmount).toBeCloseTo(18_360, 2);
    expect(result.annualZusAmount).toBe(0);
    expect(result.monthlyTaxAmount).toBeCloseTo(1_530, 2);
  });
});
