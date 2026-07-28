/**
 * TextToSpeechH AI — Production Frontend Controller
 * Domain: https://texttospeechh.com
 * Official Instagram: @webxpert.ai
 */

// Global function aliases for inline onclick fallbacks
window.startSynthesis = null;
window.generateVoice = null;
window.clearScriptText = null;

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

  const clearBtn = document.getElementById('clear-btn');

  function clearScriptText() {
    if (textInput) {
      textInput.value = '';
      updateTextStats();
      textInput.focus();
    }
  }
  window.clearScriptText = clearScriptText;

  if (textInput) {
    textInput.addEventListener('input', updateTextStats);
    updateTextStats();
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', clearScriptText);
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

    // 1. Show Progress Panel Immediately & Disable Controls
    showProgressBar();
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
              
              playAudioBlob(blob);
              setButtonLoadingState(false);
              setTimeout(hideProgressBar, 1800);
              return;
            }
          }

          pollJobProgress(data.jobId);
        } else {
          throw new Error(data.error || 'Failed to generate voice synthesis.');
        }
      } else if (contentType.includes('audio/')) {
        const audioBlob = await response.blob();
        await animateProgressStep(100, 'Finalizing merged audio...', 0, 300);
        playAudioBlob(audioBlob);
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
  function pollJobProgress(jobId) {
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

          playAudioBlob(audioBlob);
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

  function playAudioBlob(blob) {
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
  }

  // Audio Controls & Auto Stop Visualizer on Audio Ended
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

  // Cookie Consent Preferences Handler
  const cookieBanner = document.getElementById('cookie-banner');
  const acceptCookiesBtn = document.getElementById('accept-cookies-btn');

  if (cookieBanner && acceptCookiesBtn) {
    if (!localStorage.getItem('tts_cookie_consent')) {
      cookieBanner.classList.remove('hidden');
    }
    acceptCookiesBtn.addEventListener('click', () => {
      localStorage.setItem('tts_cookie_consent', 'accepted');
      cookieBanner.classList.add('hidden');
    });
  }

  // --- Ambient Particle Background Generator ---
  const particleBg = document.getElementById('particle-bg');
  if (particleBg) {
    for (let i = 0; i < 15; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      const size = Math.random() * 80 + 40;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.left = `${Math.random() * 100}vw`;
      particle.style.top = `${Math.random() * 100}vh`;
      particle.style.animationDelay = `${Math.random() * 6}s`;
      particle.style.animationDuration = `${Math.random() * 8 + 8}s`;
      particleBg.appendChild(particle);
    }
  }

  // --- Floating Feedback Modal & Supabase Integration ---
  const feedbackTrigger = document.getElementById('floating-feedback-trigger');
  const feedbackModal = document.getElementById('feedback-modal');
  const closeFeedbackBtn = document.getElementById('close-feedback-btn');
  const submitFeedbackBtn = document.getElementById('submit-feedback-btn');
  const googleAuthBtn = document.getElementById('google-auth-btn');
  const starRating = document.getElementById('star-rating');
  const feedbackText = document.getElementById('feedback-text');
  const authStepContainer = document.getElementById('auth-step-container');
  const feedbackFormContainer = document.getElementById('feedback-form-container');
  const userInfoText = document.getElementById('user-info-text');

  let selectedRating = 5;
  let currentSupabaseUser = null;

  // Initialize Supabase Client for https://eghpuhwywutglbtqheda.supabase.co
  const SUPABASE_URL = window.SUPABASE_URL || 'https://eghpuhwywutglbtqheda.supabase.co';
  const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVnaHB1aHd5d3V0Z2xidHFoZWRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzI1MTIwMDAsImV4cCI6MjAyNTAxMjAwMH0.mockKey';
  
  let supabaseClient = null;
  if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
    try {
      supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    } catch (e) {
      console.warn('[Supabase] Client init fallback:', e.message);
    }
  }

  function updateAuthUI(user) {
    currentSupabaseUser = user;
    if (user) {
      if (authStepContainer) authStepContainer.classList.add('hidden');
      if (feedbackFormContainer) feedbackFormContainer.classList.remove('hidden');
      if (userInfoText) userInfoText.innerText = `Logged in as: ${user.email || user.user_metadata?.full_name || 'Verified User'}`;
    } else {
      if (authStepContainer) authStepContainer.classList.remove('hidden');
      if (feedbackFormContainer) feedbackFormContainer.classList.add('hidden');
    }
  }

  // Check active Supabase session
  if (supabaseClient && supabaseClient.auth) {
    supabaseClient.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) updateAuthUI(session.user);
    }).catch(() => null);

    supabaseClient.auth.onAuthStateChange((_event, session) => {
      updateAuthUI(session?.user || null);
    });
  }

  if (feedbackTrigger && feedbackModal) {
    feedbackTrigger.addEventListener('click', () => {
      feedbackModal.classList.remove('hidden');
    });
  }

  if (closeFeedbackBtn && feedbackModal) {
    closeFeedbackBtn.addEventListener('click', () => {
      feedbackModal.classList.add('hidden');
    });

    feedbackModal.addEventListener('click', (e) => {
      if (e.target === feedbackModal) feedbackModal.classList.add('hidden');
    });
  }

  // Star Rating Selection
  if (starRating) {
    const stars = starRating.querySelectorAll('span');
    stars.forEach(star => {
      star.addEventListener('click', () => {
        selectedRating = parseInt(star.getAttribute('data-rating') || '5', 10);
        stars.forEach(s => {
          const r = parseInt(s.getAttribute('data-rating') || '5', 10);
          if (r <= selectedRating) {
            s.classList.add('active');
          } else {
            s.classList.remove('active');
          }
        });
      });
    });
  }

  // Google OAuth Sign-in Trigger via Supabase or Local Demo Auth
  if (googleAuthBtn) {
    googleAuthBtn.addEventListener('click', async () => {
      if (supabaseClient && supabaseClient.auth && window.location.hostname !== 'localhost') {
        try {
          await supabaseClient.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: window.location.href }
          });
          return;
        } catch (e) {
          console.warn('[Supabase OAuth]', e.message);
        }
      }
      
      // Fallback/Demo Auth step if OAuth credentials not configured in env
      const mockUser = {
        id: 'user_demo_123',
        email: 'verified.user@gmail.com',
        user_metadata: { full_name: 'Verified User' }
      };
      updateAuthUI(mockUser);
    });
  }

  // Submit Feedback to Supabase Table `feedback`
  if (submitFeedbackBtn) {
    submitFeedbackBtn.addEventListener('click', async () => {
      const msg = feedbackText ? feedbackText.value.trim() : '';
      if (!msg) {
        alert('Please enter your feedback before submitting.');
        return;
      }

      submitFeedbackBtn.disabled = true;
      submitFeedbackBtn.innerText = 'Submitting...';

      const feedbackRecord = {
        user_id: currentSupabaseUser ? currentSupabaseUser.id : 'anon_user',
        rating: selectedRating,
        feedback: msg,
        page_url: window.location.href,
        browser: navigator.userAgent,
        created_at: new Date().toISOString()
      };

      try {
        if (supabaseClient) {
          const { error } = await supabaseClient
            .from('feedback')
            .insert([feedbackRecord]);
          if (error) console.warn('[Supabase Insert Warning]', error.message);
        }
      } catch (err) {
        console.log('[Supabase Insert Error]', err);
      }

      submitFeedbackBtn.innerText = '✅ Thank You!';
      setTimeout(() => {
        if (feedbackModal) feedbackModal.classList.add('hidden');
        submitFeedbackBtn.disabled = false;
        submitFeedbackBtn.innerText = 'Submit Feedback';
        if (feedbackText) feedbackText.value = '';
      }, 1500);
    });
  }

  // --- Animated Stat Counters ---
  const statNumbers = document.querySelectorAll('.stat-number[data-target]');
  if (statNumbers.length > 0 && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.getAttribute('data-target') || '0', 10);
          if (target > 0) {
            let count = 0;
            const step = Math.ceil(target / 40);
            const timer = setInterval(() => {
              count += step;
              if (count >= target) {
                count = target;
                clearInterval(timer);
              }
              if (target >= 1000000) {
                el.innerText = `${(count / 1000000).toFixed(0)}M+`;
              } else if (target === 100) {
                el.innerText = `${count}%`;
              } else {
                el.innerText = `${count}+`;
              }
            }, 30);
          }
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.5 });

    statNumbers.forEach(num => observer.observe(num));
  // --- Accordion FAQ Section Toggle Logic ---
  const accordionHeaders = document.querySelectorAll('.accordion-header');
  if (accordionHeaders.length > 0) {
    accordionHeaders.forEach(header => {
      header.addEventListener('click', () => {
        const item = header.parentElement;
        const isActive = item.classList.contains('active');

        // Collapse all open accordion items
        document.querySelectorAll('.accordion-item').forEach(i => {
          i.classList.remove('active');
          const icon = i.querySelector('.accordion-icon');
          if (icon) icon.innerText = '➕';
        });

        if (!isActive) {
          item.classList.add('active');
          const icon = header.querySelector('.accordion-icon');
          if (icon) icon.innerText = '➖';
        }
      });
    });
  }
});

