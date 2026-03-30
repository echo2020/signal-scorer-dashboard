import { NextResponse } from 'next/server';
import { getOHLCV } from '@/lib/gateio';

export async function GET(request: Request, { params }: { params: { pair: string } }) {
  try {
    const pair = decodeURIComponent(params.pair).replace('-', '_').toUpperCase();
    const url = new URL(request.url);
    const interval = url.searchParams.get('interval') || '1h';
    const limit = parseInt(url.searchParams.get('limit') || '100');
    const data = await getOHLCV(pair, interval, limit);
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
