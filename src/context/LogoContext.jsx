import { createContext, useContext, useState, useEffect } from 'react';
import websiteSettingsApi from '../services/websiteSettingsApi';

const LogoContext = createContext();

const FALLBACK_LOGO = '/IBelieveThis.png';

export const useLogo = () => {
  const context = useContext(LogoContext);
  if (!context) {
    throw new Error('useLogo must be used within a LogoProvider');
  }
  return context;
};

export const LogoProvider = ({ children }) => {
  const [websiteLogo, setWebsiteLogo] = useState(FALLBACK_LOGO);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Defer logo API so it does not compete with hero LCP on Slow 4G
    const run = () => fetchWebsiteLogo();
    if (typeof requestIdleCallback === 'function') {
      const id = requestIdleCallback(run, { timeout: 2500 });
      return () => cancelIdleCallback(id);
    }
    const t = window.setTimeout(run, 1200);
    return () => window.clearTimeout(t);
  }, []);

  const fetchWebsiteLogo = async () => {
    try {
      setLoading(true);
      const response = await websiteSettingsApi.getWebsiteSettings();
      if (response.success && response.data) {
        const all = Object.values(response.data).flatMap((list) =>
          Array.isArray(list) ? list : []
        );
        const logoSetting = all.find((s) => s.key === 'website_logo');
        const value = logoSetting?.value;
        // Ignore grey "Logo" SVG placeholders
        if (value && !String(value).includes('>Logo</text>')) {
          setWebsiteLogo(value);
        } else {
          setWebsiteLogo(FALLBACK_LOGO);
        }
      }
    } catch (error) {
      console.error('LogoContext: Error fetching website logo:', error);
      setWebsiteLogo(FALLBACK_LOGO);
    } finally {
      setLoading(false);
    }
  };

  const updateLogo = (newLogo) => {
    setWebsiteLogo(newLogo || FALLBACK_LOGO);
  };

  return (
    <LogoContext.Provider value={{ websiteLogo, loading, updateLogo, fetchWebsiteLogo }}>
      {children}
    </LogoContext.Provider>
  );
};

export default LogoContext;
