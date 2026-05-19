import { describe, expect, it } from 'vitest';
import { calculateTax } from './taxEngine';

describe('calculateTax', () => {
  it('calculates skala podatkowa for income above threshold', () => {
    const result = calculateTax({ mode: 'skala', annualRevenue: 300_000, annualCosts: 50_000 });
    expect(result.taxableBase).toBe(220_000);
    expect(result.taxAmount).toBeCloseTo(49_200, 2);
  });

  it('calculates podatek liniowy', () => {
    const result = calculateTax({ mode: 'liniowy', annualRevenue: 300_000, annualCosts: 100_000 });
    expect(result.taxableBase).toBe(200_000);
    expect(result.taxAmount).toBeCloseTo(38_000, 2);
  });

  it('calculates ryczalt ewidencjonowany with selected rate', () => {
    const result = calculateTax({ mode: 'ryczalt', annualRevenue: 200_000, annualCosts: 99_000, ryczaltRateKey: 'rental' });
    expect(result.taxableBase).toBe(200_000);
    expect(result.taxAmount).toBeCloseTo(17_000, 2);
  });
});
