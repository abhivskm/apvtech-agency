/** Public-site colour theme (light / dark). Dark is the brand default; a visitor's choice is remembered. */
export const THEME_STORAGE_KEY = "theme";

/** Browser UI colour (mobile address bar) per theme. */
export const THEME_COLORS = { dark: "#0A0A0A", light: "#F7F7F2" } as const;

/** Runs in <head> before first paint so the saved theme applies without a flash. */
export const themeBootstrap = `(function(){try{var t=localStorage.getItem('${THEME_STORAGE_KEY}');if(t!=='light'&&t!=='dark')t='dark';document.documentElement.setAttribute('data-theme',t);var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute('content',t==='light'?'${THEME_COLORS.light}':'${THEME_COLORS.dark}')}catch(e){document.documentElement.setAttribute('data-theme','dark')}})();`;
