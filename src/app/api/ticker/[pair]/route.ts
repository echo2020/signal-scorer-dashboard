import { NextResponse } from 'next/server';
import { getTicker } from '@/lib/gateio';

export async function GET(request: Request, { params }: { params: { pair: string } }) {
  try {
    const pair = decodeURIComponent(params.pair).replace('-', '_').toUpperCase();
    const data = await getTicker(pair);
    if (!data) return NextResponse.json({ error: `Pair ${pair} not found` }, { status: 404 });
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
