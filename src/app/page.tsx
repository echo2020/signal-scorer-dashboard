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

interface ServiceStatus {
  service: string;
  status: string;
  mode: string;
  authenticated: boolean;
}

const PAIRS = ['BTC_USDT', 'ETH_USDT', 'SOL_USDT'];

export default function Dashboard() {
  const [tickers, setTickers] = useState<Record<string, Ticker>>({});
  const [status, setStatus] = useState<ServiceStatus | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [error, setError] = useState<string>('');

  const fetchData = async () => {
    try {
      // Fetch status
      const statusRes = await fetch('/api/health');
      const statusData = await statusRes.json();
      setStatus(statusData);

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
      setLastUpdate(new Date());
      setError('');
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              <span className="text-emerald-400">📊</span> Signal Scorer
            </h1>
            <p className="text-sm text-gray-400">Gate.io Market Data Dashboard</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${status?.status === 'running' ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
              <span className="text-sm text-gray-300">
                {status?.status === 'running' ? 'Live' : 'Offline'}
              </span>
            </div>
            <span className={`text-xs px-2 py-1 rounded ${status?.mode === 'dry-run' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
              {status?.mode === 'dry-run' ? '🔒 Dry Run' : '⚡ Live'}
            </span>
            <span className="text-xs text-gray-500">
              Updated: {lastUpdate.toLocaleTimeString()}
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

        {/* Ticker Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {PAIRS.map((pair) => {
            const ticker = tickers[pair];
            const change = parseFloat(ticker?.change_percentage || '0');
            const isUp = change >= 0;
            const name = pair.replace('_USDT', '');

            return (
              <div key={pair} className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold">
                    <span className={name === 'BTC' ? 'text-orange-400' : name === 'ETH' ? 'text-blue-400' : 'text-purple-400'}>
                      {name === 'BTC' ? '₿' : name === 'ETH' ? 'Ξ' : '◎'}
                    </span>{' '}
                    {name}/USDT
                  </h2>
                  <span className={`text-sm font-mono px-2 py-0.5 rounded ${isUp ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                    {isUp ? '▲' : '▼'} {Math.abs(change).toFixed(2)}%
                  </span>
                </div>
                {ticker ? (
                  <>
                    <div className="text-3xl font-bold font-mono mb-2">
                      ${parseFloat(ticker.last).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                      <div>
                        <span className="text-gray-500">Volume ({name})</span>
                        <div className="text-gray-300 font-mono">{parseFloat(ticker.base_volume).toFixed(2)}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Volume (USDT)</span>
                        <div className="text-gray-300 font-mono">${parseFloat(ticker.quote_volume).toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
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

        {/* Info Panels */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Service Info */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">Service Info</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Service</span>
                <span className="text-gray-300 font-mono">{status?.service || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <span className={status?.status === 'running' ? 'text-emerald-400' : 'text-red-400'}>
                  {status?.status || '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Mode</span>
                <span className={status?.mode === 'dry-run' ? 'text-yellow-400' : 'text-emerald-400'}>
                  {status?.mode || '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">API Auth</span>
                <span className={status?.authenticated ? 'text-emerald-400' : 'text-gray-500'}>
                  {status?.authenticated ? '✅ Connected' : '⚠️ Not configured'}
                </span>
              </div>
            </div>
          </div>

          {/* Available Endpoints */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">API Endpoints</h3>
            <div className="space-y-1 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-gray-800">
                <span className="text-gray-400">GET</span>
                <span className="text-emerald-400/80">/api/ticker/BTC_USDT</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-800">
                <span className="text-gray-400">GET</span>
                <span className="text-emerald-400/80">/api/ohlcv/BTC_USDT?interval=1h</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-800">
                <span className="text-gray-400">GET</span>
                <span className="text-emerald-400/80">/api/balance?currency=USDT</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-800">
                <span className="text-yellow-400">POST</span>
                <span className="text-yellow-400/80">/api/orders 🔒 (dry-run)</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-400">GET</span>
                <span className="text-emerald-400/80">/api/health</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-gray-600">
          Signal Scorer v1.0 · Gate.io REST API · Refreshes every 10s
        </div>
      </main>
    </div>
  );
}
