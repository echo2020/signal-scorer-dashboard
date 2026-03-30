import { NextResponse } from 'next/server';
import { getBalances, getBalance } from '@/lib/gateio';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const currency = url.searchParams.get('currency');
    if (currency) {
      const data = await getBalance(currency.toUpperCase());
      if (!data) return NextResponse.json({ error: `Currency ${currency} not found` }, { status: 404 });
      return NextResponse.json(data);
    }
    const data = await getBalances();
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
