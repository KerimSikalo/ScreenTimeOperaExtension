const idleInput = document.getElementById('idle');
const statusDiv = document.getElementById('status');

document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.local.get(['settings'], res => {
    const settings = res.settings || { idleThresholdSeconds: 60 };
    idleInput.value = settings.idleThresholdSeconds;
  });
});

function showStatus(message, type = 'success') {
  statusDiv.textContent = message;
  statusDiv.className = `status ${type} show`;
  
  setTimeout(() => {
    statusDiv.classList.remove('show');
  }, 3000);
}

document.getElementById('save').addEventListener('click', () => {
  const val = Math.max(5, parseInt(idleInput.value || 60, 10));
  chrome.storage.local.set({ settings: { idleThresholdSeconds: val } }, () => {
    showStatus('✓ Settings saved successfully!', 'success');
  });
});