// popup.js
function fmtSeconds(s){
    s = Math.round(s || 0);
    const h = Math.floor(s/3600);
    const m = Math.floor((s%3600)/60);
    const sec = s%60;
    if (h) return `${h}h ${m}m`;
    if (m) return `${m}m ${sec}s`;
    return `${sec}s`;
  }
  
  async function loadData(){
    const key = new Date().toISOString().slice(0,10);
    chrome.storage.local.get(['daily'], res => {
      const daily = res.daily || {};
      const today = daily[key] || { total: 0, bySite: {} };
      document.getElementById('total').textContent = fmtSeconds(today.total);
      const sitesEl = document.getElementById('sites');
      sitesEl.innerHTML = '';
      const entries = Object.entries(today.bySite || {}).sort((a,b)=>b[1]-a[1]);
      if (entries.length === 0) {
        sitesEl.innerHTML = '<li><em>No data yet</em></li>';
      } else {
        for (const [host, secs] of entries.slice(0,20)) {
          const li = document.createElement('li');
          li.textContent = `${host} — ${fmtSeconds(secs)}`;
          sitesEl.appendChild(li);
        }
      }
    });
  }
  
  document.getElementById('resetBtn').addEventListener('click', ()=>{
    const key = new Date().toISOString().slice(0,10);
    chrome.storage.local.get(['daily'], res => {
      const daily = res.daily || {};
      daily[key] = { total: 0, bySite: {} };
      chrome.storage.local.set({ daily }, loadData);
    });
  });
  
  loadData();
  