import { PRESET_IDS } from "@/lib/theme/presets";

/**
 * Picks the next preset for a visitor who has never chosen one, so the site
 * greets them differently each time.
 *
 * This has to run before next-themes reads localStorage, which is why it is a
 * blocking inline script placed ahead of the provider rather than an effect.
 * Doing it after mount would paint the previous preset first and then flip -
 * a visible flash, and a bad one when it crosses light and dark.
 *
 * Once someone picks a preset explicitly we set remix-chosen and never override
 * them again.
 *
 * A page the browser is only prerendering (the desktop asks for /resume when
 * the pointer settles on its link) is not a visit, so it waits until it is
 * shown. It cannot simply run: localStorage is shared with the page that is
 * still open, next-themes there listens for the write, and pointing at the
 * link switched the desktop to the next tube under the visitor.
 */
export function RotatePresetScript() {
  const js = `(function(){function r(){try{
var P=${JSON.stringify(PRESET_IDS)};
if(localStorage.getItem('remix-chosen'))return;
var v=parseInt(localStorage.getItem('remix-visit')||'0',10)||0;
localStorage.setItem('theme',P[v%P.length]);
localStorage.setItem('remix-visit',String((v+1)%P.length));
}catch(e){}}
if(document.prerendering)document.addEventListener('prerenderingchange',r,{once:true});else r();})();`;

  return <script dangerouslySetInnerHTML={{ __html: js }} />;
}
