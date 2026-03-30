import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    service: 'signal-scorer-dashboard',
    status: 'running',
    mode: 'dry-run',
    authenticated: !!(process.env.GATEIO_API_KEY && process.env.GATEIO_API_SECRET),
    timestamp: new Date().toISOString(),
  });
}
