/**
 * TextToSpeechH AI — Production Frontend Controller
 * Domain: https://texttospeechh.com
 * Official Instagram: @webxpert.ai
 */

// Global function alias for inline onclick fallbacks
window.startSynthesis = null;
window.generateVoice = null;

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements selection supporting both id naming conventions
  const textInput = document.getElementById('text-input');
  const voiceSelect = document.getElementById('voice-select');
  const speedRange = document.getElementById('speed-range');
  const speedVal = document.getElementById('speed-val');
  const pitchRange = document.getElementById('pitch-range');
  const pitchVal = document.getElementById('pitch-val');
  const emotionSelect = document.getElementById('emotion-select');

  const generateBtn = document.getElementById('generate-btn') || document.getElementById('btn-generate');
  const pauseBtn = document.getElementById('pause-btn') || document.getElementById('btn-pause');
  const stopBtn = document.getElementById('stop-btn') || document.getElementById('btn-stop');
  const downloadBtn = document.getElementById('download-btn') || document.getElementById('btn-download');

  const audioPlayer = document.getElementById('audio-player');
  const soundwave = document.getElementById('soundwave');
  const fileDropzone = document.getElementById('file-dropzone');
  const fileInput = document.getElementById('file-input');

  const wordCountSpan = document.getElementById('word-count') || document.getElementById('char-counter');
  const charCountSpan = document.getElementById('char-count');
  const estTimeSpan = document.getElementById('est-time');

  const progressSection = document.getElementById('progress-section');
  const progressStatusText = document.getElementById('progress-status-text');
  const progressEta = document.getElementById('progress-eta');
  const progressPercentage = document.getElementById('progress-percentage');
  const progressBarFill = document.getElementById('progress-bar-fill');

  let activeJobId = null;
  let activeJobPollTimer = null;
  let pollCounter = 0;
  let currentAudioBlob = null;
  let currentAudioUrl = null;
  let animationTimer = null;

  // Modern Glassmorphic Toast Notification Container
  let toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.style.cssText = 'position:fixed; bottom:24px; right:24px; z-index:9999; display:flex; flex-direction:column; gap:10px; max-width:420px; width:calc(100% - 48px); pointer-events:none;';
    document.body.appendChild(toastContainer);
  }

  function showErrorToast(msg, allowRetry = true) {
    const toast = document.createElement('div');
    toast.style.cssText = 'pointer-events:auto; background:rgba(15, 23, 42, 0.95); border:1px solid #ef4444; color:#ffffff; padding:16px 20px; border-radius:12px; font-size:0.95rem; box-shadow:0 10px 30px rgba(0,0,0,0.5); backdrop-filter:blur(10px); display:flex; align-items:center; justify-content:space-between; gap:12px; animation: slideUp 0.3s ease;';
    
    const content = document.createElement('div');
    content.style.cssText = 'display:flex; align-items:center; gap:10px;';
    content.innerHTML = `<span style="font-size:1.4rem;">⚠️</span> <span>${msg}</span>`;
    
    const actions = document.createElement('div');
    actions.style.cssText = 'display:flex; align-items:center; gap:8px;';
    
    if (allowRetry) {
      const retryBtn = document.createElement('button');
      retryBtn.textContent = 'Retry';
      retryBtn.style.cssText = 'background:#ef4444; color:#fff; border:none; padding:6px 12px; border-radius:6px; font-weight:600; cursor:pointer; font-size:0.85rem;';
      retryBtn.onclick = () => {
        toast.remove();
        startSynthesis();
      };
      actions.appendChild(retryBtn);
    }

    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✖';
    closeBtn.style.cssText = 'background:none; border:none; color:#94a3b8; font-size:1.1rem; cursor:pointer; padding:2px 6px;';
    closeBtn.onclick = () => toast.remove();
    actions.appendChild(closeBtn);

    toast.appendChild(content);
    toast.appendChild(actions);
    toastContainer.appendChild(toast);

    setTimeout(() => {
      if (toast.parentNode) toast.remove();
    }, 8000);
  }

  // Network Offline / Online Monitoring
  window.addEventListener('offline', () => {
    showErrorToast('Network connection lost. You are currently offline.', true);
  });

  window.addEventListener('online', () => {
    const onlineToast = document.createElement('div');
    onlineToast.style.cssText = 'pointer-events:auto; background:rgba(15, 23, 42, 0.95); border:1px solid #10b981; color:#34d399; padding:14px 18px; border-radius:12px; font-size:0.95rem; box-shadow:0 10px 30px rgba(0,0,0,0.5); backdrop-filter:blur(10px); display:flex; align-items:center; gap:10px;';
    onlineToast.innerHTML = `<span>✓</span> <span>Network connection restored. Online!</span>`;
    toastContainer.appendChild(onlineToast);
    setTimeout(() => onlineToast.remove(), 4000);
  });

  // Real-Time Character & Word Counter
  function updateTextStats() {
    const text = textInput ? textInput.value || '' : '';
    const charCount = text.length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const estSeconds = Math.ceil(words / 2.5);

    if (wordCountSpan) {
      wordCountSpan.textContent = `${words} words | ${charCount} chars`;
    }
    if (charCountSpan) {
      charCountSpan.textContent = `${charCount} chars`;
    }

    if (estTimeSpan) {
      if (estSeconds < 60) {
        estTimeSpan.textContent = `~${estSeconds} sec audio`;
      } else {
        const mins = Math.floor(estSeconds / 60);
        const secs = estSeconds % 60;
        estTimeSpan.textContent = `~${mins}m ${secs}s audio`;
      }
    }
  }

  if (textInput) {
    textInput.addEventListener('input', updateTextStats);
    updateTextStats();
  }

  // Range Slider Feedback Updates
  if (speedRange) {
    speedRange.addEventListener('input', (e) => {
      if (speedVal) speedVal.textContent = `${parseFloat(e.target.value).toFixed(1)}x`;
    });
  }

  if (pitchRange) {
    pitchRange.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      const percent = Math.round((val - 1.0) * 100);
      if (pitchVal) pitchVal.textContent = percent >= 0 ? `+${percent}%` : `${percent}%`;
    });
  }

  function getFormattedRate(speedMultiplier) {
    const mult = parseFloat(speedMultiplier);
    const percent = Math.round((mult - 1.0) * 100);
    return percent >= 0 ? `+${percent}%` : `${percent}%`;
  }

  function getFormattedPitch(pitchMultiplier) {
    const mult = parseFloat(pitchMultiplier);
    const percent = Math.round((mult - 1.0) * 100);
    return percent >= 0 ? `+${percent}%` : `${percent}%`;
  }

  function dataURItoBlob(dataURI) {
    try {
      const parts = dataURI.split(',');
      const byteString = atob(parts[1]);
      const mimeString = parts[0].split(':')[1].split(';')[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      return new Blob([ab], { type: mimeString });
    } catch (e) {
      console.error('DataURI conversion error:', e);
      return null;
    }
  }

  // Progress Bar UI Controller
  function updateProgressUI(processed, total, percentage, etaSeconds, statusMsg = '') {
    if (progressSection) progressSection.classList.remove('hidden');
    
    if (progressStatusText) {
      progressStatusText.textContent = statusMsg || `Processing Chunk ${processed || 0}/${total || 1} (${percentage}%)...`;
    }
    if (progressEta) {
      progressEta.textContent = etaSeconds > 0 ? `ETA: ~${etaSeconds}s remaining` : 'Finalizing merged audio...';
    }
    if (progressPercentage) {
      progressPercentage.textContent = `${percentage}%`;
    }
    if (progressBarFill) {
      progressBarFill.style.width = `${percentage}%`;
    }
  }

  function showProgressBar() {
    if (progressSection) progressSection.classList.remove('hidden');
    updateProgressUI(0, 1, 0, 3, 'Initializing AI Neural Model...');
  }

  function hideProgressBar() {
    if (progressSection) {
      progressSection.classList.add('hidden');
    }
  }

  function animateProgressStep(targetPercent, statusText, etaSec, durationMs = 400) {
    return new Promise((resolve) => {
      let currentPercent = parseInt(progressPercentage ? progressPercentage.textContent : '0') || 0;
      const stepTime = 20;
      const totalSteps = Math.max(1, Math.floor(durationMs / stepTime));
      const stepIncrement = (targetPercent - currentPercent) / totalSteps;
      let stepCount = 0;

      if (animationTimer) clearInterval(animationTimer);

      animationTimer = setInterval(() => {
        stepCount++;
        currentPercent = Math.min(100, Math.round(currentPercent + stepIncrement));
        updateProgressUI(1, 1, currentPercent, etaSec, statusText);

        if (stepCount >= totalSteps || currentPercent >= targetPercent) {
          clearInterval(animationTimer);
          animationTimer = null;
          resolve();
        }
      }, stepTime);
    });
  }

  // Document File Upload Handler (.txt, .docx, .pdf)
  async function handleFileUpload(file) {
    if (!file) return;
    const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
    if (!['.txt', '.docx', '.pdf'].includes(ext)) {
      showErrorToast('Unsupported file format. Please upload a .txt, .docx, or .pdf document.', false);
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showErrorToast('File size exceeds maximum limit of 10MB.', false);
      return;
    }

    setButtonLoadingState(true, 'Extracting Document Text...');

    try {
      let payload = { filename: file.name };
      if (ext === '.txt') {
        payload.text = await file.text();
      } else {
        const arrayBuffer = await file.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        payload.fileData = btoa(binary);
      }

      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (response.ok && data.success) {
        if (textInput) textInput.value = data.text;
        updateTextStats();
      } else {
        throw new Error(data.error || 'Document extraction failed.');
      }
    } catch (err) {
      showErrorToast(`File Import Error: ${err.message}`, false);
    } finally {
      setButtonLoadingState(false);
    }
  }

  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        handleFileUpload(e.target.files[0]);
      }
    });
  }

  if (fileDropzone) {
    fileDropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      fileDropzone.classList.add('drag-over');
    });

    fileDropzone.addEventListener('dragleave', () => {
      fileDropzone.classList.remove('drag-over');
    });

    fileDropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      fileDropzone.classList.remove('drag-over');
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFileUpload(e.dataTransfer.files[0]);
      }
    });
  }

  // Generate Button Click Handler
  async function startSynthesis() {
    console.log('[TextToSpeechH AI] startSynthesis executed');
    const text = textInput ? textInput.value.trim() : '';
    if (!text) {
      showErrorToast('Please enter some script text or upload a document first.', false);
      return;
    }

    if (!navigator.onLine) {
      showErrorToast('No internet connection. Please check your network.', true);
      return;
    }

    let activePayload = null;

    // 1. Show Progress Panel Immediately, Auto Scroll & Disable Controls
    showProgressBar();
    if (progressSection) {
      progressSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    setButtonLoadingState(true, 'TextToSpeechH AI Synthesizing...');
    if (downloadBtn) downloadBtn.disabled = true;
    if (pauseBtn) pauseBtn.disabled = true;
    if (stopBtn) stopBtn.disabled = true;
    if (audioPlayer) audioPlayer.pause();
    if (soundwave) soundwave.classList.remove('active');

    if (activeJobPollTimer) {
      clearInterval(activeJobPollTimer);
      activeJobPollTimer = null;
    }

    // Phase 1 Progress Animation (0% -> 25%)
    await animateProgressStep(25, 'Initializing TextToSpeechH AI Engine...', 3, 300);

    const payload = {
      text: text,
      voice: voiceSelect ? voiceSelect.value : 'hi-IN-SwaraNeural',
      rate: getFormattedRate(speedRange ? speedRange.value : 1.0),
      pitch: getFormattedPitch(pitchRange ? pitchRange.value : 1.0),
      style: emotionSelect ? emotionSelect.value : 'neutral'
    };
    activePayload = payload;

    try {
      // Phase 2 Progress Animation (25% -> 55%)
      animateProgressStep(55, 'Processing Script Chunk 1/1...', 2, 600);

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const contentType = response.headers.get('content-type') || '';

      if (contentType.includes('application/json')) {
        const data = await response.json();
        if (response.ok && data.jobId) {
          activeJobId = data.jobId;

          // If serverless instant audio is returned
          if (data.audioDataUri) {
            const blob = dataURItoBlob(data.audioDataUri);
            if (blob) {
              await animateProgressStep(85, 'Generating High-Bitrate Voice Audio...', 1, 300);
              await animateProgressStep(100, 'Finalizing merged audio...', 0, 300);
              
              playAudioBlob(blob, payload);
              setButtonLoadingState(false);
              setTimeout(hideProgressBar, 1800);
              return;
            }
          }

          pollJobProgress(data.jobId, payload);
        } else {
          throw new Error(data.error || 'Failed to generate voice synthesis.');
        }
      } else if (contentType.includes('audio/')) {
        const audioBlob = await response.blob();
        await animateProgressStep(100, 'Finalizing merged audio...', 0, 300);
        playAudioBlob(audioBlob, payload);
        setButtonLoadingState(false);
        setTimeout(hideProgressBar, 1800);
      } else {
        throw new Error('Unexpected server response.');
      }

    } catch (err) {
      console.error('Synthesis error:', err);
      showErrorToast(`Voice Generation Error: ${err.message}`, true);
      setButtonLoadingState(false);
      hideProgressBar();
    }
  }

  // Export globally for inline onclick or console invocation
  window.startSynthesis = startSynthesis;
  window.generateVoice = startSynthesis;

  if (generateBtn) {
    generateBtn.addEventListener('click', startSynthesis);
  }

  // Keyboard shortcut: Ctrl + Enter
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'Enter') {
      e.preventDefault();
      startSynthesis();
    }
  });

  // Poll Job Progress & Live ETA for Async Multi-Chunk Jobs
  function pollJobProgress(jobId, payloadMetadata = null) {
    pollCounter = 0;
    activeJobPollTimer = setInterval(async () => {
      pollCounter++;
      try {
        const res = await fetch(`/api/status?jobId=${jobId}`);
        if (!res.ok) throw new Error('Status poll failed');
        const status = await res.json();

        updateProgressUI(
          status.processedChunks,
          status.totalChunks,
          status.progress,
          status.etaSeconds,
          `Processing Chunk ${status.processedChunks || 1}/${status.totalChunks || 1} (${status.progress}%)...`
        );

        if (status.state === 'COMPLETED') {
          clearInterval(activeJobPollTimer);
          activeJobPollTimer = null;

          await animateProgressStep(100, 'Finalizing merged audio...', 0, 300);

          const audioRes = await fetch(`/api/status?jobId=${jobId}&download=true`);
          const audioBlob = await audioRes.blob();

          playAudioBlob(audioBlob, payloadMetadata);
          setButtonLoadingState(false);
          setTimeout(hideProgressBar, 1800);
        } else if (status.state === 'FAILED') {
          clearInterval(activeJobPollTimer);
          activeJobPollTimer = null;
          setButtonLoadingState(false);
          hideProgressBar();
          showErrorToast(`Synthesis Warning: ${status.error || 'Speech synthesis failed. Please retry.'}`, true);
        } else if (pollCounter > 15) {
          clearInterval(activeJobPollTimer);
          activeJobPollTimer = null;
          setButtonLoadingState(false);
          hideProgressBar();
          showErrorToast('Synthesis timeout. Please retry with a shorter text segment.', true);
        }

      } catch (err) {
        console.warn('Status poll warning:', err);
        if (pollCounter > 15) {
          clearInterval(activeJobPollTimer);
          activeJobPollTimer = null;
          setButtonLoadingState(false);
          hideProgressBar();
          showErrorToast('Status polling failed. Please retry.', true);
        }
      }
    }, 1000);
  }

  // Auto-stop Visualizer on Audio End
  if (audioPlayer) {
    audioPlayer.addEventListener('ended', () => {
      console.log('[TextToSpeechH AI] Audio playback ended naturally.');
      if (soundwave) soundwave.classList.remove('active');
      if (animationTimer) {
        clearInterval(animationTimer);
        animationTimer = null;
      }
      if (pauseBtn) {
        pauseBtn.disabled = true;
        pauseBtn.innerHTML = '<span class="btn-icon">⏸</span> Pause';
      }
      if (downloadBtn) {
        downloadBtn.disabled = false;
      }
      setButtonLoadingState(false);
    });
  }

  // Theme Switcher Manager
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const themeIcon = document.getElementById('theme-icon');
  const themeText = document.getElementById('theme-text');

  function initTheme() {
    let savedTheme = localStorage.getItem('tts_theme');
    if (!savedTheme) {
      savedTheme = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    }
    applyTheme(savedTheme);
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('tts_theme', theme);
    if (themeIcon) themeIcon.textContent = theme === 'light' ? '☀️' : '🌙';
    if (themeText) themeText.textContent = theme === 'light' ? 'Light' : 'Dark';
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      applyTheme(newTheme);
    });
  }

  initTheme();

  // Script Toolbar (Copy & Clear Buttons)
  const copyScriptBtn = document.getElementById('copy-script-btn');
  const clearScriptBtn = document.getElementById('clear-script-btn');

  function showSuccessToast(msg) {
    const toast = document.createElement('div');
    toast.style.cssText = 'pointer-events:auto; background:rgba(15, 23, 42, 0.95); border:1px solid #00f2fe; color:#ffffff; padding:14px 18px; border-radius:12px; font-size:0.95rem; box-shadow:0 10px 30px rgba(0,0,0,0.5); backdrop-filter:blur(10px); display:flex; align-items:center; gap:10px; animation: slideUp 0.3s ease;';
    toast.innerHTML = `<span style="color:#00f2fe; font-weight:700;">✓</span> <span>${msg}</span>`;
    toastContainer.appendChild(toast);
    setTimeout(() => {
      if (toast.parentNode) toast.remove();
    }, 3500);
  }

  if (copyScriptBtn) {
    copyScriptBtn.addEventListener('click', async () => {
      const text = textInput ? textInput.value.trim() : '';
      if (!text) {
        showErrorToast('No script text to copy.', false);
        return;
      }
      try {
        await navigator.clipboard.writeText(text);
        showSuccessToast('Script copied.');
      } catch (err) {
        showErrorToast('Failed to copy script to clipboard.', false);
      }
    });
  }

  if (clearScriptBtn) {
    clearScriptBtn.addEventListener('click', () => {
      if (!textInput || !textInput.value.trim()) return;
      if (confirm('Clear the current script?')) {
        textInput.value = '';
        updateTextStats();
        if (generateBtn) generateBtn.disabled = true;
      }
    });
  }

  // Recent Voice History System
  const historyGrid = document.getElementById('history-grid');
  const clearAllHistoryBtn = document.getElementById('clear-all-history-btn');

  function getHistory() {
    try {
      const saved = localStorage.getItem('tts_history');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  }

  function saveHistory(history) {
    try {
      localStorage.setItem('tts_history', JSON.stringify(history.slice(0, 5)));
    } catch (e) {
      console.warn('localStorage save history warning:', e);
    }
  }

  function blobToDataURL(blob) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  }

  async function addHistoryItem(blob, metadata) {
    try {
      const dataUrl = await blobToDataURL(blob);
      const history = getHistory();

      const now = new Date();
      const dateStr = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
      const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

      const newItem = {
        id: 'hist_' + Date.now(),
        text: metadata.text,
        voice: metadata.voice,
        voiceName: getVoiceDisplayName(metadata.voice),
        emotion: metadata.emotion,
        speed: metadata.speed,
        pitch: metadata.pitch,
        dateStr: dateStr,
        timeStr: timeStr,
        dataUrl: dataUrl
      };

      history.unshift(newItem);
      if (history.length > 5) history.pop();
      saveHistory(history);
      renderHistory();
    } catch (e) {
      console.warn('addHistoryItem error:', e);
    }
  }

  function getVoiceDisplayName(voiceVal) {
    if (!voiceSelect) return voiceVal;
    const opt = voiceSelect.querySelector(`option[value="${voiceVal}"]`);
    return opt ? opt.textContent : voiceVal;
  }

  function renderHistory() {
    if (!historyGrid) return;
    const history = getHistory();

    if (history.length === 0) {
      historyGrid.innerHTML = `<div class="history-empty-state">No recent voice generations.</div>`;
      if (clearAllHistoryBtn) clearAllHistoryBtn.style.display = 'none';
      return;
    }

    if (clearAllHistoryBtn) clearAllHistoryBtn.style.display = 'inline-flex';

    historyGrid.innerHTML = history.map(item => `
      <div class="history-card" data-id="${item.id}">
        <div class="history-card-header">
          <span class="history-voice-title">🎙️ ${item.voiceName}</span>
          <span class="history-meta-date">Generated: ${item.dateStr} • ${item.timeStr}</span>
        </div>
        <div class="history-text-preview">
          "${escapeHtml(item.text.length > 100 ? item.text.substring(0, 100) + '...' : item.text)}"
        </div>
        <div class="history-card-actions">
          <button type="button" class="history-btn hist-play-btn" data-id="${item.id}">▶ Play</button>
          <button type="button" class="history-btn hist-download-btn" data-id="${item.id}">⬇ Download</button>
          <button type="button" class="history-btn hist-copy-btn" data-id="${item.id}">📋 Copy Script</button>
          <button type="button" class="history-btn hist-again-btn" data-id="${item.id}">🔁 Generate Again</button>
          <button type="button" class="history-btn history-btn-delete hist-del-btn" data-id="${item.id}">🗑️ Delete</button>
        </div>
      </div>
    `).join('');

    history.forEach(item => {
      const card = historyGrid.querySelector(`.history-card[data-id="${item.id}"]`);
      if (!card) return;

      card.querySelector('.hist-play-btn').onclick = () => {
        if (audioPlayer) {
          audioPlayer.src = item.dataUrl;
          audioPlayer.play();
          if (soundwave) soundwave.classList.add('active');
          if (pauseBtn) {
            pauseBtn.disabled = false;
            pauseBtn.innerHTML = '<span class="btn-icon">⏸</span> Pause';
          }
        }
      };

      card.querySelector('.hist-download-btn').onclick = () => {
        const a = document.createElement('a');
        a.href = item.dataUrl;
        a.download = `TextToSpeechH_AI_History_${item.id}.mp3`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      };

      card.querySelector('.hist-copy-btn').onclick = async () => {
        try {
          await navigator.clipboard.writeText(item.text);
          showSuccessToast('Script copied.');
        } catch (e) {
          showErrorToast('Failed to copy script.', false);
        }
      };

      card.querySelector('.hist-again-btn').onclick = () => {
        if (textInput) textInput.value = item.text;
        if (voiceSelect) voiceSelect.value = item.voice;
        if (emotionSelect) emotionSelect.value = item.emotion || 'neutral';
        if (speedRange) {
          speedRange.value = item.speed || 1.0;
          if (speedVal) speedVal.textContent = `${parseFloat(speedRange.value).toFixed(1)}x`;
        }
        if (pitchRange) {
          pitchRange.value = item.pitch || 1.0;
          if (pitchVal) {
            const val = parseFloat(pitchRange.value);
            const percent = Math.round((val - 1.0) * 100);
            pitchVal.textContent = percent >= 0 ? `+${percent}%` : `${percent}%`;
          }
        }
        updateTextStats();
        const mainCard = document.querySelector('.main-card');
        if (mainCard) mainCard.scrollIntoView({ behavior: 'smooth' });
      };

      card.querySelector('.hist-del-btn').onclick = () => {
        if (confirm('Delete this history item?')) {
          const updated = getHistory().filter(h => h.id !== item.id);
          saveHistory(updated);
          renderHistory();
        }
      };
    });
  }

  if (clearAllHistoryBtn) {
    clearAllHistoryBtn.addEventListener('click', () => {
      if (confirm('Clear entire history?')) {
        saveHistory([]);
        renderHistory();
      }
    });
  }

  function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }

  renderHistory();

  function playAudioBlob(blob, metadata = null) {
    currentAudioBlob = blob;
    if (currentAudioUrl) {
      URL.revokeObjectURL(currentAudioUrl);
    }
    currentAudioUrl = URL.createObjectURL(blob);

    if (audioPlayer) {
      audioPlayer.src = currentAudioUrl;
      audioPlayer.load();

      const playPromise = audioPlayer.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          if (soundwave) soundwave.classList.add('active');
          if (pauseBtn) pauseBtn.innerHTML = '<span class="btn-icon">⏸</span> Pause';
        }).catch(err => {
          console.warn('Autoplay prevented by browser:', err);
          if (soundwave) soundwave.classList.remove('active');
          if (pauseBtn) pauseBtn.innerHTML = '<span class="btn-icon">▶</span> Play Audio';
        });
      }
    }

    if (pauseBtn) pauseBtn.disabled = false;
    if (stopBtn) stopBtn.disabled = false;
    if (downloadBtn) downloadBtn.disabled = false;

    if (metadata) {
      addHistoryItem(blob, metadata);
    }
  }

  // Audio Controls
  if (pauseBtn) {
    pauseBtn.addEventListener('click', () => {
      if (!audioPlayer) return;
      if (audioPlayer.paused) {
        audioPlayer.play();
        pauseBtn.innerHTML = '<span class="btn-icon">⏸</span> Pause';
        if (soundwave) soundwave.classList.add('active');
      } else {
        audioPlayer.pause();
        pauseBtn.innerHTML = '<span class="btn-icon">▶</span> Resume';
        if (soundwave) soundwave.classList.remove('active');
      }
    });
  }

  if (stopBtn) {
    stopBtn.addEventListener('click', () => {
      if (!audioPlayer) return;
      audioPlayer.pause();
      audioPlayer.currentTime = 0;
      if (soundwave) soundwave.classList.remove('active');
      if (pauseBtn) {
        pauseBtn.disabled = true;
        pauseBtn.innerHTML = '<span class="btn-icon">⏸</span> Pause';
      }
    });
  }

  // Single-Click High Bitrate MP3 Download
  if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
      if (!currentAudioBlob) return;
      const a = document.createElement('a');
      a.href = currentAudioUrl;
      a.download = `TextToSpeechH_AI_${activeJobId || 'voice'}.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
  }

  function setButtonLoadingState(isLoading, text = 'Processing...') {
    if (!generateBtn) return;
    if (isLoading) {
      generateBtn.disabled = true;
      generateBtn.innerHTML = `<span class="spinner"></span> ${text}`;
    } else {
      generateBtn.disabled = false;
      generateBtn.innerHTML = `<span class="btn-icon">⚡</span> Generate Voice Audio`;
    }
  }
});

