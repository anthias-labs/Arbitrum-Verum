import { createClient } from "@vercel/kv";
import dotenv from "dotenv";
dotenv.config();

const kv = createClient({
    url: process.env.KV_REST_API_URL,
    token: process.env.KV_REST_API_TOKEN,
});

interface Cache<T> {
    value: T;
    last_update: number;
}

export const createCache =
    <T>(cacheName: string, TTL_secs: number, updater: () => Promise<T>) =>
    async (): Promise<T> => {
        const v: Cache<T> | null = await kv.get(cacheName);

        if (v !== null) {
            const now = Date.now();

            if (now - v.last_update < TTL_secs * 1000) {
                console.log({cacheName, value: v.value})
                return v.value;
            }
        }

        const updated = await updater();

        const cache: Cache<T> = {
            value: updated,
            last_update: Date.now(),
        };

        kv.set(cacheName, cache)

        console.log({cacheName, updated})
        return updated;
    };

