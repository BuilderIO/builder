'use server'
import { fancy_store } from "@/app/api/builder-preview/db";

export async function postContent({ key, value }) {
  console.log('Setting preview content', {key});
  
  fancy_store.set(key, value)

  console.log('Set preview content', fancy_store.get(key));
  
}
