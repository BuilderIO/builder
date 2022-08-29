import type { NextRequest } from 'next/server';
export declare function getPersonlizedURL(request: NextRequest): import("next/dist/server/web/next-url").NextURL;
export declare function getUserAttributesFromHash(hash: string): Record<string, string>;
