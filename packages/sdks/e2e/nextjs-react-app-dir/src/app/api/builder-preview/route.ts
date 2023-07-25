import { NextResponse } from 'next/server';
import { fancy_store } from './db';

export async function POST(request: Request) {
  const body = await request.json();
  const newData = {
    [body.key]: body.value,
  };
  fancy_store.set(body.key, body.value);

  return NextResponse.json(newData);
}
