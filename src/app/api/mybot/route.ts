import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const statePath = process.env.MYBOT_STATE_PATH || '/data/mybot/scalper_v3_state.json';
    if (!fs.existsSync(statePath)) {
      return NextResponse.json({ error: 'Mybot state file not found', path: statePath }, { status: 404 });
    }
    const raw = fs.readFileSync(statePath, 'utf-8');
    const state = JSON.parse(raw);
    return NextResponse.json(state);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
