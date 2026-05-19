import { useMemo, useState } from 'react';
import { calculateTax } from './engine/taxEngine';
import { TAX_CONFIG_2026, TaxMode } from './config/taxConfig2026';

const fmt = (value: number): string =>
  new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN', maximumFractionDigits: 2 }).format(value);

export function App() {
  const [mode, setMode] = useState<TaxMode>('skala');
  const [annualRevenue, setAnnualRevenue] = useState(250_000);
  const [annualCosts, setAnnualCosts] = useState(50_000);
  const [ryczaltRateKey, setRyczaltRateKey] = useState<keyof typeof TAX_CONFIG_2026.ryczalt.rates>('default');

  const result = useMemo(
    () => calculateTax({ annualRevenue, annualCosts, mode, ryczaltRateKey }),
    [annualRevenue, annualCosts, mode, ryczaltRateKey]
  );

  return (
    <main className="container">
      <h1>Poland JDG Tax Calculator (2026)</h1>
      <p className="subtitle">MVP for B2B / jednoosobowa działalność gospodarcza.</p>

      <section className="card form-grid">
        <label>
          Tax mode
          <select value={mode} onChange={(e) => setMode(e.target.value as TaxMode)}>
            <option value="skala">skala podatkowa</option>
            <option value="liniowy">podatek liniowy</option>
            <option value="ryczalt">ryczałt ewidencjonowany</option>
          </select>
        </label>

        <label>
          Annual revenue (PLN)
          <input type="number" value={annualRevenue} onChange={(e) => setAnnualRevenue(Number(e.target.value))} min={0} />
        </label>

        <label>
          Annual costs (PLN)
          <input type="number" value={annualCosts} onChange={(e) => setAnnualCosts(Number(e.target.value))} min={0} disabled={mode === 'ryczalt'} />
        </label>

        {mode === 'ryczalt' && (
          <label>
            Ryczałt rate
            <select value={ryczaltRateKey} onChange={(e) => setRyczaltRateKey(e.target.value as keyof typeof TAX_CONFIG_2026.ryczalt.rates)}>
              {Object.entries(TAX_CONFIG_2026.ryczalt.rates).map(([key, rate]) => (
                <option key={key} value={key}>{`${key} (${(rate * 100).toFixed(1)}%)`}</option>
              ))}
            </select>
          </label>
        )}
      </section>

      <section className="card results">
        <h2>Estimate</h2>
        <p>Taxable base: <strong>{fmt(result.taxableBase)}</strong></p>
        <p>Estimated annual tax: <strong>{fmt(result.taxAmount)}</strong></p>
        <p>Effective tax rate: <strong>{(result.effectiveRate * 100).toFixed(2)}%</strong></p>
      </section>

      <p className="disclaimer">
        Disclaimer: This calculator provides an estimate only and does not constitute legal or tax advice.
      </p>
    </main>
  );
}
