(function () {
  const config = window.TUTORING_CAPITAL_SUPABASE;
  if (!config || !config.url || !config.anonKey) return;

  const pageKey = `tc-pageview:${window.location.pathname}${window.location.search}`;
  if (sessionStorage.getItem(pageKey)) return;

  const dnt = navigator.doNotTrack || window.doNotTrack || navigator.msDoNotTrack;
  if (dnt === '1' || dnt === 'yes') return;

  const clientIdKey = 'tc-client-id';
  let clientId = localStorage.getItem(clientIdKey);
  if (!clientId) {
    clientId = `tc-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(clientIdKey, clientId);
  }

  const referrerHost = (() => {
    try {
      return document.referrer ? new URL(document.referrer).hostname : null;
    } catch {
      return null;
    }
  })();

  const params = new URLSearchParams(window.location.search);
  const payload = {
    page_path: window.location.pathname || '/',
    page_title: document.title,
    page_url: window.location.href,
    referrer_host: referrerHost,
    client_id: clientId,
    utm_source: params.get('utm_source'),
    utm_medium: params.get('utm_medium'),
    utm_campaign: params.get('utm_campaign')
  };

  fetch(`${config.url}/rest/v1/site_pageviews`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: config.anonKey,
      Authorization: `Bearer ${config.anonKey}`,
      Prefer: 'return=minimal'
    },
    body: JSON.stringify(payload),
    keepalive: true
  }).then(() => {
    sessionStorage.setItem(pageKey, '1');
  }).catch(() => {
    // fail silently on analytics errors
  });
})();
