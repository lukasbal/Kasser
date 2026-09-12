import { useEffect, useMemo, useState } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { PEOPLE } from './data/holdings';
import { fetchPrices, fetchUsdToDkk, cacheKeyFor, getSettings, saveSettings } from './lib/csfloat';
import { useManualPrice } from './lib/useManualPrice';
import { logTodaysValue, getLoggedHistory } from './lib/valueLog';
import './App.css';

const DKK = new Intl.NumberFormat('da-DK', {
  style: 'currency',
  currency: 'DKK',
  maximumFractionDigits: 0,
});
const DKK2 = new Intl.NumberFormat('da-DK', {
  style: 'currency',
  currency: 'DKK',
  maximumFractionDigits: 2,
});
const DATE_FMT = new Intl.DateTimeFormat('da-DK', { day: '2-digit', month: 'short' });

function allItemsFor(personKey) {
  const person = PEOPLE[personKey];
  return person.knife ? [...person.holdings, person.knife] : person.holdings;
}

// Slår to {date, value}-serier sammen til én kombineret sum-serie, ved at
// fremad-udfylde huller med sidst kendte værdi (nyttigt når to dele af
// porteføljen - fx kasser og kniv - er blevet prischecket på forskellige
// datoer).
function mergeHistories(seriesA, seriesB) {
  const dates = Array.from(new Set([...seriesA, ...seriesB].map((p) => p.date))).sort();
  let lastA = null;
  let lastB = null;
  const aByDate = Object.fromEntries(seriesA.map((p) => [p.date, p.value]));
  const bByDate = Object.fromEntries(seriesB.map((p) => [p.date, p.value]));
  return dates.map((date) => {
    if (aByDate[date] != null) lastA = aByDate[date];
    if (bByDate[date] != null) lastB = bByDate[date];
    return { date, value: (lastA || 0) + (lastB || 0) };
  });
}

