import { useMemo, useState } from 'react';
import { calculateTax } from './engine/taxEngine';
import { TAX_CONFIG_2026, TaxMode } from './config/taxConfig2026';

type Language = 'pl' | 'en' | 'ru';

type Copy = {
  title: string;
  subtitle: string;
  language: string;
  taxMode: string;
  monthlyRevenue: string;
  monthlyCosts: string;
  includeZus: string;
  ryczaltRate: string;
  estimate: string;
  monthlyTaxableBase: string;
  monthlyTax: string;
  monthlyZus: string;
  monthlyTotal: string;
  annualTax: string;
  annualZus: string;
  annualTotal: string;
  effectiveTaxRate: string;
  disclaimer: string;
};

const I18N: Record<Language, Copy> = {
  pl: {
    title: 'Kalkulator podatku JDG w Polsce (2026)', subtitle: 'Kalkulacja miesięczna + roczna dla B2B / JDG.', language: 'Język', taxMode: 'Forma opodatkowania', monthlyRevenue: 'Miesięczny przychód (PLN)', monthlyCosts: 'Miesięczne koszty (PLN)', includeZus: 'Uwzględnij ZUS', ryczaltRate: 'Stawka ryczałtu', estimate: 'Szacunek', monthlyTaxableBase: 'Miesięczna podstawa opodatkowania', monthlyTax: 'Szacowany podatek miesięczny', monthlyZus: 'ZUS miesięczny', monthlyTotal: 'Łączne obciążenie miesięczne', annualTax: 'Szacowany podatek roczny', annualZus: 'ZUS roczny', annualTotal: 'Łączne obciążenie roczne', effectiveTaxRate: 'Efektywna stopa obciążeń', disclaimer: 'Zastrzeżenie: Ten kalkulator przedstawia wyłącznie szacunek i nie stanowi porady prawnej ani podatkowej.'
  },
  en: {
    title: 'Poland JDG Tax Calculator (2026)', subtitle: 'Monthly + annual estimate for B2B / sole proprietorship (JDG).', language: 'Language', taxMode: 'Tax mode', monthlyRevenue: 'Monthly revenue (PLN)', monthlyCosts: 'Monthly costs (PLN)', includeZus: 'Include ZUS', ryczaltRate: 'Ryczałt rate', estimate: 'Estimate', monthlyTaxableBase: 'Monthly taxable base', monthlyTax: 'Estimated monthly tax', monthlyZus: 'Monthly ZUS', monthlyTotal: 'Monthly total burden', annualTax: 'Estimated annual tax', annualZus: 'Annual ZUS', annualTotal: 'Annual total burden', effectiveTaxRate: 'Effective burden rate', disclaimer: 'Disclaimer: This calculator provides an estimate only and does not constitute legal or tax advice.'
  },
  ru: {
    title: 'Калькулятор налога JDG в Польше (2026)', subtitle: 'Помесячный и годовой расчет для B2B / ИП (JDG).', language: 'Язык', taxMode: 'Режим налогообложения', monthlyRevenue: 'Месячная выручка (PLN)', monthlyCosts: 'Месячные расходы (PLN)', includeZus: 'Учитывать ZUS', ryczaltRate: 'Ставка ryczałt', estimate: 'Оценка', monthlyTaxableBase: 'Месячная налоговая база', monthlyTax: 'Оценочный налог в месяц', monthlyZus: 'ZUS в месяц', monthlyTotal: 'Общая нагрузка в месяц', annualTax: 'Оценочный налог за год', annualZus: 'ZUS за год', annualTotal: 'Общая нагрузка за год', effectiveTaxRate: 'Эффективная ставка нагрузки', disclaimer: 'Дисклеймер: этот калькулятор дает только оценку и не является юридической или налоговой консультацией.'
  }
};

const TAX_MODE_LABELS: Record<Language, Record<TaxMode, string>> = { pl: { skala: 'skala podatkowa', liniowy: 'podatek liniowy', ryczalt: 'ryczałt ewidencjonowany' }, en: { skala: 'progressive tax scale', liniowy: 'flat tax', ryczalt: 'lump-sum tax (ryczałt)' }, ru: { skala: 'прогрессивная шкала', liniowy: 'линейный налог', ryczalt: 'упрощенный налог (ryczałt)' } };

