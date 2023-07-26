'use server'
import { NextResponse } from "next/server";
import { fancy_store } from "./db";
import { BuilderContent } from "@builder.io/sdks-e2e-tests/dist/src/specs/types";

async function postContent({ key, value }: { key: string; value: BuilderContent }) {
  console.log('Setting preview content', {key});
  
  fancy_store.set(key, value)

  console.log('Set preview content', fancy_store.get(key));
  
  return { [key]: value}
}


export async function postPreviewContent(request: Request) {
  const body = await request.json();
  const newData = await postContent({ key: body.key, value: body.value })

  return NextResponse.json(newData);
}
