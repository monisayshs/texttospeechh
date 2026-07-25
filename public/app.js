document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const textInput = document.getElementById('text-input');
  const charCounter = document.getElementById('char-counter');
  const clearBtn = document.getElementById('clear-btn');

  const fileDropzone = document.getElementById('file-dropzone');
  const fileInput = document.getElementById('file-input');

  const voiceSelect = document.getElementById('voice-select');
  const emotionSelect = document.getElementById('emotion-select');
  const speedRange = document.getElementById('speed-range');
  const speedVal = document.getElementById('speed-val');
  const pitchRange = document.getElementById('pitch-range');
  const pitchVal = document.getElementById('pitch-val');

  const generateBtn = document.getElementById('generate-btn');
  const pauseBtn = document.getElementById('pause-btn');
  const stopBtn = document.getElementById('stop-btn');
  const downloadBtn = document.getElementById('download-btn');

  const progressSection = document.getElementById('progress-section');
  const progressStatusText = document.getElementById('progress-status-text');
  const progressEta = document.getElementById('progress-eta');
  const progressPercentage = document.getElementById('progress-percentage');
  const progressBarFill = document.getElementById('progress-bar-fill');

  const soundwave = document.getElementById('soundwave');
  const audioPlayer = document.getElementById('audio-player');

  const shortcutTrigger = document.getElementById('shortcut-trigger');
  const shortcutModal = document.getElementById('shortcut-modal');
  const closeModalBtn = document.getElementById('close-modal-btn');

  let activeJobPollTimer = null;
  let currentAudioUrl = null;
  let activeJobId = null;

  // Counter Listener
  function updateCounters() {
    const text = textInput.value;
    const charCount = text.length;
    const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
    charCounter.textContent = `${wordCount.toLocaleString()} words | ${charCount.toLocaleString()} chars`;
  }

  textInput.addEventListener('input', updateCounters);
  clearBtn.addEventListener('click', () => {
    textInput.value = '';
    updateCounters();
  });

  // Slider Updates
  speedRange.addEventListener('input', () => speedVal.textContent = `${speedRange.value}x`);
  pitchRange.addEventListener('input', () => pitchVal.textContent = `${pitchRange.value}x`);

  function getFormattedRate(val) {
    const num = parseFloat(val);
    if (num === 1.0) return '+0%';
    const pct = Math.round((num - 1.0) * 100);
    return pct >= 0 ? `+${pct}%` : `${pct}%`;
  }

  function getFormattedPitch(val) {
    const num = parseFloat(val);
    if (num === 1.0) return '+0Hz';
    const hz = Math.round((num - 1.0) * 50);
    return hz >= 0 ? `+${hz}Hz` : `${hz}Hz`;
  }

  // Document File Upload (PDF, DOCX, TXT)
  async function handleFileUpload(file) {
    if (!file) return;
    const allowed = ['.txt', '.docx', '.pdf'];
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!allowed.includes(ext)) {
      alert('Unsupported file type. Please upload a .txt, .docx, or .pdf document.');
      return;
    }

    setButtonLoadingState(true, 'Extracting Document Text...');
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/octet-stream',
          'X-File-Name': file.name
        },
        body: file
      });

      const data = await res.json();
      if (res.ok && data.text) {
        textInput.value = data.text;
        updateCounters();
        alert(`Document '${file.name}' imported successfully into TextToSpeechH AI! (${data.wordCount.toLocaleString()} words extracted).`);
      } else {
        throw new Error(data.error || 'Failed to extract text from document.');
      }
    } catch (err) {
      alert(`File Import Error: ${err.message}`);
    } finally {
      setButtonLoadingState(false);
    }
  }

  fileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  });

  // Drag & Drop Handlers
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

  // Generate Button Click Handler
  async function startSynthesis() {
    const text = textInput.value.trim();
    if (!text) {
      alert('Please enter some script text or upload a document first.');
      return;
    }

    setButtonLoadingState(true, 'TextToSpeechH AI Synthesizing...');
    downloadBtn.disabled = true;
    pauseBtn.disabled = true;
    stopBtn.disabled = true;
    audioPlayer.pause();
    soundwave.classList.remove('active');

    if (activeJobPollTimer) {
      clearInterval(activeJobPollTimer);
      activeJobPollTimer = null;
    }

    const payload = {
      text: text,
      voice: voiceSelect.value,
      rate: getFormattedRate(speedRange.value),
      pitch: getFormattedPitch(pitchRange.value),
      style: emotionSelect.value
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
          showProgressBar();
          pollJobProgress(data.jobId);
        } else {
          throw new Error(data.error || 'Failed to enqueue voice synthesis job.');
        }
      } else if (contentType.includes('audio/')) {
        const audioBlob = await response.blob();
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

  generateBtn.addEventListener('click', startSynthesis);

  // Poll Job Progress & Live ETA
  function pollJobProgress(jobId) {
    activeJobPollTimer = setInterval(async () => {
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

          playAudioBlob(audioBlob);
          setButtonLoadingState(false);
          setTimeout(hideProgressBar, 3000);
        } else if (status.state === 'FAILED') {
          clearInterval(activeJobPollTimer);
          activeJobPollTimer = null;
          throw new Error(status.error || 'Synthesis worker failed after retries.');
        }

      } catch (err) {
        console.warn('Status poll warning:', err);
      }
    }, 1000);
  }

  function updateProgressUI(processed, total, percentage, etaSeconds) {
    progressStatusText.textContent = `Processing Chunk ${processed || 0}/${total || 1} (${percentage}%)...`;
    progressEta.textContent = etaSeconds ? `ETA: ~${etaSeconds}s remaining` : 'Finalizing merged audio...';
    progressPercentage.textContent = `${percentage}%`;
    progressBarFill.style.width = `${percentage}%`;
  }

  function showProgressBar() {
    progressSection.classList.remove('hidden');
    updateProgressUI(0, 1, 0, 0);
  }

  function hideProgressBar() {
    progressSection.classList.add('hidden');
  }

  function playAudioBlob(blob) {
    if (currentAudioUrl) {
      URL.revokeObjectURL(currentAudioUrl);
    }
    currentAudioUrl = URL.createObjectURL(blob);
    audioPlayer.src = currentAudioUrl;
    audioPlayer.play();

    pauseBtn.disabled = false;
    stopBtn.disabled = false;
    downloadBtn.disabled = false;
  }

  // Audio Controls
  pauseBtn.addEventListener('click', () => {
    if (audioPlayer.paused) {
      audioPlayer.play();
      pauseBtn.innerHTML = '<span class="btn-icon">⏸</span> Pause';
    } else {
      audioPlayer.pause();
      pauseBtn.innerHTML = '<span class="btn-icon">▶</span> Resume';
    }
  });

  stopBtn.addEventListener('click', () => {
    audioPlayer.pause();
    audioPlayer.currentTime = 0;
    soundwave.classList.remove('active');
    pauseBtn.disabled = true;
    stopBtn.disabled = true;
  });

  downloadBtn.addEventListener('click', () => {
    if (activeJobId) {
      window.location.href = `/api/status?jobId=${activeJobId}&download=true`;
    } else if (currentAudioUrl) {
      const a = document.createElement('a');
      a.href = currentAudioUrl;
      const d = new Date();
      const pad = n => String(n).padStart(2, '0');
      const filename = `texttospeechh-voice-${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}.mp3`;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  });

  // Visualizer Events
  audioPlayer.addEventListener('play', () => soundwave.classList.add('active'));
  audioPlayer.addEventListener('pause', () => soundwave.classList.remove('active'));
  audioPlayer.addEventListener('ended', () => {
    soundwave.classList.remove('active');
    pauseBtn.disabled = true;
    stopBtn.disabled = true;
  });

  function setButtonLoadingState(isLoading, text = 'Synthesizing AI Voice...') {
    if (isLoading) {
      generateBtn.disabled = true;
      generateBtn.querySelector('.btn-text').textContent = text;
    } else {
      generateBtn.disabled = false;
      generateBtn.querySelector('.btn-text').textContent = 'Generate AI Voice';
    }
  }

  // Keyboard Shortcuts (Ctrl+Enter, Space, Esc)
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'Enter') {
      e.preventDefault();
      startSynthesis();
    } else if (e.key === 'Escape') {
      shortcutModal.classList.add('hidden');
      audioPlayer.pause();
    } else if (e.code === 'Space' && e.target.tagName !== 'TEXTAREA' && e.target.tagName !== 'INPUT') {
      e.preventDefault();
      if (!audioPlayer.paused) {
        audioPlayer.pause();
      } else if (audioPlayer.src) {
        audioPlayer.play();
      }
    }
  });

  // Modal Listeners
  shortcutTrigger.addEventListener('click', () => shortcutModal.classList.remove('hidden'));
  closeModalBtn.addEventListener('click', () => shortcutModal.classList.add('hidden'));
  shortcutModal.addEventListener('click', (e) => {
    if (e.target === shortcutModal) shortcutModal.classList.add('hidden');
  });

  updateCounters();
});
