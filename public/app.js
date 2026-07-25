/**
 * TextToSpeechH AI — Production Frontend Controller
 * Domain: https://texttospeechh.com
 * Official Instagram: @webxpert.ai
 */

// Global function alias for inline onclick fallbacks
window.startSynthesis = null;
window.generateVoice = null;

document.addEventListener('DOMContentLoaded', () => {
  // Robust DOM Elements selection supporting both id naming conventions
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

  // Document File Upload Handler (.txt, .docx, .pdf)
  async function handleFileUpload(file) {
    if (!file) return;
    const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
    if (!['.txt', '.docx', '.pdf'].includes(ext)) {
      alert('Unsupported file format. Please upload a .txt, .docx, or .pdf document.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('File size exceeds maximum limit of 10MB.');
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
        alert(`Document '${file.name}' imported successfully! (${data.wordCount} words extracted)`);
      } else {
        throw new Error(data.error || 'Document extraction failed.');
      }
    } catch (err) {
      alert(`File Import Error: ${err.message}`);
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
      alert('Please enter some script text or upload a document first.');
      return;
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

    const payload = {
      text: text,
      voice: voiceSelect ? voiceSelect.value : 'hi-IN-SwaraNeural',
      rate: getFormattedRate(speedRange ? speedRange.value : 1.0),
      pitch: getFormattedPitch(pitchRange ? pitchRange.value : 1.0),
      style: emotionSelect ? emotionSelect.value : 'neutral'
    };

    try {
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
              hideProgressBar();
              playAudioBlob(blob);
              setButtonLoadingState(false);
              return;
            }
          }

          showProgressBar();
          pollJobProgress(data.jobId);
        } else {
          throw new Error(data.error || 'Failed to generate voice synthesis.');
        }
      } else if (contentType.includes('audio/')) {
        const audioBlob = await response.blob();
        hideProgressBar();
        playAudioBlob(audioBlob);
        setButtonLoadingState(false);
      } else {
        throw new Error('Unexpected server response.');
      }

    } catch (err) {
      console.error('Synthesis error:', err);
      alert(`TextToSpeechH AI Synthesis Error: ${err.message}`);
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

  // Poll Job Progress & Live ETA
  function pollJobProgress(jobId) {
    pollCounter = 0;
    activeJobPollTimer = setInterval(async () => {
      pollCounter++;
      try {
        const res = await fetch(`/api/status?jobId=${jobId}`);
        if (!res.ok) throw new Error('Status poll failed');
        const status = await res.json();

        updateProgressUI(status.processedChunks, status.totalChunks, status.progress, status.etaSeconds);

        if (status.state === 'COMPLETED') {
          clearInterval(activeJobPollTimer);
          activeJobPollTimer = null;

          const audioRes = await fetch(`/api/status?jobId=${jobId}&download=true`);
          const audioBlob = await audioRes.blob();

          hideProgressBar();
          playAudioBlob(audioBlob);
          setButtonLoadingState(false);
        } else if (status.state === 'FAILED') {
          clearInterval(activeJobPollTimer);
          activeJobPollTimer = null;
          setButtonLoadingState(false);
          hideProgressBar();
          alert(`Synthesis Warning: ${status.error || 'Speech synthesis failed. Please retry.'}`);
        } else if (pollCounter > 15) {
          clearInterval(activeJobPollTimer);
          activeJobPollTimer = null;
          setButtonLoadingState(false);
          hideProgressBar();
          alert('Synthesis timeout. Please retry with a shorter text segment.');
        }

      } catch (err) {
        console.warn('Status poll warning:', err);
        if (pollCounter > 15) {
          clearInterval(activeJobPollTimer);
          activeJobPollTimer = null;
          setButtonLoadingState(false);
          hideProgressBar();
        }
      }
    }, 1000);
  }

  function updateProgressUI(processed, total, percentage, etaSeconds) {
    if (!progressStatusText) return;
    progressStatusText.textContent = `Processing Chunk ${processed || 0}/${total || 1} (${percentage}%)...`;
    if (progressEta) progressEta.textContent = etaSeconds ? `ETA: ~${etaSeconds}s remaining` : 'Finalizing merged audio...';
    if (progressPercentage) progressPercentage.textContent = `${percentage}%`;
    if (progressBarFill) progressBarFill.style.width = `${percentage}%`;
  }

  function showProgressBar() {
    if (progressSection) progressSection.classList.remove('hidden');
    updateProgressUI(0, 1, 0, 0);
  }

  function hideProgressBar() {
    if (progressSection) progressSection.classList.add('hidden');
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
