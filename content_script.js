(function() {
  let pingInterval = null;
  let lastActivity = Date.now();
  const ACTIVITY_EVENTS = ['mousemove', 'keydown', 'mousedown', 'touchstart', 'scroll'];
  const hostname = location.hostname || location.href;
  let idleThreshold = 60;

  function safeSendMessage(msg) {
    if (!chrome.runtime || !chrome.runtime.id) return; // <--- provjera
    try {
      chrome.runtime.sendMessage(msg, () => {
        if (chrome.runtime.lastError) {
          const m = chrome.runtime.lastError.message || "";
          if (!m.includes("Extension context invalidated")) {
            console.warn("Message error:", m);
          }
        }
      });
    } catch (e) {
      if (!String(e).includes("Extension context invalidated")) {
        console.error("sendMessage failed:", e);
      }
    }
  }

  chrome.storage.local.get(['settings'], res => {
    if (res.settings && res.settings.idleThresholdSeconds)
      idleThreshold = res.settings.idleThresholdSeconds;
  });

  function startPinging() {
    if (pingInterval) return;
    safeSendMessage({ type: 'ping', hostname });
    pingInterval = setInterval(() => {
      safeSendMessage({ type: 'ping', hostname });
    }, 1000);

    // Ako ekstenzija nestane - automatski prekini pinganje
    setInterval(() => {
      if (!chrome.runtime || !chrome.runtime.id) stopPinging();
    }, 3000);
  }

  function stopPinging() {
    if (!pingInterval) return;
    clearInterval(pingInterval);
    pingInterval = null;
  }

  function userBecameActive() {
    lastActivity = Date.now();
    if (document.visibilityState === 'visible' && document.hasFocus()) startPinging();
  }

  function maybeStopIfIdle() {
    const idleSeconds = (Date.now() - lastActivity) / 1000;
    if (idleSeconds >= idleThreshold) stopPinging();
  }

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && document.hasFocus()) {
      if ((Date.now() - lastActivity) / 1000 < idleThreshold) startPinging();
    } else stopPinging();
  });

  window.addEventListener('focus', () => {
    if ((Date.now() - lastActivity) / 1000 < idleThreshold) startPinging();
  });

  window.addEventListener('blur', () => stopPinging());

  ACTIVITY_EVENTS.forEach(evt => {
    window.addEventListener(evt, userBecameActive, { passive: true });
  });

  setInterval(maybeStopIfIdle, 2000);
  if (document.visibilityState === 'visible' && document.hasFocus()) userBecameActive();
})();
