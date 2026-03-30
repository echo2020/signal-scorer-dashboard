'use client';

import { useState, useEffect } from 'react';

interface Ticker {
  currency_pair: string;
  last: string;
  change_percentage: string;
  high_24h: string;
  low_24h: string;
  base_volume: string;
  quote_volume: string;
}

interface MybotState {
  equity: number;
  total_pnl: number;
  win_rate: number;
  total_trades: number;
  version: string;
  emergency_stop: boolean;
  trend_states: Record<string, string>;
  hmm_regime: string;
  hmm_confidence: number;
  positions: Record<string, any>;
  trade_history: Array<{
    pair: string;
    side: string;
    entry_price: number;
    exit_price: number;
    pnl: number;
    exit_reason: string;
  }>;
  daily_pnl: number;
  total_capital: number;
}

const PAIRS = ['BTC_USDT', 'ETH_USDT', 'SOL_USDT'];

export default function Dashboard() {
  const [tickers, setTickers] = useState<Record<string, Ticker>>({});
  const [mybot, setMybot] = useState<MybotState | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [error, setError] = useState<string>('');

  const fetchData = async () => {
    try {
      // Fetch tickers
      const tickerPromises = PAIRS.map(async (pair) => {
        const res = await fetch(`/api/ticker/${pair}`);
        return { pair, data: await res.json() };
      });
      const results = await Promise.all(tickerPromises);
      const newTickers: Record<string, Ticker> = {};
      results.forEach(({ pair, data }) => {
        if (!data.error) newTickers[pair] = data;
      });
      setTickers(newTickers);

      // Fetch mybot state
      try {
        const botRes = await fetch('/api/mybot');
        const botData = await botRes.json();
        if (!botData.error) setMybot(botData);
      } catch {}

      setLastUpdate(new Date());
      setError('');
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const formatPnl = (val: number) => {
    const sign = val >= 0 ? '+' : '';
    const color = val >= 0 ? 'text-emerald-400' : 'text-red-400';
    return <span className={color}>{sign}${val.toFixed(2)}</span>;
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              <span className="text-emerald-400">📊</span> Signal Scorer
            </h1>
            <p className="text-sm text-gray-400">Multi-Bot Trading Dashboard</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-sm text-gray-300">Live</span>
            </div>
            <span className="text-xs text-gray-500">
              {lastUpdate.toLocaleTimeString()}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
            ⚠️ {error}
          </div>
        )}

        {/* ===== SONIC TRADING BOT ===== */}
        <section className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-xl font-bold text-blue-400">🤖 Sonic Trading Bot</h2>
            <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded">
              {mybot?.version || '—'}
            </span>
            <span className="text-xs px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded">
              DRY RUN
            </span>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <div className="text-xs text-gray-500 mb-1">Equity</div>
              <div className="text-xl font-bold font-mono">${mybot?.equity?.toFixed(2) || '—'}</div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <div className="text-xs text-gray-500 mb-1">Total P&L</div>
              <div className="text-xl font-bold font-mono">
                {mybot ? formatPnl(mybot.total_pnl) : '—'}
              </div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <div className="text-xs text-gray-500 mb-1">Daily P&L</div>
              <div className="text-xl font-bold font-mono">
                {mybot ? formatPnl(mybot.daily_pnl) : '—'}
              </div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <div className="text-xs text-gray-500 mb-1">Win Rate</div>
              <div className="text-xl font-bold font-mono">{mybot?.win_rate?.toFixed(1) || '—'}%</div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <div className="text-xs text-gray-500 mb-1">Trades</div>
              <div className="text-xl font-bold font-mono">{mybot?.total_trades || '—'}</div>
            </div>
          </div>

          {/* Market State */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">Market State</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">HMM Regime</span>
                  <span className="text-purple-400 font-mono">{mybot?.hmm_regime || '—'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">HMM Confidence</span>
                  <span className="text-gray-300 font-mono">{mybot ? (mybot.hmm_confidence * 100).toFixed(1) + '%' : '—'}</span>
                </div>
                {mybot?.trend_states && Object.entries(mybot.trend_states).map(([pair, trend]) => (
                  <div key={pair} className="flex justify-between text-sm">
                    <span className="text-gray-500">{pair.replace('_USDT', '')}</span>
                    <span className={`font-mono ${trend.includes('BEAR') ? 'text-red-400' : trend.includes('BULL') ? 'text-emerald-400' : 'text-gray-400'}`}>
                      {trend}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Open Positions */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">Open Positions</h3>
              {mybot?.positions && Object.keys(mybot.positions).length > 0 ? (
                <div className="space-y-2">
                  {Object.entries(mybot.positions).map(([pair, pos]: [string, any]) => (
                    <div key={pair} className="flex justify-between text-sm bg-gray-800/50 rounded-lg p-2">
                      <span className="text-gray-300">{pair}</span>
                      <span className={pos.side === 'short' ? 'text-red-400' : 'text-emerald-400'}>
                        {pos.side?.toUpperCase()} @ ${pos.entry_price?.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 text-sm py-4 text-center">No open positions</div>
              )}
            </div>
          </div>

          {/* Recent Trades */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">Recent Trades</h3>
            {mybot?.trade_history && mybot.trade_history.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-500 text-xs uppercase">
                      <th className="text-left py-2 px-2">Pair</th>
                      <th className="text-left py-2 px-2">Side</th>
                      <th className="text-right py-2 px-2">Entry</th>
                      <th className="text-right py-2 px-2">Exit</th>
                      <th className="text-right py-2 px-2">P&L</th>
                      <th className="text-right py-2 px-2">Exit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mybot.trade_history.slice(-8).reverse().map((trade, i) => (
                      <tr key={i} className="border-t border-gray-800">
                        <td className="py-2 px-2 font-mono">{trade.pair.replace('_USDT', '/USDT')}</td>
                        <td className={`py-2 px-2 ${trade.side === 'short' ? 'text-red-400' : 'text-emerald-400'}`}>
                          {trade.side?.toUpperCase()}
                        </td>
                        <td className="py-2 px-2 text-right font-mono text-gray-300">${trade.entry_price?.toFixed(2)}</td>
                        <td className="py-2 px-2 text-right font-mono text-gray-300">${trade.exit_price?.toFixed(2)}</td>
                        <td className="py-2 px-2 text-right font-mono">{formatPnl(trade.pnl)}</td>
                        <td className="py-2 px-2 text-right text-xs text-gray-500">{trade.exit_reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-gray-500 text-sm py-4 text-center">No trades yet</div>
            )}
          </div>
        </section>

        {/* ===== MARKET DATA ===== */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-emerald-400 mb-4">📈 Live Market Data</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PAIRS.map((pair) => {
              const ticker = tickers[pair];
              const change = parseFloat(ticker?.change_percentage || '0');
              const isUp = change >= 0;
              const name = pair.replace('_USDT', '');

              return (
                <div key={pair} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold">
                      <span className={name === 'BTC' ? 'text-orange-400' : name === 'ETH' ? 'text-blue-400' : 'text-purple-400'}>
                        {name === 'BTC' ? '₿' : name === 'ETH' ? 'Ξ' : '◎'}
                      </span>{' '}
                      {name}/USDT
                    </h3>
                    <span className={`text-sm font-mono px-2 py-0.5 rounded ${isUp ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                      {isUp ? '▲' : '▼'} {Math.abs(change).toFixed(2)}%
                    </span>
                  </div>
                  {ticker ? (
                    <>
                      <div className="text-2xl font-bold font-mono mb-2">
                        ${parseFloat(ticker.last).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
                        <div>
                          <span className="text-gray-500">24h High</span>
                          <div className="text-emerald-400/70 font-mono">${parseFloat(ticker.high_24h).toLocaleString()}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">24h Low</span>
                          <div className="text-red-400/70 font-mono">${parseFloat(ticker.low_24h).toLocaleString()}</div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-gray-500 animate-pulse">Loading...</div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Footer */}
        <div className="text-center text-xs text-gray-600 py-4">
          Signal Scorer v1.0 · Sonic Bot {mybot?.version || '—'} · Auto-refresh 10s
        </div>
      </main>
    </div>
  );
}
