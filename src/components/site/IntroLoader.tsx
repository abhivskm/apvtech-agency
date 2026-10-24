import { INTRO_LOADER, INTRO_VARIANTS, type IntroVariant } from "@/lib/intro";

const isDev = process.env.NODE_ENV !== "production";

/**
 * Full-screen intro loader. Server-rendered but hidden by default; a tiny inline script decides before
 * the page paints whether to play it (first load of the session, motion allowed). Without JavaScript it
 * never shows, and the page content underneath is always fully rendered for search engines.
 */
export function IntroLoader({ brandName }: { brandName: string }) {
  const variants: IntroVariant[] = isDev ? [1, 2, 3, 4] : INTRO_LOADER ? [INTRO_LOADER] : [];
  if (!variants.length) return null;

  const durations = Object.fromEntries(variants.map((v) => [v, INTRO_VARIANTS[v].ms]));
  const script = `(function(){try{var d=document.documentElement,ms=${JSON.stringify(durations)},q=${isDev ? "new URLSearchParams(location.search).get('loader')" : "null"},chosen=${INTRO_LOADER ?? "null"},v=null;
if(q&&ms[q])v=q;else if(chosen&&!matchMedia('(prefers-reduced-motion: reduce)').matches&&!sessionStorage.getItem('intro-seen'))v=String(chosen);
if(!v)return;if(!q)sessionStorage.setItem('intro-seen','1');
d.setAttribute('data-intro',v);d.style.setProperty('--intro-ms',ms[v]+'ms');
setTimeout(function(){d.setAttribute('data-intro-done','')},ms[v]+60);
setTimeout(function(){d.removeAttribute('data-intro');d.removeAttribute('data-intro-done');d.style.removeProperty('--intro-ms')},ms[v]+2600);
}catch(e){}})();`;

  const mark = (
    <span className="intro-mark">
      <span className="intro-dot">
        <i />
        <i />
      </span>
      <span>{brandName}</span>
    </span>
  );

  return (
    <>
      {variants.includes(1) && (
        <div className="intro intro-v1" aria-hidden="true">
          {mark}
        </div>
      )}
      {variants.includes(2) && (
        <div className="intro intro-v2" aria-hidden="true">
          <span className="intro-words">
            {brandName.split(/\s+/).map((w, i) => (
              <span key={i} className="intro-word">
                <span style={{ ["--w" as string]: i }}>{w}</span>
              </span>
            ))}
          </span>
          <span className="intro-bar" />
        </div>
      )}
      {variants.includes(3) && (
        <div className="intro intro-v3" aria-hidden="true">
          <span className="intro-v3-brand">{mark}</span>
          <span className="intro-count" />
          <span className="intro-progress">
            <i />
          </span>
        </div>
      )}
      {variants.includes(4) && (
        <div className="intro intro-v4" aria-hidden="true">
          <span className="intro-p intro-p1" />
          <span className="intro-p intro-p2" />
          <span className="intro-p intro-p3">{mark}</span>
        </div>
      )}
      <script dangerouslySetInnerHTML={{ __html: script }} />
    </>
  );
}