const fmt = (value: number, language: Language): string =>
  new Intl.NumberFormat(language === 'ru' ? 'ru-RU' : language === 'en' ? 'en-US' : 'pl-PL', { style: 'currency', currency: 'PLN', maximumFractionDigits: 2 }).format(value);

export function App() {
  const [language, setLanguage] = useState<Language>('pl');
  const [mode, setMode] = useState<TaxMode>('skala');
  const [monthlyRevenue, setMonthlyRevenue] = useState(20_000);
  const [monthlyCosts, setMonthlyCosts] = useState(4_000);
  const [includeZus, setIncludeZus] = useState(true);
  const [ryczaltRateKey, setRyczaltRateKey] = useState<keyof typeof TAX_CONFIG_2026.ryczalt.rates>('default');

  const t = I18N[language];
  const result = useMemo(() => calculateTax({ monthlyRevenue, monthlyCosts, mode, ryczaltRateKey, includeZus }), [monthlyRevenue, monthlyCosts, mode, ryczaltRateKey, includeZus]);

  return (
    <main className="container">
      <h1>{t.title}</h1>
      <p className="subtitle">{t.subtitle}</p>
      <section className="card form-grid">
        <label>{t.language}<select value={language} onChange={(e) => setLanguage(e.target.value as Language)}><option value="pl">Polski</option><option value="en">English</option><option value="ru">Русский</option></select></label>
        <label>{t.taxMode}<select value={mode} onChange={(e) => setMode(e.target.value as TaxMode)}><option value="skala">{TAX_MODE_LABELS[language].skala}</option><option value="liniowy">{TAX_MODE_LABELS[language].liniowy}</option><option value="ryczalt">{TAX_MODE_LABELS[language].ryczalt}</option></select></label>
        <label>{t.monthlyRevenue}<input type="number" value={monthlyRevenue} onChange={(e) => setMonthlyRevenue(Number(e.target.value))} min={0} /></label>
        <label>{t.monthlyCosts}<input type="number" value={monthlyCosts} onChange={(e) => setMonthlyCosts(Number(e.target.value))} min={0} disabled={mode === 'ryczalt'} /></label>
        <label><input type="checkbox" checked={includeZus} onChange={(e) => setIncludeZus(e.target.checked)} /> {t.includeZus}</label>
        {mode === 'ryczalt' && <label>{t.ryczaltRate}<select value={ryczaltRateKey} onChange={(e) => setRyczaltRateKey(e.target.value as keyof typeof TAX_CONFIG_2026.ryczalt.rates)}>{Object.entries(TAX_CONFIG_2026.ryczalt.rates).map(([key, rate]) => <option key={key} value={key}>{`${key} (${(rate * 100).toFixed(1)}%)`}</option>)}</select></label>}
      </section>
      <section className="card results">
        <h2>{t.estimate}</h2>
        <p>{t.monthlyTaxableBase}: <strong>{fmt(result.monthlyTaxableBase, language)}</strong></p>
        <p>{t.monthlyTax}: <strong>{fmt(result.monthlyTaxAmount, language)}</strong></p>
        <p>{t.monthlyZus}: <strong>{fmt(result.monthlyZusAmount, language)}</strong></p>
        <p>{t.monthlyTotal}: <strong>{fmt(result.monthlyTotalBurden, language)}</strong></p>
        <p>{t.annualTax}: <strong>{fmt(result.annualTaxAmount, language)}</strong></p>
        <p>{t.annualZus}: <strong>{fmt(result.annualZusAmount, language)}</strong></p>
        <p>{t.annualTotal}: <strong>{fmt(result.annualTotalBurden, language)}</strong></p>
        <p>{t.effectiveTaxRate}: <strong>{(result.effectiveRate * 100).toFixed(2)}%</strong></p>
      </section>
      <p className="disclaimer">{t.disclaimer}</p>
    </main>
  );
}
