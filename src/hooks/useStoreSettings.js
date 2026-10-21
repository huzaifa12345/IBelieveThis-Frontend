import { useEffect, useState } from 'react';
import websiteSettingsApi from '../services/websiteSettingsApi';

let cache = null;
let cacheAt = 0;
let inflight = null;
const TTL_MS = 30 * 1000; // 30s — contact/email edits show quickly on storefront

async function loadSettings(force = false) {
  const now = Date.now();
  if (!force && cache && now - cacheAt < TTL_MS) return cache;
  if (!force && inflight) return inflight;

  inflight = (async () => {
    const response = await websiteSettingsApi.getWebsiteSettings();
    const grouped = response?.data || response || {};
    const flat = {};
    Object.values(grouped).forEach((list) => {
      if (Array.isArray(list)) {
        list.forEach((s) => {
          if (s?.key) flat[s.key] = s.value ?? '';
        });
      }
    });
    cache = flat;
    cacheAt = Date.now();
    return flat;
  })().finally(() => {
    inflight = null;
  });
  return inflight;
}

export function useStoreSettings() {
  const [settings, setSettings] = useState(cache || {});
  const [loading, setLoading] = useState(!cache);

  useEffect(() => {
    let alive = true;
    loadSettings()
      .then((data) => {
        if (alive) setSettings(data);
      })
      .catch(() => {})
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  return { settings, loading, get: (key, fallback = '') => settings[key] ?? fallback };
}

export function invalidateStoreSettingsCache() {
  cache = null;
  cacheAt = 0;
}
