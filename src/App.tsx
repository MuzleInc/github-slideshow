import { useMemo, useState } from 'react';
import { calculateTax } from './engine/taxEngine';
import { TAX_CONFIG_2026, TaxMode } from './config/taxConfig2026';

type Language = 'pl' | 'en' | 'ru';

type Copy = {
  title: string;
  subtitle: string;
  language: string;
  taxMode: string;
  annualRevenue: string;
  annualCosts: string;
  ryczaltRate: string;
  estimate: string;
  taxableBase: string;
  estimatedAnnualTax: string;
  effectiveTaxRate: string;
  disclaimer: string;
};

const I18N: Record<Language, Copy> = {
  pl: {
    title: 'Kalkulator podatku JDG w Polsce (2026)',
    subtitle: 'MVP dla B2B / jednoosobowej działalności gospodarczej.',
    language: 'Język',
    taxMode: 'Forma opodatkowania',
    annualRevenue: 'Roczny przychód (PLN)',
    annualCosts: 'Roczne koszty (PLN)',
    ryczaltRate: 'Stawka ryczałtu',
    estimate: 'Szacunek',
    taxableBase: 'Podstawa opodatkowania',
    estimatedAnnualTax: 'Szacowany roczny podatek',
    effectiveTaxRate: 'Efektywna stopa podatku',
    disclaimer: 'Zastrzeżenie: Ten kalkulator przedstawia wyłącznie szacunek i nie stanowi porady prawnej ani podatkowej.'
  },
  en: {
    title: 'Poland JDG Tax Calculator (2026)',
    subtitle: 'MVP for B2B / sole proprietorship (JDG).',
    language: 'Language',
    taxMode: 'Tax mode',
    annualRevenue: 'Annual revenue (PLN)',
    annualCosts: 'Annual costs (PLN)',
    ryczaltRate: 'Ryczałt rate',
    estimate: 'Estimate',
    taxableBase: 'Taxable base',
    estimatedAnnualTax: 'Estimated annual tax',
    effectiveTaxRate: 'Effective tax rate',
    disclaimer: 'Disclaimer: This calculator provides an estimate only and does not constitute legal or tax advice.'
  },
  ru: {
    title: 'Калькулятор налога JDG в Польше (2026)',
    subtitle: 'MVP для B2B / индивидуального предпринимателя (JDG).',
    language: 'Язык',
    taxMode: 'Режим налогообложения',
    annualRevenue: 'Годовая выручка (PLN)',
    annualCosts: 'Годовые расходы (PLN)',
    ryczaltRate: 'Ставка ryczałt',
    estimate: 'Оценка',
    taxableBase: 'Налоговая база',
    estimatedAnnualTax: 'Оценочный годовой налог',
    effectiveTaxRate: 'Эффективная ставка налога',
    disclaimer: 'Дисклеймер: этот калькулятор дает только оценку и не является юридической или налоговой консультацией.'
  }
};

const TAX_MODE_LABELS: Record<Language, Record<TaxMode, string>> = {
  pl: {
    skala: 'skala podatkowa',
    liniowy: 'podatek liniowy',
    ryczalt: 'ryczałt ewidencjonowany'
  },
  en: {
    skala: 'progressive tax scale',
    liniowy: 'flat tax',
    ryczalt: 'lump-sum tax (ryczałt)'
  },
  ru: {
    skala: 'прогрессивная шкала',
    liniowy: 'линейный налог',
    ryczalt: 'упрощенный налог (ryczałt)'
  }
};

const fmt = (value: number, language: Language): string =>
  new Intl.NumberFormat(language === 'ru' ? 'ru-RU' : language === 'en' ? 'en-US' : 'pl-PL', {
    style: 'currency',
    currency: 'PLN',
    maximumFractionDigits: 2
  }).format(value);

export function App() {
  const [language, setLanguage] = useState<Language>('pl');
  const [mode, setMode] = useState<TaxMode>('skala');
  const [annualRevenue, setAnnualRevenue] = useState(250_000);
  const [annualCosts, setAnnualCosts] = useState(50_000);
  const [ryczaltRateKey, setRyczaltRateKey] = useState<keyof typeof TAX_CONFIG_2026.ryczalt.rates>('default');

  const t = I18N[language];

  const result = useMemo(
    () => calculateTax({ annualRevenue, annualCosts, mode, ryczaltRateKey }),
    [annualRevenue, annualCosts, mode, ryczaltRateKey]
  );

  return (
    <main className="container">
      <h1>{t.title}</h1>
      <p className="subtitle">{t.subtitle}</p>

      <section className="card form-grid">
        <label>
          {t.language}
          <select value={language} onChange={(e) => setLanguage(e.target.value as Language)}>
            <option value="pl">Polski</option>
            <option value="en">English</option>
            <option value="ru">Русский</option>
          </select>
        </label>

        <label>
          {t.taxMode}
          <select value={mode} onChange={(e) => setMode(e.target.value as TaxMode)}>
            <option value="skala">{TAX_MODE_LABELS[language].skala}</option>
            <option value="liniowy">{TAX_MODE_LABELS[language].liniowy}</option>
            <option value="ryczalt">{TAX_MODE_LABELS[language].ryczalt}</option>
          </select>
        </label>

        <label>
          {t.annualRevenue}
          <input type="number" value={annualRevenue} onChange={(e) => setAnnualRevenue(Number(e.target.value))} min={0} />
        </label>

        <label>
          {t.annualCosts}
          <input type="number" value={annualCosts} onChange={(e) => setAnnualCosts(Number(e.target.value))} min={0} disabled={mode === 'ryczalt'} />
        </label>

        {mode === 'ryczalt' && (
          <label>
            {t.ryczaltRate}
            <select value={ryczaltRateKey} onChange={(e) => setRyczaltRateKey(e.target.value as keyof typeof TAX_CONFIG_2026.ryczalt.rates)}>
              {Object.entries(TAX_CONFIG_2026.ryczalt.rates).map(([key, rate]) => (
                <option key={key} value={key}>{`${key} (${(rate * 100).toFixed(1)}%)`}</option>
              ))}
            </select>
          </label>
        )}
      </section>

      <section className="card results">
        <h2>{t.estimate}</h2>
        <p>{t.taxableBase}: <strong>{fmt(result.taxableBase, language)}</strong></p>
        <p>{t.estimatedAnnualTax}: <strong>{fmt(result.taxAmount, language)}</strong></p>
        <p>{t.effectiveTaxRate}: <strong>{(result.effectiveRate * 100).toFixed(2)}%</strong></p>
      </section>

      <p className="disclaimer">{t.disclaimer}</p>
    </main>
  );
}
