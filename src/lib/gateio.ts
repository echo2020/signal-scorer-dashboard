/**
 * Gate.io REST API Client for Node.js
 * Supports public endpoints (no auth) and authenticated endpoints (HMAC-SHA512)
 */

import crypto from 'crypto';

const BASE_URL = 'https://api.gateio.ws/api/v4';

function signRequest(method: string, path: string, queryString: string, body: string, apiKey: string, apiSecret: string) {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const bodyHash = crypto.createHash('sha512').update(body).digest('hex');
  const signString = `${method.toUpperCase()}\n${path}\n${queryString}\n${bodyHash}\n${timestamp}`;
  const signature = crypto.createHmac('sha512', apiSecret).update(signString).digest('hex');
  return {
    'KEY': apiKey,
    'SIGN': signature,
    'Timestamp': timestamp,
    'Content-Type': 'application/json',
  };
}

async function request(method: string, endpoint: string, params?: Record<string, string>, body?: object, auth = false) {
  let url = `${BASE_URL}${endpoint}`;
  const queryString = params ? new URLSearchParams(params).toString() : '';
  if (queryString) url += `?${queryString}`;

  const bodyStr = body ? JSON.stringify(body) : '';
  const headers: Record<string, string> = {};

  if (auth) {
    const apiKey = process.env.GATEIO_API_KEY || '';
    const apiSecret = process.env.GATEIO_API_SECRET || '';
    if (!apiKey || !apiSecret) throw new Error('API credentials not configured');
    Object.assign(headers, signRequest(method, endpoint, queryString, bodyStr, apiKey, apiSecret));
  }

  const res = await fetch(url, {
    method,
    headers,
    body: bodyStr || undefined,
    next: { revalidate: 5 }, // Cache for 5 seconds
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Gate.io API error ${res.status}: ${text}`);
  }

  return res.json();
}

// Public endpoints
export async function getTicker(pair: string) {
  const data = await request('GET', '/spot/tickers', { currency_pair: pair }, undefined, false);
  return data[0] || null;
}

export async function getAllTickers(pairs?: string[]) {
  if (pairs) {
    return Promise.all(pairs.map(p => getTicker(p)));
  }
  return request('GET', '/spot/tickers', undefined, undefined, false);
}

export async function getOHLCV(pair: string, interval = '1h', limit = 100) {
  return request('GET', '/spot/candlesticks', { currency_pair: pair, interval, limit: limit.toString() }, undefined, false);
}

export async function getOrderBook(pair: string, limit = 10) {
  return request('GET', '/spot/order_book', { currency_pair: pair, limit: limit.toString() }, undefined, false);
}

// Authenticated endpoints
export async function getBalances() {
  return request('GET', '/spot/accounts', undefined, undefined, true);
}

export async function getBalance(currency: string) {
  const all = await getBalances();
  const found = all.find((a: any) => a.currency.toUpperCase() === currency.toUpperCase());
  if (!found) return null;
  return {
    currency: found.currency,
    available: parseFloat(found.available),
    locked: parseFloat(found.locked),
    total: parseFloat(found.total),
  };
}
