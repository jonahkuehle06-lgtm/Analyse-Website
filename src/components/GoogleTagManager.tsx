import Script from "next/script";

/**
 * Google Tag Manager.
 *
 * Wird nur eingebunden, wenn NEXT_PUBLIC_GTM_ID gesetzt ist. Ohne die Variable
 * laedt die Seite kein einziges Google-Skript.
 *
 * WICHTIG - Einwilligung:
 * Vorgeschaltet ist der Google Consent Mode v2 mit der Voreinstellung "denied"
 * fuer alle einwilligungspflichtigen Zwecke. GTM selbst laedt damit zwar, setzt
 * aber keine Analyse- oder Werbe-Cookies, solange keine Einwilligung vorliegt.
 * Das entspricht § 25 Abs. 1 TDDDG: Speicherung und Auslesen von Informationen
 * im Endgeraet beduerfen - ausserhalb technisch notwendiger Faelle - einer
 * vorherigen Einwilligung.
 *
 * Solange es kein Einwilligungsfenster auf der Seite gibt, wird die
 * Einwilligung nie erteilt. GTM laeuft dann wirkungslos mit. Das ist Absicht:
 * lieber keine Messung als eine rechtswidrige.
 *
 * Um die Einwilligung spaeter zu erteilen bzw. zu widerrufen, ruft ein
 * Einwilligungsfenster auf:
 *   window.paxConsent.update({ analytics: true, ads: false })
 */

/** GTM-Container-IDs haben die Form GTM-XXXXXXX. */
const GTM_ID_PATTERN = /^GTM-[A-Z0-9]{4,12}$/;

export function gtmId(): string | null {
  const raw = (process.env.NEXT_PUBLIC_GTM_ID || "").trim();
  return GTM_ID_PATTERN.test(raw) ? raw : null;
}

/** Kommt in den <head> und muss vor GTM laufen. */
export function GoogleTagManagerConsent() {
  if (!gtmId()) return null;

  return (
    <Script id="consent-default" strategy="beforeInteractive">
      {`
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;

// Voreinstellung: alles abgelehnt, bis eine Einwilligung vorliegt.
gtag('consent', 'default', {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'denied',
  functionality_storage: 'granted',
  security_storage: 'granted',
  wait_for_update: 500
});

// Schnittstelle fuer ein spaeteres Einwilligungsfenster.
window.paxConsent = {
  update: function (choice) {
    var analytics = choice && choice.analytics ? 'granted' : 'denied';
    var ads = choice && choice.ads ? 'granted' : 'denied';
    gtag('consent', 'update', {
      analytics_storage: analytics,
      ad_storage: ads,
      ad_user_data: ads,
      ad_personalization: ads
    });
    try {
      localStorage.setItem('pax_consent', JSON.stringify({
        analytics: analytics === 'granted',
        ads: ads === 'granted',
        at: new Date().toISOString()
      }));
    } catch (e) {}
  },
  read: function () {
    try { return JSON.parse(localStorage.getItem('pax_consent') || 'null'); }
    catch (e) { return null; }
  },
  revoke: function () {
    try { localStorage.removeItem('pax_consent'); } catch (e) {}
    gtag('consent', 'update', {
      analytics_storage: 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied'
    });
  }
};

// Eine frueher erteilte Einwilligung wieder anwenden.
(function () {
  var stored = window.paxConsent.read();
  if (stored) window.paxConsent.update(stored);
})();
      `}
    </Script>
  );
}

/** Laedt den GTM-Container. */
export function GoogleTagManagerScript() {
  const id = gtmId();
  if (!id) return null;

  return (
    <Script id="gtm-loader" strategy="afterInteractive">
      {`
(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});
var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';
j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${id}');
      `}
    </Script>
  );
}

/** Rueckfallebene fuer Browser ohne JavaScript; gehoert direkt hinter <body>. */
export function GoogleTagManagerNoScript() {
  const id = gtmId();
  if (!id) return null;

  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${id}`}
        height="0"
        width="0"
        style={{ display: "none", visibility: "hidden" }}
        title="Google Tag Manager"
      />
    </noscript>
  );
}
