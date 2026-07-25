document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const textInput = document.getElementById('textInput');
  const voiceSelect = document.getElementById('voiceSelect');
  const speedRange = document.getElementById('speedRange');
  const speedVal = document.getElementById('speedVal');
  const pitchRange = document.getElementById('pitchRange');
  const pitchVal = document.getElementById('pitchVal');
  const emotionSelect = document.getElementById('emotionSelect');

  const charCountDisplay = document.getElementById('charCount');
  const wordCountDisplay = document.getElementById('wordCount');
  const estTimeDisplay = document.getElementById('estTime');

  const fileInput = document.getElementById('fileInput');
  const fileDropzone = document.getElementById('fileDropzone');

  const generateBtn = document.getElementById('generateBtn');
  const downloadBtn = document.getElementById('downloadBtn');
  const pauseBtn = document.getElementById('pauseBtn');
  const stopBtn = document.getElementById('stopBtn');
  const audioPlayer = document.getElementById('audioPlayer');
  const soundwave = document.getElementById('soundwave');

  const progressSection = document.getElementById('progressSection');
  const progressStatusText = document.getElementById('progressStatusText');
  const progressEta = document.getElementById('progressEta');
  const progressPercentage = document.getElementById('progressPercentage');
  const progressBarFill = document.getElementById('progressBarFill');

  let activeJobId = null;
  let activeJobPollTimer = null;
  let currentAudioUrl = null;
  let currentAudioBlob = null;

  // Real-time Text Character / Word Counter & Reading Time Calculator
  function updateTextStats() {
    const text = textInput.value || '';
    const charCount = text.length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const estSeconds = Math.ceil(words / 3);

    charCountDisplay.textContent = `${charCount.toLocaleString()} / 10,000`;
    wordCountDisplay.textContent = words.toLocaleString();

    if (estSeconds < 60) {
      estTimeDisplay.textContent = `${estSeconds}s`;
    } else {
      const mins = Math.floor(estSeconds / 60);
      const secs = estSeconds % 60;
      estTimeDisplay.textContent = `${mins}m ${secs}s`;
    }
  }

  textInput.addEventListener('input', updateTextStats);

  // Speed & Pitch Slider Listeners
  speedRange.addEventListener('input', (e) => {
    speedVal.textContent = `${parseFloat(e.target.value).toFixed(1)}x`;
  });

  pitchRange.addEventListener('input', (e) => {
    const val = parseInt(e.target.value);
    pitchVal.textContent = val > 0 ? `+${val}Hz` : `${val}Hz`;
  });

  function getFormattedRate(speedMultiplier) {
    const speed = parseFloat(speedMultiplier);
    if (speed === 1.0) return '+0%';
    const pct = Math.round((speed - 1.0) * 100);
    return pct >= 0 ? `+${pct}%` : `${pct}%`;
  }

  function getFormattedPitch(pitchValue) {
    const val = parseInt(pitchValue);
    if (val === 0) return '+0Hz';
    return val > 0 ? `+${val}Hz` : `${val}Hz`;
  }

  function setButtonLoadingState(isLoading, message = 'Generate Voice') {
    generateBtn.disabled = isLoading;
    if (isLoading) {
      generateBtn.innerHTML = `<span class="spinner"></span> ${message}`;
    } else {
      generateBtn.innerHTML = `<span class="btn-icon">⚡</span> Generate Voice`;
    }
  }

  // File Upload Handling
  async function handleFileUpload(file) {
    if (!file) return;

    const allowedExts = ['.txt', '.docx', '.pdf'];
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

    if (!allowedExts.includes(ext)) {
      alert(`Unsupported file type '${ext}'. Please upload a .txt, .docx, or .pdf document.`);
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('File size exceeds maximum limit of 10MB.');
      return;
    }

    setButtonLoadingState(true, 'Extracting Document Text...');
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'X-File-Name': file.name
        },
        body: formData
      });

      const data = await response.json();
      if (response.ok && data.success) {
        textInput.value = data.text;
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

  fileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  });

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

          // If serverless instant audio is returned
          if (data.audioDataUri) {
            const bRes = await fetch(data.audioDataUri);
            const blob = await bRes.blob();
            playAudioBlob(blob);
            setButtonLoadingState(false);
            return;
          }

          showProgressBar();
          pollJobProgress(data.jobId);
        } else {
          throw new Error(data.error || 'Failed to generate voice synthesis.');
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
    currentAudioBlob = blob;
    if (currentAudioUrl) {
      URL.revokeObjectURL(currentAudioUrl);
    }
    currentAudioUrl = URL.createObjectURL(blob);
    audioPlayer.src = currentAudioUrl;
    audioPlayer.play();

    pauseBtn.disabled = false;
    stopBtn.disabled = false;
    downloadBtn.disabled = false;
    soundwave.classList.add('active');
  }

  // Audio Controls
  pauseBtn.addEventListener('click', () => {
    if (audioPlayer.paused) {
      audioPlayer.play();
      pauseBtn.innerHTML = '<span class="btn-icon">⏸</span> Pause';
      soundwave.classList.add('active');
    } else {
      audioPlayer.pause();
      pauseBtn.innerHTML = '<span class="btn-icon">▶</span> Resume';
      soundwave.classList.remove('active');
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
    if (currentAudioBlob) {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(currentAudioBlob);
      const d = new Date();
      const pad = (n) => String(n).padStart(2, '0');
      const filename = `texttospeechh-voice-${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}.mp3`;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else if (activeJobId) {
      window.location.href = `/api/status?jobId=${activeJobId}&download=true`;
    }
  });

  audioPlayer.addEventListener('ended', () => {
    soundwave.classList.remove('active');
    pauseBtn.innerHTML = '<span class="btn-icon">▶</span> Resume';
  });

  updateTextStats();
});
