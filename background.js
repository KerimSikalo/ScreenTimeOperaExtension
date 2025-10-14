// background.js - service worker
// Keeps aggregated seconds per-day and per-hostname

const DEFAULT_SETTINGS = {
    idleThresholdSeconds: 60 // if idle for >= this, consider user inactive
  };
  
  // storage schema:
  // { daily: { "YYYY-MM-DD": { total: seconds, bySite: { hostname: seconds } } }, settings: {...} }
  
  async function getTodayKey() {
    const d = new Date();
    return d.toISOString().slice(0,10); // YYYY-MM-DD
  }
  
  async function getStorage() {
    return new Promise(resolve => chrome.storage.local.get(['daily','settings'], r => {
      const daily = r.daily || {};
      const settings = Object.assign({}, DEFAULT_SETTINGS, r.settings || {});
      resolve({ daily, settings });
    }));
  }
  
  async function saveStorage(obj) {
    return new Promise(resolve => chrome.storage.local.set(obj, () => resolve()));
  }
  
  async function addSeconds(hostname, seconds) {
    const key = await getTodayKey();
    const st = await getStorage();
    if (!st.daily[key]) st.daily[key] = { total: 0, bySite: {} };
    st.daily[key].total += seconds;
    st.daily[key].bySite[hostname] = (st.daily[key].bySite[hostname] || 0) + seconds;
    await saveStorage({ daily: st.daily });
  }
  
  // Called by content scripts: they send pings with `{type: 'ping', hostname}` once per second while active
  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg && msg.type === 'ping' && msg.hostname) {
      // increment 1 second per ping to daily counters
      // To avoid spam or missing pings, can check timestamp; for simplicity assume 1 second per ping
      addSeconds(msg.hostname, 1).catch(console.error);
      // respond quickly
      sendResponse({ ok: true });
      // keep port open? no need
      return true;
    }
  });
  
  // option: handle manual "reset day" and other commands
  chrome.runtime.onInstalled.addListener(() => {
    // initialize storage if absent
    chrome.storage.local.get(['settings'], res => {
      if (!res.settings) chrome.storage.local.set({ settings: DEFAULT_SETTINGS });
    });
  });
  
  // optional cleanup alarm to prune old days (keep 60 days)
  chrome.alarms.create('prune', { periodInMinutes: 60*24 }); // every 24 hours
  chrome.alarms.onAlarm.addListener(async alarm => {
    if (alarm.name === 'prune') {
      const keepDays = 60;
      const st = await getStorage();
      const keys = Object.keys(st.daily).sort().reverse();
      const toRemove = keys.slice(keepDays);
      if (toRemove.length) {
        for (const k of toRemove) delete st.daily[k];
        await saveStorage({ daily: st.daily });
      }
    }
  });
  