export default function App() {
  const [personKey, setPersonKey] = useState('far');
  const [priceState, setPriceState] = useState({}); // cacheKey -> { usdCents, error, fromCache }
  const [loading, setLoading] = useState(false);
  const [usdToDkk, setUsdToDkk] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const { manualPrices, setManualPriceDkk } = useManualPrice();
  const [showSettings, setShowSettings] = useState(false);
  const [csfloatApiKey, setCsfloatApiKey] = useState(() => getSettings().csfloatApiKey || '');

  const person = PEOPLE[personKey];
  const items = useMemo(() => allItemsFor(personKey), [personKey]);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      const rate = await fetchUsdToDkk();
      if (cancelled) return;
      setUsdToDkk(rate);

      const lookups = items
        .filter((i) => i.marketHashName)
        .map((i) => ({ marketHashName: i.marketHashName, paintIndex: i.paintIndex, defIndex: i.defIndex }));

      await fetchPrices(lookups, {
        onItemResolved: (key, result) => {
          if (cancelled) return;
          setPriceState((prev) => ({ ...prev, [key]: result }));
        },
      });
      if (!cancelled) {
        setLastUpdated(new Date());
        setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [items]);

  const rows = items.map((item) => {
    const key = item.marketHashName ? cacheKeyFor(item.marketHashName, item.paintIndex, item.defIndex) : null;
    const priceInfo = key ? priceState[key] : null;
    const livePriceDkk =
      priceInfo?.usdCents != null && usdToDkk ? (priceInfo.usdCents / 100) * usdToDkk : null;
    const manualDkk = manualPrices[item.id];
    const currentPriceDkk = item.unresolved || livePriceDkk == null ? manualDkk ?? null : livePriceDkk;

    const totalValue = currentPriceDkk != null ? currentPriceDkk * item.quantity : null;

    let profit = null;
    if (totalValue != null) {
      if (item.baselinePriceDkk != null) {
        profit = (currentPriceDkk - item.baselinePriceDkk) * item.quantity;
      } else if (item.baselineTotalDkk != null) {
        profit = totalValue - item.baselineTotalDkk;
      }
    }
    const profitPct =
      profit != null
        ? profit / ((item.baselinePriceDkk ?? 0) * item.quantity || item.baselineTotalDkk || 1)
        : null;

    return {
      ...item,
      priceInfo,
      currentPriceDkk,
      totalValue,
      profit,
      profitPct,
      needsManualPrice: item.unresolved,
    };
  });

  const totalValue = rows.reduce((sum, r) => sum + (r.totalValue || 0), 0);
  const allRowsHaveProfit = rows.every((r) => r.profit != null);
  const totalProfit = person.baselineTotalDkk
    ? totalValue - person.baselineTotalDkk
    : allRowsHaveProfit
    ? rows.reduce((sum, r) => sum + r.profit, 0)
    : null;
  const baselineReference = person.baselineTotalDkk || totalValue - (totalProfit || 0);
  const totalProfitPct = totalProfit != null && baselineReference ? totalProfit / baselineReference : null;

  // Historik-graf: ark-data + evt. knivhistorik (Far) + jeres egne loggede
  // besøg fremover.
  const chartData = useMemo(() => {
    let base = person.valueHistory;
    if (person.knifeValueHistory) {
      base = mergeHistories(person.valueHistory, person.knifeValueHistory);
    }
    const logged = getLoggedHistory(personKey);
    const merged = [...base, ...logged.filter((l) => !base.some((b) => b.date === l.date))];
    return merged
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((p) => ({ ...p, label: DATE_FMT.format(new Date(p.date)) }));
  }, [personKey, person]);

  // Log dagens samlede værdi, når priserne er færdighentet, så grafen kan
  // fortsætte fremover.
  useEffect(() => {
    if (!loading && totalValue > 0) {
      logTodaysValue(personKey, totalValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, totalValue, personKey]);

  return (
    <div className="page">
      <header className="hero">
        <p className="eyebrow">Kasseskabet</p>
        <h1>CS2 kasse-investeringer</h1>
        <div className="tabs">
          {Object.entries(PEOPLE).map(([key, p]) => (
            <button
              key={key}
              className={key === personKey ? 'tab tab--active' : 'tab'}
              onClick={() => setPersonKey(key)}
            >
              {p.label}
            </button>
          ))}
        </div>
        <p className="subtitle">{person.subtitle}</p>
      </header>

      <section className="summary">
        <div className="summary-card summary-card--accent">
          <span className="summary-label">Nuværende værdi</span>
          <span className="summary-figure">{DKK.format(totalValue)}</span>
        </div>
        <div className="summary-card">
          <span className="summary-label">Baseline ({person.baselineDate})</span>
          <span className="summary-figure">
            {baselineReference ? DKK.format(baselineReference) : '—'}
          </span>
        </div>
        <div className="summary-card">
          <span className="summary-label">Profit siden {person.baselineDate}</span>
          <span
            className={
              'summary-figure ' +
              (totalProfit == null ? '' : totalProfit >= 0 ? 'positive' : 'negative')
            }
          >
            {totalProfit != null
              ? `${DKK.format(totalProfit)} (${(totalProfitPct * 100).toFixed(1)}%)`
              : 'Venter på priser…'}
          </span>
        </div>
      </section>

      {chartData.length > 1 && (
        <section className="chart-card">
          <p className="chart-title">Samlet porteføljeværdi over tid</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#3a3226" />
              <XAxis dataKey="label" stroke="#c9b98a" tick={{ fontSize: 11 }} />
              <YAxis
                stroke="#c9b98a"
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => `${Math.round(v / 1000)}k`}
                width={40}
              />
              <Tooltip
                contentStyle={{ background: '#1c1712', border: '1px solid #4a3f2e', color: '#f1e6c8' }}
                formatter={(v) => DKK.format(v)}
                labelFormatter={(_, payload) => payload?.[0]?.payload?.date}
              />
              <Line type="monotone" dataKey="value" stroke="#d4af37" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </section>
      )}

      <section className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Kasse</th>
              <th>Antal</th>
              <th>Pris/stk.</th>
              <th>Værdi i alt</th>
              <th>Profit</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>
                  {r.name}
                  {r.note && <div className="row-note">{r.note}</div>}
                  {r.priceInfo?.error && !r.needsManualPrice && (
                    <div className="row-note row-note--error">
                      Kunne ikke hente pris ({r.priceInfo.error})
                    </div>
                  )}
                </td>
                <td>{r.quantity.toLocaleString('da-DK')}</td>
                <td>
                  {r.needsManualPrice ? (
                    <input
                      type="number"
                      className="cell-input"
                      placeholder="Indtast DKK"
                      value={manualPrices[r.id] ?? ''}
                      onChange={(e) =>
                        setManualPriceDkk(r.id, e.target.value === '' ? '' : Number(e.target.value))
                      }
                    />
                  ) : r.currentPriceDkk != null ? (
                    DKK2.format(r.currentPriceDkk)
                  ) : (
                    '…'
                  )}
                </td>
                <td>{r.totalValue != null ? DKK.format(r.totalValue) : '—'}</td>
                <td className={r.profit == null ? '' : r.profit >= 0 ? 'positive' : 'negative'}>
                  {r.profit != null ? DKK.format(r.profit) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <footer className="footer">
        <span>
          {loading
            ? 'Henter priser fra CSFloat…'
            : lastUpdated
            ? `Priser opdateret ${lastUpdated.toLocaleTimeString('da-DK')} · kurs 1 USD = ${usdToDkk?.toFixed(2)} DKK`
            : ''}
        </span>
        <span className="footer-note">
          Priser er den billigste aktive annonce på CSFloat. Profit regnes ud fra jeres egne
          historiske priser/porteføljeværdi, ikke en indtastet købspris.
        </span>
        <button className="settings-toggle" onClick={() => setShowSettings((s) => !s)}>
          {showSettings ? 'Skjul indstillinger' : 'Avanceret: CSFloat-adgang'}
        </button>
        {showSettings && (
          <div className="settings-panel">
            <div className="settings-row">
              <input
                type="password"
                className="cell-input cell-input--wide"
                placeholder="CSFloat API"
                value={csfloatApiKey}
                onChange={(e) => setCsfloatApiKey(e.target.value)}
                autoComplete="off"
              />
              <button
                onClick={() => {
                  saveSettings({ ...getSettings(), csfloatApiKey });
                  window.location.reload();
                }}
              >
                Gem og genindlæs
              </button>
            </div>
          </div>
        )}
      </footer>
    </div>
  );
}
