import { useEffect, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { PEOPLE } from './data/holdings';
import { fetchPrices, fetchUsdToDkk } from './lib/csfloat';
import { useCostBasis } from './lib/useCostBasis';
import { useManualPrice } from './lib/useManualPrice';
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

function allItemsFor(personKey) {
  const person = PEOPLE[personKey];
  return person.knife ? [...person.holdings, person.knife] : person.holdings;
}

export default function App() {
  const [personKey, setPersonKey] = useState('far');
  const [priceState, setPriceState] = useState({}); // marketHashName -> { usdCents, error, fromCache }
  const [loading, setLoading] = useState(false);
  const [usdToDkk, setUsdToDkk] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const { costBasis, setItemCost } = useCostBasis();
  const { manualPrices, setManualPriceDkk } = useManualPrice();

  const person = PEOPLE[personKey];
  const items = useMemo(() => allItemsFor(personKey), [personKey]);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      const rate = await fetchUsdToDkk();
      if (cancelled) return;
      setUsdToDkk(rate);

      const names = items.map((i) => i.marketHashName).filter(Boolean);
      await fetchPrices(names, {
        onItemResolved: (name, result) => {
          if (cancelled) return;
          setPriceState((prev) => ({ ...prev, [name]: result }));
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
    const priceInfo = item.marketHashName ? priceState[item.marketHashName] : null;
    const livePriceDkk =
      priceInfo?.usdCents != null && usdToDkk ? (priceInfo.usdCents / 100) * usdToDkk : null;
    const manualDkk = manualPrices[item.id];
    const currentPriceDkk = item.manualPriceOnly || item.unresolved || livePriceDkk == null
      ? manualDkk ?? null
      : livePriceDkk;

    const cost = costBasis[item.id];
    const totalValue = currentPriceDkk != null ? currentPriceDkk * item.quantity : null;
    const totalCost = cost != null ? cost * item.quantity : null;
    const profit = totalValue != null && totalCost != null ? totalValue - totalCost : null;
    const profitPct = profit != null && totalCost ? profit / totalCost : null;

    return {
      ...item,
      priceInfo,
      currentPriceDkk,
      totalValue,
      totalCost,
      profit,
      profitPct,
      needsManualPrice: item.manualPriceOnly || item.unresolved,
    };
  });

  const totals = rows.reduce(
    (acc, r) => {
      acc.value += r.totalValue || 0;
      acc.cost += r.totalCost || 0;
      acc.hasCost = acc.hasCost || r.totalCost != null;
      return acc;
    },
    { value: 0, cost: 0, hasCost: false }
  );
  const totalProfit = totals.hasCost ? totals.value - totals.cost : null;
  const totalProfitPct = totalProfit != null && totals.cost ? totalProfit / totals.cost : null;

  const chartData = rows
    .filter((r) => r.totalValue != null)
    .map((r) => ({ name: r.name.replace(' Case', ''), Værdi: Math.round(r.totalValue) }))
    .sort((a, b) => b.Værdi - a.Værdi);

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
          <span className="summary-figure">{DKK.format(totals.value)}</span>
        </div>
        <div className="summary-card">
          <span className="summary-label">Investeret</span>
          <span className="summary-figure">
            {totals.hasCost ? DKK.format(totals.cost) : '—'}
          </span>
        </div>
        <div className="summary-card">
          <span className="summary-label">Profit</span>
          <span
            className={
              'summary-figure ' +
              (totalProfit == null ? '' : totalProfit >= 0 ? 'positive' : 'negative')
            }
          >
            {totalProfit != null
              ? `${DKK.format(totalProfit)} (${(totalProfitPct * 100).toFixed(1)}%)`
              : 'Indtast købspris nedenfor'}
          </span>
        </div>
      </section>

      {chartData.length > 0 && (
        <section className="chart-card">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#3a3226" />
              <XAxis dataKey="name" stroke="#c9b98a" tick={{ fontSize: 11 }} interval={0} angle={-30} textAnchor="end" height={70} />
              <YAxis stroke="#c9b98a" tick={{ fontSize: 11 }} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
              <Tooltip
                contentStyle={{ background: '#1c1712', border: '1px solid #4a3f2e', color: '#f1e6c8' }}
                formatter={(v) => DKK.format(v)}
              />
              <Bar dataKey="Værdi" fill="#d4af37" radius={[3, 3, 0, 0]} />
            </BarChart>
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
              <th>Købspris/stk. (DKK)</th>
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
                <td>
                  <input
                    type="number"
                    className="cell-input"
                    placeholder="Indtast DKK"
                    value={costBasis[r.id] ?? ''}
                    onChange={(e) =>
                      setItemCost(r.id, e.target.value === '' ? '' : Number(e.target.value))
                    }
                  />
                </td>
                <td className={r.profit == null ? '' : r.profit >= 0 ? 'positive' : 'negative'}>
                  {r.profit != null
                    ? `${DKK.format(r.profit)} (${(r.profitPct * 100).toFixed(1)}%)`
                    : '—'}
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
          Priser er den billigste aktive annonce på CSFloat og opdateres automatisk. Købspriser gemmes kun i denne browser.
        </span>
      </footer>
    </div>
  );
}
