import { useEffect, useState } from 'react';
import websiteSettingsApi from '../services/websiteSettingsApi';

let cache = null;
let inflight = null;

async function loadSettings() {
  if (cache) return cache;
  if (inflight) return inflight;
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
}
