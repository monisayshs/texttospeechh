/**
 * Standalone Tool Pages for TextToSpeechH AI
 * Official Brand: TextToSpeechH AI
 * Domain: https://www.texttospeechh.com
 *
 * Interactive, 100% client-side tools rendered through the dedicated
 * standalone renderToolPage() pipeline in seoHandler.js (iLovePDF-style:
 * slim header, tool first, explanations below). First tool: Voice Pitch
 * Changer, live at the top-level route /voice-pitch-changer since
 * 2026-10-31 (the original /text-to-speech/voice-pitch-changer route
 * 301-redirects to it), with the tools hub at /tools.
 *
 * The pitch-shifting engine below is an original vanilla-JS implementation
 * of the classic SoundTouch approach (WSOLA time-stretch + resample), so
 * pitch changes without changing speed. No external library, no CDN, and
 * the user's file is never uploaded — all processing happens in the
 * browser via the Web Audio API.
 */

const TOOL_PAGES = {
  "voice-pitch-changer": {
    "title": "Voice Pitch Changer — Change Voice Pitch Online Free | TextToSpeechH AI",
    "h1": "Voice Pitch Changer",
    "metaDesc": "Change the pitch of any voice recording online for free. Raise or lower pitch by up to 12 semitones without changing speed. No sign-up, no watermark — your file never leaves your browser.",
    "category": "Audio Tools",
    "standaloneTool": true,
    "tagline": "Make any voice deeper or higher in seconds. Free, no sign-up, no watermark - and your file never leaves your browser.",
    "readingTime": "5 min read",
    "faqs": [
      { "q": "Is this voice pitch changer free to use?", "a": "Yes. The Voice Pitch Changer on TextToSpeechH AI is completely free — no sign-up, no watermark, and no limit on how many clips you process. Your downloads are clean WAV files." },
      { "q": "Does changing the pitch also change the speed?", "a": "No. The tool time-stretches your audio before shifting it, so the pitch goes up or down while the tempo and total length stay exactly the same. A 30-second clip stays 30 seconds." },
      { "q": "How do I make my voice sound deeper?", "a": "Drag the pitch slider to the left, into negative semitones. For a natural deeper voice, -3 to -5 semitones usually works best. Larger drops (-7 to -12) sound more dramatic and are popular for character voices and anonymous narration." },
      { "q": "How do I make my voice sound higher?", "a": "Drag the pitch slider to the right, into positive semitones. +3 to +5 semitones gives a naturally higher voice; +7 to +12 creates a chipmunk-style effect often used in funny videos and Shorts." },
      { "q": "Is my audio file uploaded to a server?", "a": "No. Everything runs 100% in your browser using the Web Audio API. Your file is never uploaded, stored, or sent anywhere — you can even disconnect from the internet after the page loads and the tool will still work." }
    ],
    "content": `
      <div id="vpc-tool" style="background:var(--color-surface); border:1px solid var(--color-border); padding:28px; border-radius:16px; margin-bottom:34px; box-shadow:var(--shadow-lg);">
        <div id="vpc-dropzone" role="button" tabindex="0" aria-label="Upload an audio file" style="border:2px dashed var(--color-border-strong); border-radius:12px; padding:52px 20px; text-align:center; cursor:pointer; background:var(--color-bg);">
          <p style="margin:0 0 12px; font-size:2.2rem; line-height:1;">&#127908;</p>
          <p style="margin:0 0 16px; font-size:1.18rem; font-weight:700;">Drag &amp; drop your audio file here</p>
          <p style="margin:0 0 18px;"><span style="display:inline-block; background:var(--color-primary); color:var(--color-primary-on); padding:14px 38px; border-radius:10px; font-weight:700; font-size:1.05rem;">Select Audio File</span></p>
          <p style="margin:0; font-size:0.85rem; color:var(--color-text-muted);">MP3, WAV, OGG, M4A &middot; Max 50 MB &middot; Clips up to 3 minutes &middot; 100% in your browser - never uploaded</p>
        </div>
        <input type="file" id="vpc-file-input" accept=".mp3,.wav,.ogg,.oga,.m4a,.aac,.webm,audio/*" style="display:none;">
        <p id="vpc-file-info" style="margin:12px 0 0; font-size:0.9rem; font-weight:600;"></p>
        <p id="vpc-status" style="margin:8px 0 0; font-size:0.9rem; color:var(--color-text-muted);">No file loaded yet. Choose a recording to get started.</p>

        <div id="vpc-controls" style="display:none; margin-top:20px;">
          <div style="display:flex; justify-content:space-between; align-items:baseline; flex-wrap:wrap; gap:8px;">
            <label for="vpc-semitones" style="font-weight:600;">Pitch (semitones)</label>
            <span id="vpc-semi-value" style="font-weight:700; color:var(--color-primary);">0 — original pitch</span>
          </div>
          <input type="range" id="vpc-semitones" min="-12" max="12" step="1" value="0" style="width:100%; margin:10px 0 4px; accent-color:var(--color-primary);">
          <div class="vpc-chips" id="vpc-chips" style="display:flex; flex-wrap:wrap; gap:8px; margin:10px 0 18px;">
            <button type="button" class="vpc-chip" data-semi="-12">-12</button>
            <button type="button" class="vpc-chip" data-semi="-7">-7</button>
            <button type="button" class="vpc-chip" data-semi="-5">-5</button>
            <button type="button" class="vpc-chip" data-semi="-3">-3</button>
            <button type="button" class="vpc-chip" data-semi="0">0</button>
            <button type="button" class="vpc-chip" data-semi="3">+3</button>
            <button type="button" class="vpc-chip" data-semi="5">+5</button>
            <button type="button" class="vpc-chip" data-semi="7">+7</button>
            <button type="button" class="vpc-chip" data-semi="12">+12</button>
          </div>

          <div style="display:flex; justify-content:space-between; align-items:baseline; flex-wrap:wrap; gap:8px;">
            <label for="vpc-cents" style="font-weight:600;">Fine-tune (cents)</label>
            <span style="font-size:0.85rem; color:var(--color-text-muted);">100 cents = 1 semitone</span>
          </div>
          <div style="display:flex; gap:12px; align-items:center; margin:8px 0 18px;">
            <input type="range" id="vpc-cents-range" min="-100" max="100" step="1" value="0" style="flex:1; accent-color:var(--color-primary);">
            <input type="number" id="vpc-cents" min="-100" max="100" step="1" value="0" style="width:76px; padding:6px 8px; border:1px solid var(--color-border); border-radius:6px; background:var(--color-bg); color:inherit;">
          </div>

          <div style="display:flex; gap:10px; align-items:center; flex-wrap:wrap; margin-bottom:14px;">
            <div role="group" aria-label="Preview version" style="display:inline-flex; border:1px solid var(--color-border); border-radius:8px; overflow:hidden;">
              <button type="button" id="vpc-mode-original" style="padding:9px 18px; border:0; background:transparent; color:inherit; cursor:pointer; font-weight:600;">Original</button>
              <button type="button" id="vpc-mode-changed" style="padding:9px 18px; border:0; background:var(--color-primary); color:var(--color-primary-on); cursor:pointer; font-weight:600;">Changed</button>
            </div>
            <button type="button" id="vpc-play" class="primary-btn" style="border:0; cursor:pointer;">&#9654; Play</button>
            <button type="button" id="vpc-download" style="padding:10px 20px; border-radius:8px; border:1px solid var(--color-primary); background:var(--color-primary-soft); color:var(--color-primary); font-weight:600; cursor:pointer;">Download Changed (WAV)</button>
          </div>

          <div id="vpc-progress" style="height:10px; background:var(--color-bg); border:1px solid var(--color-border); border-radius:6px; cursor:pointer; overflow:hidden;">
            <div id="vpc-progress-fill" style="height:100%; width:0%; background:var(--color-primary);"></div>
          </div>
          <p id="vpc-time" style="margin:6px 0 0; font-size:0.85rem; color:var(--color-text-muted);">0:00 / 0:00</p>
        </div>
      </div>

      <style>
        .vpc-chip { padding:7px 13px; border-radius:999px; border:1px solid var(--color-border); background:var(--color-bg); color:inherit; cursor:pointer; font-weight:600; font-size:0.9rem; }
        .vpc-chip:hover { border-color:var(--color-primary); }
        .vpc-chip.vpc-active { background:var(--color-primary); color:var(--color-primary-on); border-color:var(--color-primary); }
        #vpc-dropzone.vpc-drag { border-color:var(--color-primary); background:var(--color-primary-soft); }
      </style>

      <div style="display:grid; grid-template-columns:repeat(auto-fit,minmax(180px,1fr)); gap:14px; margin-bottom:30px;">
        <div style="background:var(--color-surface); border:1px solid var(--color-border); border-radius:12px; padding:18px; text-align:center;">
          <p style="margin:0 0 6px; font-size:1.5rem;">&#128176;</p>
          <p style="margin:0 0 4px; font-weight:700;">100% Free</p>
          <p style="margin:0; font-size:0.88rem; color:var(--color-text-muted); line-height:1.55;">No limits, no hidden charges. Process as many clips as you like.</p>
        </div>
        <div style="background:var(--color-surface); border:1px solid var(--color-border); border-radius:12px; padding:18px; text-align:center;">
          <p style="margin:0 0 6px; font-size:1.5rem;">&#128272;</p>
          <p style="margin:0 0 4px; font-weight:700;">Private by Design</p>
          <p style="margin:0; font-size:0.88rem; color:var(--color-text-muted); line-height:1.55;">Your audio is processed in your browser and is never uploaded anywhere.</p>
        </div>
        <div style="background:var(--color-surface); border:1px solid var(--color-border); border-radius:12px; padding:18px; text-align:center;">
          <p style="margin:0 0 6px; font-size:1.5rem;">&#9889;</p>
          <p style="margin:0 0 4px; font-weight:700;">Pitch Without Speed Change</p>
          <p style="margin:0; font-size:0.88rem; color:var(--color-text-muted); line-height:1.55;">The voice goes deeper or higher while the tempo and length stay the same.</p>
        </div>
        <div style="background:var(--color-surface); border:1px solid var(--color-border); border-radius:12px; padding:18px; text-align:center;">
          <p style="margin:0 0 6px; font-size:1.5rem;">&#10003;</p>
          <p style="margin:0 0 4px; font-weight:700;">No Sign-Up, No Watermark</p>
          <p style="margin:0; font-size:0.88rem; color:var(--color-text-muted); line-height:1.55;">Open the page, drop a file, download a clean WAV. Nothing else asked.</p>
        </div>
      </div>

      <h2>What is a Voice Pitch Changer?</h2>
      <p style="line-height:1.75; margin-bottom:24px;">
        A <strong>voice pitch changer</strong> raises or lowers the pitch of a voice recording - making it deeper or higher - <strong>without changing its speed</strong>. Drop an MP3, WAV, OGG or M4A clip into the tool above, move one slider, preview the result, and download it as a WAV file. Need a brand-new AI voice instead of editing a recording? Try our <a href="https://www.texttospeechh.com">free text to speech generator</a>.
      </p>

      <h2>How to Use the Voice Pitch Changer</h2>
      <ol style="line-height:1.8; margin-bottom:24px; padding-left:20px;">
        <li><strong>Add your audio.</strong> Drag an MP3, WAV, OGG or M4A file into the box above, or click it to browse. Nothing is uploaded — the file stays on your device.</li>
        <li><strong>Move the pitch slider.</strong> Left makes the voice deeper, right makes it higher. Use the preset chips for common jumps like -5 (deeper) or +5 (higher), and the cents control when you need a smaller, precise adjustment.</li>
        <li><strong>Preview and compare.</strong> Press Play and switch between <strong>Original</strong> and <strong>Changed</strong> to hear the difference before you commit.</li>
        <li><strong>Download your WAV.</strong> Click Download Changed (WAV) to save the pitch-shifted audio — no watermark, no sign-up, no cost.</li>
      </ol>

      <h2>Make a Voice Deeper or Higher — Without Sounding Weird</h2>
      <p>
        Small shifts sound natural: <strong>-3 to -5 semitones</strong> turns an ordinary recording into a deeper, more authoritative narration voice, and <strong>+3 to +5 semitones</strong> gives a lighter, younger voice that still sounds human. Go further — -7 to -12 or +7 to +12 — and you get deliberate character effects: the booming anonymous narrator or the classic chipmunk voice used in funny Shorts.
      </p>
      <p>
        One honest note: every pitch changer on the internet, paid or free, shifts the voice's resonances along with the pitch, so extreme shifts always sound a little cartoonish. That is the physics of pitch shifting, not a flaw in this tool. For the cleanest result, start with a clear recording with little background music, and prefer two small adjustments over one extreme jump.
      </p>

      <h2>Who Uses a Voice Pitch Changer?</h2>
      <ul style="line-height:1.8; margin-bottom:24px; padding-left:20px;">
        <li><strong>Faceless video creators</strong> who narrate their own videos but want a deeper, more anonymous voice for privacy.</li>
        <li><strong>Shorts and meme editors</strong> making chipmunk or deep-voice character clips.</li>
        <li><strong>Podcasters and storytellers</strong> giving different characters different pitches from a single recording.</li>
        <li><strong>Singers and musicians</strong> checking how a melody or backing track feels a few semitones up or down.</li>
      </ul>
      <p>
        Creating a voiceover from scratch instead? Our <a href="/text-to-speech/voice-generator">AI voice generator</a> turns typed text into natural narration, and our <a href="/text-to-speech/blog/text-to-speech-for-youtube">text to speech for YouTube guide</a> shows the full faceless-channel workflow. More guides live on the <a href="/text-to-speech/blog">TextToSpeechH AI blog</a>.
      </p>

      <h2>More Free Tools</h2>
      <div style="display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:14px; margin-bottom:30px;">
        <a href="/tools" style="display:block; background:var(--color-surface); border:1px solid var(--color-border); border-radius:12px; padding:18px; text-decoration:none; color:inherit;">
          <p style="margin:0 0 4px; font-weight:700; color:var(--color-primary);">All Free Tools</p>
          <p style="margin:0; font-size:0.88rem; color:var(--color-text-muted); line-height:1.55;">Browse every free tool on TextToSpeechH AI in one place.</p>
        </a>
        <a href="/" style="display:block; background:var(--color-surface); border:1px solid var(--color-border); border-radius:12px; padding:18px; text-decoration:none; color:inherit;">
          <p style="margin:0 0 4px; font-weight:700; color:var(--color-primary);">Text to Speech Generator</p>
          <p style="margin:0; font-size:0.88rem; color:var(--color-text-muted); line-height:1.55;">Turn typed text into natural AI voiceovers, free.</p>
        </a>
        <a href="/text-to-speech/voice-generator" style="display:block; background:var(--color-surface); border:1px solid var(--color-border); border-radius:12px; padding:18px; text-decoration:none; color:inherit;">
          <p style="margin:0 0 4px; font-weight:700; color:var(--color-primary);">AI Voice Generator</p>
          <p style="margin:0; font-size:0.88rem; color:var(--color-text-muted); line-height:1.55;">Create studio-style narration voices for videos and podcasts.</p>
        </a>
      </div>

      <h2>Frequently Asked Questions</h2>
      <div class="faq-accordion" style="display:flex; flex-direction:column; gap:16px; margin-top:20px;">
        <div style="background:var(--color-bg-secondary); border:1px solid var(--color-border); padding:18px; border-radius:10px;">
          <h4 style="margin-top:0; color:var(--color-primary);">Is this voice pitch changer free to use?</h4>
          <p style="margin:0; font-size:0.92rem; line-height:1.6;">Yes. The Voice Pitch Changer on TextToSpeechH AI is completely free — no sign-up, no watermark, and no limit on how many clips you process. Your downloads are clean WAV files.</p>
        </div>
        <div style="background:var(--color-bg-secondary); border:1px solid var(--color-border); padding:18px; border-radius:10px;">
          <h4 style="margin-top:0; color:var(--color-primary);">Does changing the pitch also change the speed?</h4>
          <p style="margin:0; font-size:0.92rem; line-height:1.6;">No. The tool time-stretches your audio before shifting it, so the pitch goes up or down while the tempo and total length stay exactly the same. A 30-second clip stays 30 seconds.</p>
        </div>
        <div style="background:var(--color-bg-secondary); border:1px solid var(--color-border); padding:18px; border-radius:10px;">
          <h4 style="margin-top:0; color:var(--color-primary);">How do I make my voice sound deeper?</h4>
          <p style="margin:0; font-size:0.92rem; line-height:1.6;">Drag the pitch slider to the left, into negative semitones. For a natural deeper voice, -3 to -5 semitones usually works best. Larger drops (-7 to -12) sound more dramatic and are popular for character voices and anonymous narration.</p>
        </div>
        <div style="background:var(--color-bg-secondary); border:1px solid var(--color-border); padding:18px; border-radius:10px;">
          <h4 style="margin-top:0; color:var(--color-primary);">How do I make my voice sound higher?</h4>
          <p style="margin:0; font-size:0.92rem; line-height:1.6;">Drag the pitch slider to the right, into positive semitones. +3 to +5 semitones gives a naturally higher voice; +7 to +12 creates a chipmunk-style effect often used in funny videos and Shorts.</p>
        </div>
        <div style="background:var(--color-bg-secondary); border:1px solid var(--color-border); padding:18px; border-radius:10px;">
          <h4 style="margin-top:0; color:var(--color-primary);">Is my audio file uploaded to a server?</h4>
          <p style="margin:0; font-size:0.92rem; line-height:1.6;">No. Everything runs 100% in your browser using the Web Audio API. Your file is never uploaded, stored, or sent anywhere — you can even disconnect from the internet after the page loads and the tool will still work.</p>
        </div>
      </div>

      <script>
      (function () {
        var dropzone = document.getElementById('vpc-dropzone');
        var fileInput = document.getElementById('vpc-file-input');
        var fileInfo = document.getElementById('vpc-file-info');
        var controls = document.getElementById('vpc-controls');
        var statusEl = document.getElementById('vpc-status');
        var slider = document.getElementById('vpc-semitones');
        var semiValue = document.getElementById('vpc-semi-value');
        var centsRange = document.getElementById('vpc-cents-range');
        var centsInput = document.getElementById('vpc-cents');
        var chips = document.getElementById('vpc-chips');
        var playBtn = document.getElementById('vpc-play');
        var downloadBtn = document.getElementById('vpc-download');
        var modeOriginalBtn = document.getElementById('vpc-mode-original');
        var modeChangedBtn = document.getElementById('vpc-mode-changed');
        var progressBar = document.getElementById('vpc-progress');
        var progressFill = document.getElementById('vpc-progress-fill');
        var timeLabel = document.getElementById('vpc-time');

        var MAX_SECONDS = 180;
        var audioCtx = null;
        var originalBuffer = null;
        var processedBuffer = null;
        var processedKey = '';
        var originalName = 'audio';
        var mode = 'changed';
        var sourceNode = null;
        var playing = false;
        var busy = false;
        var startedAt = 0;
        var startOffset = 0;
        var rafId = null;

        function ensureCtx() {
          if (!audioCtx) {
            var AC = window.AudioContext || window.webkitAudioContext;
            audioCtx = new AC();
          }
          if (audioCtx.state === 'suspended') audioCtx.resume();
          return audioCtx;
        }
        function setStatus(msg, isError) {
          statusEl.textContent = msg;
          statusEl.style.color = isError ? 'var(--color-error-text)' : 'var(--color-text-muted)';
        }
        function fmtTime(sec) {
          sec = Math.max(0, Math.floor(sec || 0));
          var m = Math.floor(sec / 60);
          var s = sec % 60;
          return m + ':' + (s < 10 ? '0' : '') + s;
        }
        function clampCents(v) {
          v = parseFloat(v) || 0;
          if (v > 100) v = 100;
          if (v < -100) v = -100;
          return v;
        }
        function currentSemis() { return parseFloat(slider.value) || 0; }
        function currentRatio() {
          return Math.pow(2, (currentSemis() + clampCents(centsInput.value) / 100) / 12);
        }
        function paramsKey() { return slider.value + '|' + clampCents(centsInput.value); }

        function updateReadout() {
          var semis = currentSemis();
          var cents = clampCents(centsInput.value);
          var label;
          if (semis === 0 && cents === 0) label = '0 — original pitch';
          else {
            var total = semis + cents / 100;
            var dir = total < 0 ? 'deeper voice' : 'higher voice';
            label = (total > 0 ? '+' : '') + (Math.round(total * 100) / 100) + ' semitones — ' + dir;
          }
          semiValue.textContent = label;
          var chipBtns = chips.getElementsByTagName('button');
          for (var i = 0; i < chipBtns.length; i++) {
            var on = parseFloat(chipBtns[i].getAttribute('data-semi')) === semis && cents === 0;
            chipBtns[i].className = on ? 'vpc-chip vpc-active' : 'vpc-chip';
          }
        }

        // ---- DSP: WSOLA time-stretch + resample (SoundTouch approach) ----
        function hannWindow(size) {
          var w = new Float32Array(size);
          for (var i = 0; i < size; i++) w[i] = 0.5 * (1 - Math.cos(2 * Math.PI * i / (size - 1)));
          return w;
        }

        function timeStretch(samples, factor) {
          var n = samples.length;
          if (Math.abs(factor - 1) < 0.0001 || n <= 8192) return samples.slice(0);
          var win = 4096;
          var hopA = 1024;
          var hopS = Math.max(256, Math.round(hopA * factor));
          if (hopS >= win) hopS = win - 1024;
          var overlap = win - hopS;
          var seek = 320;
          var corrLen = Math.min(320, overlap);
          var corrStart = Math.floor((overlap - corrLen) / 2);
          var window = hannWindow(win);
          var targetLen = Math.round(n * factor);
          var out = new Float32Array(targetLen + win);
          var i, k, d;
          for (i = 0; i < win && i < n; i++) out[i] = samples[i] * window[i];
          var writePos = hopS;
          var readPos = hopA;
          var filled = win;
          while (readPos + win + seek < n && writePos + win < out.length) {
            var bestOffset = 0;
            var bestCorr = -Infinity;
            for (d = -seek; d <= seek; d += 4) {
              var base = readPos + d + corrStart;
              var corr = 0;
              for (k = 0; k < corrLen; k += 2) corr += samples[base + k] * out[writePos + corrStart + k];
              if (corr > bestCorr) { bestCorr = corr; bestOffset = d; }
            }
            var lo = Math.max(-seek, bestOffset - 4);
            var hi = Math.min(seek, bestOffset + 4);
            for (d = lo; d <= hi; d++) {
              var base2 = readPos + d + corrStart;
              var corr2 = 0;
              for (k = 0; k < corrLen; k += 2) corr2 += samples[base2 + k] * out[writePos + corrStart + k];
              if (corr2 > bestCorr) { bestCorr = corr2; bestOffset = d; }
            }
            var src = readPos + bestOffset;
            for (k = 0; k < win; k++) {
              var v = samples[src + k] * window[k];
              if (k < overlap) out[writePos + k] += v; else out[writePos + k] = v;
            }
            filled = writePos + win;
            writePos += hopS;
            readPos += hopA;
          }
          if (readPos < n) {
            for (i = 0; readPos + i < n && writePos + i < out.length; i++) {
              if (i < overlap) out[writePos + i] += samples[readPos + i] * window[i];
              else out[writePos + i] = samples[readPos + i];
            }
            filled = Math.min(out.length, writePos + (n - readPos));
          }
          return out.slice(0, Math.min(targetLen, filled));
        }

        function pitchShiftChannel(samples, ratio) {
          var n = samples.length;
          if (Math.abs(ratio - 1) < 0.0001) return samples.slice(0);
          if (n < 8192) {
            var tiny = new Float32Array(n);
            for (var j = 0; j < n; j++) tiny[j] = samples[Math.floor(j * ratio) % n];
            return tiny;
          }
          var stretched = timeStretch(samples, ratio);
          var out = new Float32Array(n);
          for (var i = 0; i < n; i++) {
            var pos = i * ratio;
            var idx = Math.floor(pos);
            var frac = pos - idx;
            var a = idx < stretched.length ? stretched[idx] : 0;
            var b = idx + 1 < stretched.length ? stretched[idx + 1] : a;
            out[i] = a + (b - a) * frac;
          }
          return out;
        }

        function renderProcessed() {
          var key = paramsKey();
          if (processedBuffer && processedKey === key) return processedBuffer;
          var ratio = currentRatio();
          var numCh = originalBuffer.numberOfChannels;
          var outBuf = audioCtx.createBuffer(numCh, originalBuffer.length, originalBuffer.sampleRate);
          for (var ch = 0; ch < numCh; ch++) {
            var shifted = pitchShiftChannel(originalBuffer.getChannelData(ch), ratio);
            outBuf.getChannelData(ch).set(shifted.subarray(0, originalBuffer.length));
          }
          processedBuffer = outBuf;
          processedKey = key;
          return outBuf;
        }

        function renderProcessedAsync(done) {
          if (processedBuffer && processedKey === paramsKey()) { done(processedBuffer); return; }
          busy = true;
          playBtn.disabled = true;
          downloadBtn.disabled = true;
          setStatus('Processing the pitch change — a few seconds for longer clips...');
          setTimeout(function () {
            try {
              var buf = renderProcessed();
              busy = false;
              playBtn.disabled = false;
              downloadBtn.disabled = false;
              setStatus('Ready. Preview the changed voice or download it as WAV.');
              done(buf);
            } catch (e) {
              busy = false;
              playBtn.disabled = false;
              downloadBtn.disabled = false;
              setStatus('Processing failed in this browser. Try a shorter clip or a different file.', true);
            }
          }, 60);
        }

        // ---- WAV encoding (16-bit PCM) ----
        function bufferToWavBlob(buffer) {
          var numCh = Math.min(2, buffer.numberOfChannels);
          var sr = buffer.sampleRate;
          var len = buffer.length;
          var blockAlign = numCh * 2;
          var dataSize = len * blockAlign;
          var ab = new ArrayBuffer(44 + dataSize);
          var view = new DataView(ab);
          function writeStr(off, s) { for (var i = 0; i < s.length; i++) view.setUint8(off + i, s.charCodeAt(i)); }
          writeStr(0, 'RIFF');
          view.setUint32(4, 36 + dataSize, true);
          writeStr(8, 'WAVE');
          writeStr(12, 'fmt ');
          view.setUint32(16, 16, true);
          view.setUint16(20, 1, true);
          view.setUint16(22, numCh, true);
          view.setUint32(24, sr, true);
          view.setUint32(28, sr * blockAlign, true);
          view.setUint16(32, blockAlign, true);
          view.setUint16(34, 16, true);
          writeStr(36, 'data');
          view.setUint32(40, dataSize, true);
          var chans = [];
          for (var c = 0; c < numCh; c++) chans.push(buffer.getChannelData(c));
          var offset = 44;
          for (var i = 0; i < len; i++) {
            for (var c2 = 0; c2 < numCh; c2++) {
              var s = Math.max(-1, Math.min(1, chans[c2][i]));
              view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
              offset += 2;
            }
          }
          return new Blob([ab], { type: 'audio/wav' });
        }

        // ---- Playback ----
        function activeBuffer() { return mode === 'original' ? originalBuffer : processedBuffer; }
        function updatePlayUI() {
          playBtn.innerHTML = playing ? '&#10073;&#10073; Pause' : '&#9654; Play';
          var buf = activeBuffer();
          if (buf) {
            var pos = playing ? startOffset + (audioCtx.currentTime - startedAt) : startOffset;
            if (pos > buf.duration) pos = buf.duration;
            progressFill.style.width = (buf.duration ? (pos / buf.duration) * 100 : 0) + '%';
            timeLabel.textContent = fmtTime(pos) + ' / ' + fmtTime(buf.duration);
          }
        }
        function stopPlayback(keepOffset) {
          if (sourceNode) {
            sourceNode.onended = null;
            try { sourceNode.stop(); } catch (e) {}
            try { sourceNode.disconnect(); } catch (e) {}
            sourceNode = null;
          }
          if (playing && keepOffset && audioCtx) startOffset += audioCtx.currentTime - startedAt;
          playing = false;
          if (rafId) cancelAnimationFrame(rafId);
          rafId = null;
        }
        function tickProgress() {
          if (!playing) return;
          updatePlayUI();
          rafId = requestAnimationFrame(tickProgress);
        }
        function startPlayback() {
          ensureCtx();
          var buf = activeBuffer();
          if (!buf) return;
          stopPlayback(false);
          if (startOffset >= buf.duration) startOffset = 0;
          sourceNode = audioCtx.createBufferSource();
          sourceNode.buffer = buf;
          sourceNode.connect(audioCtx.destination);
          sourceNode.onended = function () {
            if (playing) { playing = false; startOffset = 0; updatePlayUI(); }
          };
          startedAt = audioCtx.currentTime;
          sourceNode.start(0, startOffset);
          playing = true;
          updatePlayUI();
          tickProgress();
        }
        function playPause() {
          if (!originalBuffer || busy) return;
          if (playing) { stopPlayback(true); updatePlayUI(); return; }
          if (mode === 'changed') renderProcessedAsync(function () { startPlayback(); });
          else startPlayback();
        }
        function switchMode(newMode) {
          if (mode === newMode) return;
          var wasPlaying = playing;
          var offset = startOffset;
          if (playing && audioCtx) offset += audioCtx.currentTime - startedAt;
          stopPlayback(false);
          mode = newMode;
          startOffset = offset;
          modeOriginalBtn.style.background = mode === 'original' ? 'var(--color-primary)' : 'transparent';
          modeOriginalBtn.style.color = mode === 'original' ? 'var(--color-primary-on)' : 'inherit';
          modeChangedBtn.style.background = mode === 'changed' ? 'var(--color-primary)' : 'transparent';
          modeChangedBtn.style.color = mode === 'changed' ? 'var(--color-primary-on)' : 'inherit';
          updatePlayUI();
          if (wasPlaying) {
            if (mode === 'changed') renderProcessedAsync(function () { startPlayback(); });
            else startPlayback();
          }
        }

        // ---- File handling ----
        function handleFile(file) {
          if (!file) return;
          var name = file.name || 'audio';
          var lower = name.toLowerCase();
          var looksAudio = /\.(mp3|wav|ogg|oga|m4a|aac|webm|flac)$/.test(lower) || (file.type || '').indexOf('audio') === 0;
          if (!looksAudio) { setStatus('That file does not look like audio. Please choose an MP3, WAV, OGG or M4A file.', true); return; }
          if (file.size > 50 * 1024 * 1024) { setStatus('That file is over 50 MB. Please choose a smaller clip.', true); return; }
          originalName = name.replace(/\.[^.]+$/, '') || 'audio';
          setStatus('Loading ' + name + ' ...');
          ensureCtx();
          var reader = new FileReader();
          reader.onload = function () {
            audioCtx.decodeAudioData(reader.result, function (buf) {
              if (buf.duration > MAX_SECONDS) {
                setStatus('This clip is ' + fmtTime(buf.duration) + ' long. The pitch changer works with clips up to 3 minutes — please trim it and try again.', true);
                return;
              }
              stopPlayback(false);
              startOffset = 0;
              originalBuffer = buf;
              processedBuffer = null;
              processedKey = '';
              fileInfo.textContent = name + ' — ' + fmtTime(buf.duration) + ' — ' + (Math.round(buf.sampleRate / 100) / 10) + ' kHz';
              controls.style.display = 'block';
              setStatus('File loaded. Move the pitch slider, then press Play to hear the changed voice.');
              updateReadout();
              updatePlayUI();
            }, function () {
              setStatus('This browser could not decode that audio file. Try an MP3 or WAV export instead.', true);
            });
          };
          reader.onerror = function () { setStatus('Could not read that file. Please try again.', true); };
          reader.readAsArrayBuffer(file);
        }

        // ---- Events ----
        dropzone.addEventListener('click', function () { fileInput.click(); });
        dropzone.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInput.click(); } });
        dropzone.addEventListener('dragover', function (e) { e.preventDefault(); dropzone.classList.add('vpc-drag'); });
        dropzone.addEventListener('dragleave', function () { dropzone.classList.remove('vpc-drag'); });
        dropzone.addEventListener('drop', function (e) {
          e.preventDefault();
          dropzone.classList.remove('vpc-drag');
          if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
        });
        window.addEventListener('dragover', function (e) { e.preventDefault(); });
        window.addEventListener('drop', function (e) { e.preventDefault(); });
        fileInput.addEventListener('change', function () {
          if (fileInput.files && fileInput.files[0]) handleFile(fileInput.files[0]);
          fileInput.value = '';
        });

        function onParamsChanged() {
          if (playing) { stopPlayback(true); updatePlayUI(); }
          updateReadout();
        }
        slider.addEventListener('input', onParamsChanged);
        centsRange.addEventListener('input', function () { centsInput.value = centsRange.value; onParamsChanged(); });
        centsInput.addEventListener('input', function () { centsRange.value = clampCents(centsInput.value); onParamsChanged(); });
        chips.addEventListener('click', function (e) {
          var t = e.target;
          if (t && t.getAttribute('data-semi') !== null) {
            slider.value = t.getAttribute('data-semi');
            onParamsChanged();
          }
        });

        modeOriginalBtn.addEventListener('click', function () { switchMode('original'); });
        modeChangedBtn.addEventListener('click', function () { switchMode('changed'); });
        playBtn.addEventListener('click', playPause);
        progressBar.addEventListener('click', function (e) {
          var buf = activeBuffer();
          if (!buf) return;
          var rect = progressBar.getBoundingClientRect();
          var ratio = (e.clientX - rect.left) / rect.width;
          if (ratio < 0) ratio = 0;
          if (ratio > 1) ratio = 1;
          var wasPlaying = playing;
          stopPlayback(false);
          startOffset = ratio * buf.duration;
          updatePlayUI();
          if (wasPlaying) startPlayback();
        });
        downloadBtn.addEventListener('click', function () {
          if (!originalBuffer || busy) return;
          ensureCtx();
          renderProcessedAsync(function (buf) {
            var blob = bufferToWavBlob(buf);
            var url = URL.createObjectURL(blob);
            var a = document.createElement('a');
            var semis = currentSemis();
            a.href = url;
            a.download = originalName + '-pitch' + (semis > 0 ? '+' : '') + semis + 'st.wav';
            document.body.appendChild(a);
            a.click();
            setTimeout(function () { URL.revokeObjectURL(url); if (a.parentNode) a.parentNode.removeChild(a); }, 600);
            setStatus('Downloaded. Your original file was never uploaded anywhere.');
          });
        });

        updateReadout();
      })();
      </script>
    `
  }
  ,
  "youtube-transcript-generator": {
    "title": "YouTube Transcript Generator - Get Any Video Transcript Free | TextToSpeechH AI",
    "h1": "YouTube Transcript Generator",
    "metaDesc": "Get the full transcript of any YouTube video for free. Paste a link, get the complete text with timestamps, copy it or download it as a file. No sign-up, no limits.",
    "category": "Video Tools",
    "standaloneTool": true,
    "tagline": "Paste any YouTube link and get the video's full text in seconds. Free, no sign-up, with timestamps.",
    "readingTime": "5 min read",
    "faqs": [
      { "q": "Is this YouTube transcript generator really free?", "a": "Yes. It is completely free with no sign-up and no daily limit. Paste a link, get the transcript, copy it or download it as a text file." },
      { "q": "Which videos can I get a transcript for?", "a": "Any public YouTube video that has subtitles or captions - either uploaded by the creator or auto-generated by YouTube. If a video shows a CC button on YouTube, this tool can fetch its transcript." },
      { "q": "The video has no subtitles. Can you still make a transcript?", "a": "No - and no transcript tool can. Without captions there is no text stored with the video; creating one would need speech-recognition processing of the audio itself. If the video has no CC button on YouTube, it has no transcript to fetch." },
      { "q": "Do I get timestamps with the transcript?", "a": "Yes. Every line comes with the time it is spoken in the video. You can switch timestamps off with one checkbox before copying or downloading." },
      { "q": "Which languages are supported?", "a": "Whichever languages the video's captions exist in. The tool prefers English captions and otherwise uses the first available language, and it tells you which language and type (creator subtitles or auto-generated) you got." },
      { "q": "Can I use a transcript to make a voiceover?", "a": "Yes - that is exactly what many visitors do: fetch the transcript, clean it up, and paste it into our free text to speech generator to create a fresh voiceover. Only do this with your own videos or content you have permission to reuse; a transcript belongs to the video's creator." }
    ],
    "content": `
      <div id="ytg-tool" style="background:var(--color-surface); border:1px solid var(--color-border); padding:28px; border-radius:16px; margin-bottom:34px; box-shadow:var(--shadow-lg);">
        <label for="ytg-url" style="display:block; font-weight:700; font-size:1.05rem; margin-bottom:12px;">Paste a YouTube video link</label>
        <div style="display:flex; gap:10px; flex-wrap:wrap;">
          <input type="text" id="ytg-url" placeholder="https://www.youtube.com/watch?v=..." style="flex:1; min-width:240px; padding:14px 16px; border:1px solid var(--color-border-strong); border-radius:10px; background:var(--color-bg); color:inherit; font-size:1rem;">
          <button type="button" id="ytg-btn" style="background:var(--color-primary); color:var(--color-primary-on); border:0; padding:14px 30px; border-radius:10px; font-weight:700; font-size:1rem; cursor:pointer;">Get Transcript</button>
        </div>
        <p style="margin:12px 0 0; font-size:0.85rem; color:var(--color-text-muted);">Works with youtube.com and youtu.be links, Shorts links, or a bare video ID. The video must have subtitles (a CC button on YouTube).</p>
        <p id="ytg-status" style="margin:14px 0 0; font-size:0.95rem; color:var(--color-text-muted);">No video loaded yet. Paste a link to get started.</p>

        <div id="ytg-result" style="display:none; margin-top:22px;">
          <h3 id="ytg-title" style="margin:0 0 4px; font-size:1.12rem;"></h3>
          <p id="ytg-meta" style="margin:0 0 14px; font-size:0.88rem; color:var(--color-text-muted);"></p>
          <div style="display:flex; gap:10px; flex-wrap:wrap; align-items:center; margin-bottom:14px;">
            <button type="button" id="ytg-copy" style="padding:10px 20px; border-radius:8px; border:0; background:var(--color-primary); color:var(--color-primary-on); font-weight:600; cursor:pointer;">Copy Transcript</button>
            <button type="button" id="ytg-download" style="padding:10px 20px; border-radius:8px; border:1px solid var(--color-primary); background:var(--color-primary-soft); color:var(--color-primary); font-weight:600; cursor:pointer;">Download (.txt)</button>
            <label style="display:inline-flex; gap:7px; align-items:center; font-size:0.92rem; cursor:pointer;">
              <input type="checkbox" id="ytg-ts" checked> Include timestamps
            </label>
          </div>
          <div id="ytg-box" style="max-height:430px; overflow:auto; background:var(--color-bg); border:1px solid var(--color-border); border-radius:10px; padding:18px; line-height:1.75; font-size:0.95rem;"></div>
          <p style="margin:14px 0 0; font-size:0.92rem;">Want this as a voiceover? Paste the text into our <a href="/">free text to speech generator</a> and download it as audio.</p>
        </div>
      </div>

      <div style="display:grid; grid-template-columns:repeat(auto-fit,minmax(180px,1fr)); gap:14px; margin-bottom:30px;">
        <div style="background:var(--color-surface); border:1px solid var(--color-border); border-radius:12px; padding:18px; text-align:center;">
          <p style="margin:0 0 6px; font-size:1.5rem;">&#128176;</p>
          <p style="margin:0 0 4px; font-weight:700;">100% Free</p>
          <p style="margin:0; font-size:0.88rem; color:var(--color-text-muted); line-height:1.55;">No sign-up, no daily cap, no watermark on your download.</p>
        </div>
        <div style="background:var(--color-surface); border:1px solid var(--color-border); border-radius:12px; padding:18px; text-align:center;">
          <p style="margin:0 0 6px; font-size:1.5rem;">&#9201;</p>
          <p style="margin:0 0 4px; font-weight:700;">With Timestamps</p>
          <p style="margin:0; font-size:0.88rem; color:var(--color-text-muted); line-height:1.55;">Every line shows when it is spoken. Switch them off anytime.</p>
        </div>
        <div style="background:var(--color-surface); border:1px solid var(--color-border); border-radius:12px; padding:18px; text-align:center;">
          <p style="margin:0 0 6px; font-size:1.5rem;">&#128229;</p>
          <p style="margin:0 0 4px; font-weight:700;">Copy or Download</p>
          <p style="margin:0; font-size:0.88rem; color:var(--color-text-muted); line-height:1.55;">One click to copy, or save the whole transcript as a .txt file.</p>
        </div>
        <div style="background:var(--color-surface); border:1px solid var(--color-border); border-radius:12px; padding:18px; text-align:center;">
          <p style="margin:0 0 6px; font-size:1.5rem;">&#127760;</p>
          <p style="margin:0 0 4px; font-weight:700;">Any Caption Language</p>
          <p style="margin:0; font-size:0.88rem; color:var(--color-text-muted); line-height:1.55;">English is preferred automatically; other caption languages work too.</p>
        </div>
      </div>

      <h2>What is a YouTube Transcript Generator?</h2>
      <p style="line-height:1.75; margin-bottom:24px;">
        A <strong>YouTube transcript generator</strong> pulls the written text of a video's subtitles into a clean, readable transcript. Paste the video link above and you get every spoken line in order, with the time it was spoken - ready to read, quote, study, translate, or turn into fresh content. Nothing is uploaded and nothing is stored: the tool fetches the caption text YouTube already holds for that video and hands it to you.
      </p>

      <h2>How to Get a YouTube Transcript</h2>
      <ol style="line-height:1.8; margin-bottom:24px; padding-left:20px;">
        <li><strong>Copy the video link.</strong> On YouTube, open the video and copy its address - a watch link, a youtu.be short link, a Shorts link, or just the video ID all work.</li>
        <li><strong>Paste it above and press Get Transcript.</strong> The tool finds the video's subtitles and builds the transcript, usually in a few seconds.</li>
        <li><strong>Copy it or download it.</strong> Keep timestamps on if you need to jump back to exact moments, or switch them off for a clean reading copy.</li>
      </ol>

      <h2>Turn a Transcript Into a Voiceover</h2>
      <p style="line-height:1.75;">
        This is the workflow our YouTube visitors use most: take one of <strong>your own</strong> videos, fetch its transcript here, clean up the wording, and paste it into the <a href="/">free text to speech generator</a> to record a fresh, clear voiceover without a microphone. Re-voicing an old video in a new language, fixing a badly recorded narration, or making a Shorts version of a long video all start with the transcript. Changing the pitch of an existing recording instead? That is what the <a href="/voice-pitch-changer">Voice Pitch Changer</a> is for.
      </p>

      <h2>Honest Limits</h2>
      <ul style="line-height:1.8; margin-bottom:24px; padding-left:20px;">
        <li><strong>Captions must exist.</strong> If a video has no subtitles (no CC button on YouTube), there is no transcript stored anywhere to fetch - for that video, nobody can generate one from the link alone.</li>
        <li><strong>Auto-generated captions can have mistakes.</strong> YouTube's automatic subtitles sometimes mishear names and fast speech. Creator-uploaded subtitles are the cleanest.</li>
        <li><strong>The words belong to the creator.</strong> Use transcripts of your own videos freely. For other people's videos, study notes and personal use are fine; republishing or selling their words needs their permission.</li>
      </ul>

      <h2>More Free Tools</h2>
      <div style="display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:14px; margin-bottom:30px;">
        <a href="/tools" style="display:block; background:var(--color-surface); border:1px solid var(--color-border); border-radius:12px; padding:18px; text-decoration:none; color:inherit;">
          <p style="margin:0 0 4px; font-weight:700; color:var(--color-primary);">All Free Tools</p>
          <p style="margin:0; font-size:0.88rem; color:var(--color-text-muted); line-height:1.55;">Browse every free tool on TextToSpeechH AI in one place.</p>
        </a>
        <a href="/voice-pitch-changer" style="display:block; background:var(--color-surface); border:1px solid var(--color-border); border-radius:12px; padding:18px; text-decoration:none; color:inherit;">
          <p style="margin:0 0 4px; font-weight:700; color:var(--color-primary);">Voice Pitch Changer</p>
          <p style="margin:0; font-size:0.88rem; color:var(--color-text-muted); line-height:1.55;">Make any voice recording deeper or higher, without changing its speed.</p>
        </a>
        <a href="/" style="display:block; background:var(--color-surface); border:1px solid var(--color-border); border-radius:12px; padding:18px; text-decoration:none; color:inherit;">
          <p style="margin:0 0 4px; font-weight:700; color:var(--color-primary);">Text to Speech Generator</p>
          <p style="margin:0; font-size:0.88rem; color:var(--color-text-muted); line-height:1.55;">Turn typed text into natural AI voiceovers, free.</p>
        </a>
      </div>

      <h2>Frequently Asked Questions</h2>
      <div class="faq-accordion" style="display:flex; flex-direction:column; gap:16px; margin-top:20px;">
        <div style="background:var(--color-bg-secondary); border:1px solid var(--color-border); padding:18px; border-radius:10px;">
          <h4 style="margin-top:0; color:var(--color-primary);">Is this YouTube transcript generator really free?</h4>
          <p style="margin:0; font-size:0.92rem; line-height:1.6;">Yes. It is completely free with no sign-up and no daily limit. Paste a link, get the transcript, copy it or download it as a text file.</p>
        </div>
        <div style="background:var(--color-bg-secondary); border:1px solid var(--color-border); padding:18px; border-radius:10px;">
          <h4 style="margin-top:0; color:var(--color-primary);">Which videos can I get a transcript for?</h4>
          <p style="margin:0; font-size:0.92rem; line-height:1.6;">Any public YouTube video that has subtitles or captions - either uploaded by the creator or auto-generated by YouTube. If a video shows a CC button on YouTube, this tool can fetch its transcript.</p>
        </div>
        <div style="background:var(--color-bg-secondary); border:1px solid var(--color-border); padding:18px; border-radius:10px;">
          <h4 style="margin-top:0; color:var(--color-primary);">The video has no subtitles. Can you still make a transcript?</h4>
          <p style="margin:0; font-size:0.92rem; line-height:1.6;">No - and no transcript tool can. Without captions there is no text stored with the video; creating one would need speech-recognition processing of the audio itself. If the video has no CC button on YouTube, it has no transcript to fetch.</p>
        </div>
        <div style="background:var(--color-bg-secondary); border:1px solid var(--color-border); padding:18px; border-radius:10px;">
          <h4 style="margin-top:0; color:var(--color-primary);">Do I get timestamps with the transcript?</h4>
          <p style="margin:0; font-size:0.92rem; line-height:1.6;">Yes. Every line comes with the time it is spoken in the video. You can switch timestamps off with one checkbox before copying or downloading.</p>
        </div>
        <div style="background:var(--color-bg-secondary); border:1px solid var(--color-border); padding:18px; border-radius:10px;">
          <h4 style="margin-top:0; color:var(--color-primary);">Which languages are supported?</h4>
          <p style="margin:0; font-size:0.92rem; line-height:1.6;">Whichever languages the video's captions exist in. The tool prefers English captions and otherwise uses the first available language, and it tells you which language and type (creator subtitles or auto-generated) you got.</p>
        </div>
        <div style="background:var(--color-bg-secondary); border:1px solid var(--color-border); padding:18px; border-radius:10px;">
          <h4 style="margin-top:0; color:var(--color-primary);">Can I use a transcript to make a voiceover?</h4>
          <p style="margin:0; font-size:0.92rem; line-height:1.6;">Yes - that is exactly what many visitors do: fetch the transcript, clean it up, and paste it into our free text to speech generator to create a fresh voiceover. Only do this with your own videos or content you have permission to reuse; a transcript belongs to the video's creator.</p>
        </div>
      </div>

      <script>
      (function () {
        var input = document.getElementById('ytg-url');
        var btn = document.getElementById('ytg-btn');
        var statusEl = document.getElementById('ytg-status');
        var result = document.getElementById('ytg-result');
        var titleEl = document.getElementById('ytg-title');
        var metaEl = document.getElementById('ytg-meta');
        var box = document.getElementById('ytg-box');
        var copyBtn = document.getElementById('ytg-copy');
        var dlBtn = document.getElementById('ytg-download');
        var tsCheck = document.getElementById('ytg-ts');
        var current = null;

        function fmt(sec) {
          sec = Math.max(0, Math.floor(sec || 0));
          var h = Math.floor(sec / 3600);
          var m = Math.floor((sec % 3600) / 60);
          var s = sec % 60;
          var mm = h > 0 && m < 10 ? '0' + m : '' + m;
          var ss = s < 10 ? '0' + s : '' + s;
          return (h > 0 ? h + ':' : '') + mm + ':' + ss;
        }
        function setStatus(msg, isError) {
          statusEl.textContent = msg;
          statusEl.style.color = isError ? 'var(--color-error-text)' : 'var(--color-text-muted)';
        }
        function buildText(withTs) {
          if (!current) return '';
          var lines = [];
          for (var i = 0; i < current.segments.length; i++) {
            var seg = current.segments[i];
            lines.push(withTs ? '[' + fmt(seg.start) + '] ' + seg.text : seg.text);
          }
          return lines.join(withTs ? String.fromCharCode(10) : ' ');
        }
        function render() {
          if (!current) return;
          box.innerHTML = '';
          var withTs = tsCheck.checked;
          for (var i = 0; i < current.segments.length; i++) {
            var seg = current.segments[i];
            var row = document.createElement('div');
            if (withTs) {
              var t = document.createElement('span');
              t.textContent = '[' + fmt(seg.start) + '] ';
              t.style.color = 'var(--color-primary)';
              t.style.fontWeight = '600';
              row.appendChild(t);
            }
            row.appendChild(document.createTextNode(seg.text));
            box.appendChild(row);
          }
        }
        function fetchTranscript() {
          var val = (input.value || '').trim();
          if (!val) { setStatus('Paste a YouTube link first.', true); input.focus(); return; }
          btn.disabled = true;
          btn.textContent = 'Fetching...';
          result.style.display = 'none';
          setStatus('Fetching the transcript - a few seconds...');
          fetch('/api/transcript?url=' + encodeURIComponent(val))
            .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
            .then(function (out) {
              btn.disabled = false;
              btn.textContent = 'Get Transcript';
              if (!out.ok || !out.j.success) {
                setStatus((out.j && out.j.error) || 'Something went wrong. Please try again.', true);
                return;
              }
              current = out.j;
              titleEl.textContent = current.title || 'Video transcript';
              metaEl.textContent = 'Language: ' + (current.language || 'unknown') + ' - ' + current.kind + ' - ' + current.segmentCount + ' lines';
              result.style.display = 'block';
              render();
              setStatus('Done. Copy it, download it, or turn it into a voiceover below.');
            })
            .catch(function () {
              btn.disabled = false;
              btn.textContent = 'Get Transcript';
              setStatus('Could not reach the transcript service. Check your connection and try again.', true);
            });
        }
        btn.addEventListener('click', fetchTranscript);
        input.addEventListener('keydown', function (e) { if (e.key === 'Enter') fetchTranscript(); });
        tsCheck.addEventListener('change', render);
        copyBtn.addEventListener('click', function () {
          if (!current) return;
          var text = buildText(tsCheck.checked);
          function done() { copyBtn.textContent = 'Copied!'; setTimeout(function () { copyBtn.textContent = 'Copy Transcript'; }, 1600); }
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(done).catch(function () { fallback(); });
          } else fallback();
          function fallback() {
            var ta = document.createElement('textarea');
            ta.value = text;
            document.body.appendChild(ta);
            ta.select();
            try { document.execCommand('copy'); done(); } catch (e) {}
            document.body.removeChild(ta);
          }
        });
        dlBtn.addEventListener('click', function () {
          if (!current) return;
          var blob = new Blob([buildText(tsCheck.checked)], { type: 'text/plain' });
          var url = URL.createObjectURL(blob);
          var a = document.createElement('a');
          a.href = url;
          a.download = 'transcript-' + current.videoId + '.txt';
          document.body.appendChild(a);
          a.click();
          setTimeout(function () { URL.revokeObjectURL(url); if (a.parentNode) a.parentNode.removeChild(a); }, 600);
        });
      })();
      </script>
    `
  }

  ,
  "image-compressor": {
    "title": "Image Compressor - Compress Image to 20 KB, 50 KB, 100 KB Online Free | TextToSpeechH AI",
    "h1": "Image Compressor",
    "metaDesc": "Compress an image to an exact size in KB - 20 KB, 50 KB, 100 KB or any size you choose. Built for online application forms, 100% private: your photo never leaves your device.",
    "category": "Image Tools",
    "standaloneTool": true,
    "tagline": "Shrink any photo to the exact KB size your form demands. Free, private, no sign-up - the image never leaves your device.",
    "readingTime": "5 min read",
    "faqs": [
      { "q": "How do I compress an image to exactly 50 KB or 20 KB?", "a": "Choose the Target size mode, type 50 (or tap a preset like 20 KB, 50 KB, 100 KB), add your photo and press Compress. The tool automatically finds the highest quality that keeps the file at or below your target size, shrinking the dimensions only if quality alone is not enough." },
      { "q": "Why do online forms reject my photo?", "a": "Most application forms - exams, government jobs, bank and university admissions - accept photos only inside a fixed size range, often between 20 KB and 50 KB for a photo and a similar range for a signature. A phone photo is usually 2-5 MB, far above the limit. Compressing it to the exact KB size the form asks for fixes the rejection." },
      { "q": "Is my photo uploaded to a server?", "a": "No. Compression happens entirely inside your browser with built-in technology. Your image is never uploaded, never stored and never seen by us or anyone else - you can even disconnect from the internet after the page loads and it still works." },
      { "q": "Will my photo lose quality?", "a": "A smaller file always trades a little quality - that is honest physics, not a trick. The tool protects quality as much as possible: it lowers quality only as far as your target size requires, and reduces dimensions only when there is no other way to reach a very small target. For form photos viewed at small sizes, the result looks the same." },
      { "q": "Which format should I choose for application forms?", "a": "JPEG. Almost every form accepts it, it compresses photos the best, and transparent areas are placed on a clean white background automatically. WebP gives slightly smaller files but some older form portals do not accept it. PNG is best kept for logos and graphics, not photos." },
      { "q": "Can I compress many images at once?", "a": "This version compresses one image at a time, carefully, so the exact-size result is reliable. That covers the normal case - one photo and one signature per form. A batch mode is planned." }
    ],
    "content": `
      <div id="ic-tool" style="background:var(--color-surface); border:1px solid var(--color-border); padding:28px; border-radius:16px; margin-bottom:34px; box-shadow:var(--shadow-lg);">
        <div id="ic-drop" style="border:2px dashed var(--color-border-strong); border-radius:14px; padding:48px 24px; text-align:center; cursor:pointer; background:var(--color-primary-soft);">
          <div style="width:84px; height:84px; margin:0 auto 20px; border-radius:50%; background:var(--color-surface); display:flex; align-items:center; justify-content:center; box-shadow:var(--shadow-lg);">
            <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2.5"/><circle cx="9" cy="10" r="1.6"/><path d="M4.5 18.5l4.5-4.5 3 3 3.5-3.5 4 4"/></svg>
          </div>
          <span style="display:inline-block; background:var(--color-primary); color:var(--color-primary-on); padding:14px 38px; border-radius:10px; font-weight:700; font-size:1.05rem;">Select Image</span>
          <p style="margin:16px 0 0; color:var(--color-text-muted); font-size:0.95rem;">or drop an image here</p>
          <p style="margin:6px 0 0; font-size:0.82rem; color:var(--color-text-muted);">JPG, PNG or WebP - your image never leaves this device. Nothing is uploaded.</p>
        </div>
        <input type="file" id="ic-file" accept="image/jpeg,image/png,image/webp" style="display:none;">

        <div id="ic-work" style="display:none; margin-top:22px;">
          <p id="ic-fileinfo" style="margin:0 0 16px; font-size:0.95rem;"></p>

          <p style="margin:0 0 8px; font-weight:700;">How should it shrink?</p>
          <div style="display:flex; gap:10px; flex-wrap:wrap; margin-bottom:16px;">
            <label style="display:inline-flex; gap:7px; align-items:center; border:1px solid var(--color-border-strong); border-radius:10px; padding:9px 16px; cursor:pointer;">
              <input type="radio" name="ic-mode" id="ic-mode-target" checked> Target size (KB)
            </label>
            <label style="display:inline-flex; gap:7px; align-items:center; border:1px solid var(--color-border-strong); border-radius:10px; padding:9px 16px; cursor:pointer;">
              <input type="radio" name="ic-mode" id="ic-mode-quality"> Quality slider
            </label>
          </div>

          <div id="ic-target-group">
            <div style="display:flex; gap:8px; flex-wrap:wrap; align-items:center; margin-bottom:8px;">
              <button type="button" class="ic-chip" data-kb="20" style="padding:8px 16px; border-radius:8px; border:1px solid var(--color-border-strong); background:var(--color-bg); cursor:pointer; font-weight:600;">20 KB</button>
              <button type="button" class="ic-chip" data-kb="50" style="padding:8px 16px; border-radius:8px; border:1px solid var(--color-border-strong); background:var(--color-bg); cursor:pointer; font-weight:600;">50 KB</button>
              <button type="button" class="ic-chip" data-kb="100" style="padding:8px 16px; border-radius:8px; border:1px solid var(--color-border-strong); background:var(--color-bg); cursor:pointer; font-weight:600;">100 KB</button>
              <button type="button" class="ic-chip" data-kb="200" style="padding:8px 16px; border-radius:8px; border:1px solid var(--color-border-strong); background:var(--color-bg); cursor:pointer; font-weight:600;">200 KB</button>
              <button type="button" class="ic-chip" data-kb="500" style="padding:8px 16px; border-radius:8px; border:1px solid var(--color-border-strong); background:var(--color-bg); cursor:pointer; font-weight:600;">500 KB</button>
              <span style="display:inline-flex; align-items:center; gap:6px;">
                <input type="number" id="ic-kb" value="100" min="5" max="5000" style="width:90px; padding:9px 10px; border:1px solid var(--color-border-strong); border-radius:8px; background:var(--color-bg); color:inherit; font-size:1rem;"> KB
              </span>
            </div>
            <p style="margin:0 0 16px; font-size:0.85rem; color:var(--color-text-muted);">The result will be at or below this size, at the best quality that fits.</p>
          </div>

          <div id="ic-quality-group" style="display:none;">
            <label for="ic-quality" style="display:block; margin-bottom:6px;">Quality: <strong><span id="ic-quality-val">80</span>%</strong> <span style="color:var(--color-text-muted); font-size:0.85rem;">(lower = smaller file)</span></label>
            <input type="range" id="ic-quality" min="10" max="95" value="80" style="width:100%; margin-bottom:16px;">
          </div>

          <div style="display:flex; gap:12px; flex-wrap:wrap; align-items:center; margin-bottom:6px;">
            <label>Format:
              <select id="ic-format" style="padding:9px 12px; border:1px solid var(--color-border-strong); border-radius:8px; background:var(--color-bg); color:inherit;">
                <option value="image/jpeg" selected>JPEG (best for forms)</option>
                <option value="image/webp">WebP (smallest)</option>
                <option value="image/png">PNG (graphics)</option>
              </select>
            </label>
            <button type="button" id="ic-go" style="background:var(--color-primary); color:var(--color-primary-on); border:0; padding:12px 30px; border-radius:10px; font-weight:700; font-size:1rem; cursor:pointer;">Compress Image</button>
          </div>
          <p id="ic-status" style="margin:12px 0 0; font-size:0.95rem; color:var(--color-text-muted);">Photo ready. Choose a size and press Compress.</p>

          <div id="ic-result" style="display:none; margin-top:18px; border-top:1px solid var(--color-border); padding-top:18px;">
            <p id="ic-result-line" style="margin:0 0 6px; font-size:1.05rem; font-weight:700;"></p>
            <p id="ic-result-note" style="margin:0 0 14px; font-size:0.88rem; color:var(--color-text-muted);"></p>
            <img id="ic-preview" alt="Compressed image preview" style="max-width:100%; max-height:340px; border-radius:10px; border:1px solid var(--color-border); display:block; margin-bottom:16px;">
            <div style="display:flex; gap:10px; flex-wrap:wrap;">
              <a id="ic-download" href="#" download="compressed-image.jpg" style="display:inline-block; background:var(--color-primary); color:var(--color-primary-on); padding:12px 28px; border-radius:10px; font-weight:700; text-decoration:none;">Download Compressed Image</a>
              <button type="button" id="ic-again" style="padding:12px 22px; border-radius:10px; border:1px solid var(--color-primary); background:var(--color-primary-soft); color:var(--color-primary); font-weight:600; cursor:pointer;">Compress Another</button>
            </div>
          </div>
        </div>
      </div>

      <div style="display:grid; grid-template-columns:repeat(auto-fit,minmax(180px,1fr)); gap:14px; margin-bottom:30px;">
        <div style="background:var(--color-surface); border:1px solid var(--color-border); border-radius:12px; padding:18px; text-align:center;">
          <p style="margin:0 0 6px; font-size:1.5rem;">&#127919;</p>
          <p style="margin:0 0 4px; font-weight:700;">Exact KB Size</p>
          <p style="margin:0; font-size:0.88rem; color:var(--color-text-muted); line-height:1.55;">Type 20, 50 or 100 KB - the file lands at or below it, guaranteed logic, no guessing.</p>
        </div>
        <div style="background:var(--color-surface); border:1px solid var(--color-border); border-radius:12px; padding:18px; text-align:center;">
          <p style="margin:0 0 6px; font-size:1.5rem;">&#128274;</p>
          <p style="margin:0 0 4px; font-weight:700;">100% Private</p>
          <p style="margin:0; font-size:0.88rem; color:var(--color-text-muted); line-height:1.55;">Runs entirely in your browser. Your photo is never uploaded anywhere.</p>
        </div>
        <div style="background:var(--color-surface); border:1px solid var(--color-border); border-radius:12px; padding:18px; text-align:center;">
          <p style="margin:0 0 6px; font-size:1.5rem;">&#128221;</p>
          <p style="margin:0 0 4px; font-weight:700;">Built for Forms</p>
          <p style="margin:0; font-size:0.88rem; color:var(--color-text-muted); line-height:1.55;">Made for exam, job, bank and admission forms that demand an exact photo size.</p>
        </div>
        <div style="background:var(--color-surface); border:1px solid var(--color-border); border-radius:12px; padding:18px; text-align:center;">
          <p style="margin:0 0 6px; font-size:1.5rem;">&#128176;</p>
          <p style="margin:0 0 4px; font-weight:700;">Free, No Sign-Up</p>
          <p style="margin:0; font-size:0.88rem; color:var(--color-text-muted); line-height:1.55;">No account, no watermark, no daily limit. Just compress and download.</p>
        </div>
      </div>

      <h2>Why Forms Demand an Exact Image Size</h2>
      <p style="line-height:1.75; margin-bottom:24px;">
        If you have ever filled an online application in India - an SSC, UPSC, banking, railway or university form - you know the moment: the portal rejects your photo because it must be <strong>between 20 KB and 50 KB</strong>, and your phone's photo is 3 MB. This <strong>image compressor</strong> exists for exactly that moment. Instead of guessing with a quality slider and checking the file size again and again, you type the size the form demands and the tool does the trial-and-error for you - finding the best quality that still fits under your limit.
      </p>

      <h2>How to Compress an Image to an Exact KB Size</h2>
      <ol style="line-height:1.8; margin-bottom:24px; padding-left:20px;">
        <li><strong>Add your photo.</strong> Tap Select Image or drag the file in. JPG, PNG and WebP all work.</li>
        <li><strong>Pick the size your form asks for.</strong> Tap a preset - 20 KB, 50 KB, 100 KB - or type any size. For most form photos, JPEG is the right format.</li>
        <li><strong>Press Compress and download.</strong> The result shows the new size before you save it, so you know the form will accept it.</li>
      </ol>

      <h2>Honest Limits</h2>
      <ul style="line-height:1.8; margin-bottom:24px; padding-left:20px;">
        <li><strong>Very small targets cost quality.</strong> Squeezing a big photo under 20 KB means lower quality and sometimes smaller dimensions. The tool always chooses the gentlest path, and it tells you the final dimensions honestly in the result.</li>
        <li><strong>PNG photos barely shrink.</strong> PNG is a lossless format made for graphics. For a photo, JPEG or WebP will always reach a small KB size better - the tool will warn you if PNG cannot reach your target.</li>
        <li><strong>One image at a time.</strong> This version does one photo carefully instead of many carelessly - which is what a form submission needs.</li>
      </ul>

      <h2>More Free Tools</h2>
      <div style="display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:14px; margin-bottom:30px;">
        <a href="/tools" style="display:block; background:var(--color-surface); border:1px solid var(--color-border); border-radius:12px; padding:18px; text-decoration:none; color:inherit;">
          <p style="margin:0 0 4px; font-weight:700; color:var(--color-primary);">All Free Tools</p>
          <p style="margin:0; font-size:0.88rem; color:var(--color-text-muted); line-height:1.55;">Browse every free tool on TextToSpeechH AI in one place.</p>
        </a>
        <a href="/youtube-transcript-generator" style="display:block; background:var(--color-surface); border:1px solid var(--color-border); border-radius:12px; padding:18px; text-decoration:none; color:inherit;">
          <p style="margin:0 0 4px; font-weight:700; color:var(--color-primary);">YouTube Transcript Generator</p>
          <p style="margin:0; font-size:0.88rem; color:var(--color-text-muted); line-height:1.55;">Get the full text of any YouTube video, with timestamps.</p>
        </a>
        <a href="/voice-pitch-changer" style="display:block; background:var(--color-surface); border:1px solid var(--color-border); border-radius:12px; padding:18px; text-decoration:none; color:inherit;">
          <p style="margin:0 0 4px; font-weight:700; color:var(--color-primary);">Voice Pitch Changer</p>
          <p style="margin:0; font-size:0.88rem; color:var(--color-text-muted); line-height:1.55;">Make any voice recording deeper or higher, without changing its speed.</p>
        </a>
      </div>

      <h2>Frequently Asked Questions</h2>
      <div class="faq-accordion" style="display:flex; flex-direction:column; gap:16px; margin-top:20px;">
        <div style="background:var(--color-bg-secondary); border:1px solid var(--color-border); padding:18px; border-radius:10px;">
          <h4 style="margin-top:0; color:var(--color-primary);">How do I compress an image to exactly 50 KB or 20 KB?</h4>
          <p style="margin:0; font-size:0.92rem; line-height:1.6;">Choose the Target size mode, type 50 (or tap a preset like 20 KB, 50 KB, 100 KB), add your photo and press Compress. The tool automatically finds the highest quality that keeps the file at or below your target size, shrinking the dimensions only if quality alone is not enough.</p>
        </div>
        <div style="background:var(--color-bg-secondary); border:1px solid var(--color-border); padding:18px; border-radius:10px;">
          <h4 style="margin-top:0; color:var(--color-primary);">Why do online forms reject my photo?</h4>
          <p style="margin:0; font-size:0.92rem; line-height:1.6;">Most application forms - exams, government jobs, bank and university admissions - accept photos only inside a fixed size range, often between 20 KB and 50 KB for a photo and a similar range for a signature. A phone photo is usually 2-5 MB, far above the limit. Compressing it to the exact KB size the form asks for fixes the rejection.</p>
        </div>
        <div style="background:var(--color-bg-secondary); border:1px solid var(--color-border); padding:18px; border-radius:10px;">
          <h4 style="margin-top:0; color:var(--color-primary);">Is my photo uploaded to a server?</h4>
          <p style="margin:0; font-size:0.92rem; line-height:1.6;">No. Compression happens entirely inside your browser with built-in technology. Your image is never uploaded, never stored and never seen by us or anyone else - you can even disconnect from the internet after the page loads and it still works.</p>
        </div>
        <div style="background:var(--color-bg-secondary); border:1px solid var(--color-border); padding:18px; border-radius:10px;">
          <h4 style="margin-top:0; color:var(--color-primary);">Will my photo lose quality?</h4>
          <p style="margin:0; font-size:0.92rem; line-height:1.6;">A smaller file always trades a little quality - that is honest physics, not a trick. The tool protects quality as much as possible: it lowers quality only as far as your target size requires, and reduces dimensions only when there is no other way to reach a very small target. For form photos viewed at small sizes, the result looks the same.</p>
        </div>
        <div style="background:var(--color-bg-secondary); border:1px solid var(--color-border); padding:18px; border-radius:10px;">
          <h4 style="margin-top:0; color:var(--color-primary);">Which format should I choose for application forms?</h4>
          <p style="margin:0; font-size:0.92rem; line-height:1.6;">JPEG. Almost every form accepts it, it compresses photos the best, and transparent areas are placed on a clean white background automatically. WebP gives slightly smaller files but some older form portals do not accept it. PNG is best kept for logos and graphics, not photos.</p>
        </div>
        <div style="background:var(--color-bg-secondary); border:1px solid var(--color-border); padding:18px; border-radius:10px;">
          <h4 style="margin-top:0; color:var(--color-primary);">Can I compress many images at once?</h4>
          <p style="margin:0; font-size:0.92rem; line-height:1.6;">This version compresses one image at a time, carefully, so the exact-size result is reliable. That covers the normal case - one photo and one signature per form. A batch mode is planned.</p>
        </div>
      </div>

      <script>
      (function () {
        var drop = document.getElementById('ic-drop');
        var fileInput = document.getElementById('ic-file');
        var work = document.getElementById('ic-work');
        var fileInfo = document.getElementById('ic-fileinfo');
        var modeTarget = document.getElementById('ic-mode-target');
        var modeQuality = document.getElementById('ic-mode-quality');
        var targetGroup = document.getElementById('ic-target-group');
        var qualityGroup = document.getElementById('ic-quality-group');
        var kbInput = document.getElementById('ic-kb');
        var qualityInput = document.getElementById('ic-quality');
        var qualityVal = document.getElementById('ic-quality-val');
        var formatSel = document.getElementById('ic-format');
        var goBtn = document.getElementById('ic-go');
        var statusEl = document.getElementById('ic-status');
        var result = document.getElementById('ic-result');
        var resultLine = document.getElementById('ic-result-line');
        var resultNote = document.getElementById('ic-result-note');
        var preview = document.getElementById('ic-preview');
        var dl = document.getElementById('ic-download');
        var againBtn = document.getElementById('ic-again');
        var chips = document.querySelectorAll('.ic-chip');

        var bitmap = null, natW = 0, natH = 0, curFile = null, outUrl = null;

        function fmtKB(bytes) {
          if (bytes < 1024) return bytes + ' B';
          var kb = bytes / 1024;
          if (kb < 100) return (Math.round(kb * 10) / 10) + ' KB';
          return Math.round(kb) + ' KB';
        }
        function setStatus(msg, isError) {
          statusEl.textContent = msg;
          statusEl.style.color = isError ? 'var(--color-error-text)' : 'var(--color-text-muted)';
        }
        function syncMode() {
          targetGroup.style.display = modeTarget.checked ? 'block' : 'none';
          qualityGroup.style.display = modeTarget.checked ? 'none' : 'block';
        }
        modeTarget.addEventListener('change', syncMode);
        modeQuality.addEventListener('change', syncMode);
        qualityInput.addEventListener('input', function () { qualityVal.textContent = qualityInput.value; });
        for (var c = 0; c < chips.length; c++) {
          chips[c].addEventListener('click', function () { kbInput.value = this.getAttribute('data-kb'); });
        }

        function loadFile(file) {
          if (!file) return;
          if (file.type.indexOf('image/') !== 0) { setStatus('That file is not an image. Choose a JPG, PNG or WebP photo.', true); return; }
          curFile = file;
          var url = URL.createObjectURL(file);
          var img = new Image();
          img.onload = function () {
            bitmap = img; natW = img.naturalWidth; natH = img.naturalHeight;
            fileInfo.innerHTML = '';
            var strong = document.createElement('strong');
            strong.textContent = file.name;
            fileInfo.appendChild(strong);
            fileInfo.appendChild(document.createTextNode(' - ' + fmtKB(file.size) + ' - ' + natW + ' x ' + natH + ' px'));
            work.style.display = 'block';
            result.style.display = 'none';
            setStatus('Photo ready. Choose a size and press Compress.');
          };
          img.onerror = function () { setStatus('This image could not be read. Try a different file.', true); };
          img.src = url;
        }
        drop.addEventListener('click', function () { fileInput.click(); });
        fileInput.addEventListener('change', function () { if (fileInput.files && fileInput.files[0]) loadFile(fileInput.files[0]); });
        drop.addEventListener('dragover', function (e) { e.preventDefault(); drop.style.borderColor = 'var(--color-primary)'; });
        drop.addEventListener('dragleave', function () { drop.style.borderColor = 'var(--color-border-strong)'; });
        drop.addEventListener('drop', function (e) {
          e.preventDefault(); drop.style.borderColor = 'var(--color-border-strong)';
          if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) loadFile(e.dataTransfer.files[0]);
        });

        function encode(w, h, type, q) {
          return new Promise(function (resolve) {
            var canvas = document.createElement('canvas');
            canvas.width = Math.max(1, Math.round(w));
            canvas.height = Math.max(1, Math.round(h));
            var ctx = canvas.getContext('2d');
            if (type === 'image/jpeg') { ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, canvas.width, canvas.height); }
            ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
            if (canvas.toBlob) {
              canvas.toBlob(function (blob) { resolve(blob); }, type, q);
            } else {
              var dataUrl = canvas.toDataURL(type, q);
              var parts = dataUrl.split(',');
              var bin = atob(parts[1]);
              var arr = new Uint8Array(bin.length);
              for (var i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
              resolve(new Blob([arr], { type: type }));
            }
          });
        }

        async function compressToTarget(type, targetBytes) {
          if (type === 'image/png') {
            var scales = [1, 0.85, 0.72, 0.6, 0.5, 0.42, 0.35, 0.28];
            var smallest = null;
            for (var i = 0; i < scales.length; i++) {
              var b = await encode(natW * scales[i], natH * scales[i], type, 1);
              if (!b) continue;
              if (!smallest || b.size < smallest.size) smallest = b;
              if (b.size <= targetBytes) return { blob: b, reached: true, scaled: scales[i] < 1 };
            }
            return { blob: smallest, reached: false, scaled: true };
          }
          var scale = 1, smallestBlob = null;
          for (var round = 0; round < 7; round++) {
            var w = natW * scale, h = natH * scale;
            var lo = 0.05, hi = 1.0, best = null;
            for (var step = 0; step < 7; step++) {
              var mid = (lo + hi) / 2;
              var blob = await encode(w, h, type, mid);
              if (!blob) break;
              if (!smallestBlob || blob.size < smallestBlob.size) smallestBlob = blob;
              if (blob.size <= targetBytes) { best = blob; lo = mid; } else { hi = mid; }
            }
            if (best) return { blob: best, reached: true, scaled: scale < 1 };
            scale = scale * 0.82;
          }
          return { blob: smallestBlob, reached: false, scaled: true };
        }

        goBtn.addEventListener('click', async function () {
          if (!bitmap || !curFile) { setStatus('Choose an image first.', true); return; }
          goBtn.disabled = true;
          goBtn.textContent = 'Compressing...';
          result.style.display = 'none';
          setStatus('Working - this happens on your device, give it a moment...');
          try {
            var type = formatSel.value;
            var out;
            if (modeTarget.checked) {
              var kb = parseFloat(kbInput.value);
              if (!kb || kb < 5) { setStatus('Type a target size of at least 5 KB.', true); goBtn.disabled = false; goBtn.textContent = 'Compress Image'; return; }
              out = await compressToTarget(type, Math.round(kb * 1024));
            } else {
              var q = parseInt(qualityInput.value, 10) / 100;
              var single = await encode(natW, natH, type, q);
              out = { blob: single, reached: true, scaled: false };
            }
            if (!out || !out.blob) { setStatus('Compression failed for this image. Try a different photo or format.', true); goBtn.disabled = false; goBtn.textContent = 'Compress Image'; return; }
            var finalBlob = out.blob, usedOriginal = false;
            if (finalBlob.size >= curFile.size && type === curFile.type) { finalBlob = curFile; usedOriginal = true; }
            if (outUrl) URL.revokeObjectURL(outUrl);
            outUrl = URL.createObjectURL(finalBlob);
            var ext = type === 'image/png' ? 'png' : (type === 'image/webp' ? 'webp' : 'jpg');
            var saved = Math.max(0, Math.round((1 - finalBlob.size / curFile.size) * 100));
            resultLine.textContent = fmtKB(curFile.size) + ' -> ' + fmtKB(finalBlob.size) + (usedOriginal ? '' : ' (' + saved + '% smaller)');
            var notes = [];
            if (usedOriginal) notes.push('Your original was already the smallest version - it is ready to download as-is.');
            if (!out.reached && !usedOriginal) notes.push('This was the smallest reachable size - an extremely small target also needs smaller dimensions, which were reduced as gently as possible.');
            if (out.scaled && out.reached) notes.push('Dimensions were slightly reduced to reach your target size at the best quality.');
            if (type === 'image/jpeg') notes.push('Saved as JPEG on a clean white background, ready for application forms.');
            resultNote.textContent = notes.join(' ');
            preview.src = outUrl;
            dl.href = outUrl;
            dl.setAttribute('download', 'compressed-image.' + ext);
            result.style.display = 'block';
            setStatus('Done. Check the new size, then download.');
          } catch (err) {
            setStatus('Something went wrong while compressing. Try a smaller photo or a different format.', true);
          }
          goBtn.disabled = false;
          goBtn.textContent = 'Compress Image';
        });

        againBtn.addEventListener('click', function () {
          result.style.display = 'none';
          work.style.display = 'none';
          fileInput.value = '';
          bitmap = null; curFile = null;
          drop.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
      })();
      </script>
    `
  }

};

const TOOLS_HUB_PAGE = {
  "title": "Free Online Tools - Voice, Audio & More | TextToSpeechH AI",
  "h1": "Free Online Tools",
  "metaDesc": "Every free tool from TextToSpeechH AI in one place: voice pitch changer, text to speech generator and more. No sign-up, no watermark, right in your browser.",
  "category": "Tools",
  "standaloneTool": true,
  "isHub": true,
  "tagline": "Simple tools that work right in your browser. No sign-up, no watermark, no fuss.",
  "faqs": [],
  "content": `
      <div style="display:grid; grid-template-columns:repeat(auto-fit,minmax(230px,1fr)); gap:16px; margin-bottom:10px;">
        <a href="/voice-pitch-changer" style="display:block; background:var(--color-surface); border:1px solid var(--color-border); border-radius:14px; padding:24px; text-decoration:none; color:inherit;">
          <p style="margin:0 0 10px; font-size:1.9rem;">&#127908;</p>
          <p style="margin:0 0 6px; font-weight:700; font-size:1.05rem; color:var(--color-text);">Voice Pitch Changer</p>
          <p style="margin:0; font-size:0.9rem; color:var(--color-text-muted); line-height:1.6;">Make any voice recording deeper or higher without changing its speed.</p>
        </a>
        <a href="/" style="display:block; background:var(--color-surface); border:1px solid var(--color-border); border-radius:14px; padding:24px; text-decoration:none; color:inherit;">
          <p style="margin:0 0 10px; font-size:1.9rem;">&#128266;</p>
          <p style="margin:0 0 6px; font-weight:700; font-size:1.05rem; color:var(--color-text);">Text to Speech Generator</p>
          <p style="margin:0; font-size:0.9rem; color:var(--color-text-muted); line-height:1.6;">Turn typed text into natural AI voiceovers and download the MP3, free.</p>
        </a>
        <a href="/youtube-transcript-generator" style="display:block; background:var(--color-surface); border:1px solid var(--color-border); border-radius:14px; padding:24px; text-decoration:none; color:inherit;">
          <p style="margin:0 0 10px; font-size:1.9rem;">&#128196;</p>
          <p style="margin:0 0 6px; font-weight:700; font-size:1.05rem; color:var(--color-text);">YouTube Transcript Generator</p>
          <p style="margin:0; font-size:0.9rem; color:var(--color-text-muted); line-height:1.6;">Get the full text of any YouTube video in one click, with timestamps.</p>
        </a>
        <a href="/image-compressor" style="display:block; background:var(--color-surface); border:1px solid var(--color-border); border-radius:14px; padding:24px; text-decoration:none; color:inherit;">
          <p style="margin:0 0 10px; font-size:1.9rem;">&#128247;</p>
          <p style="margin:0 0 6px; font-weight:700; font-size:1.05rem; color:var(--color-text);">Image Compressor</p>
          <p style="margin:0; font-size:0.9rem; color:var(--color-text-muted); line-height:1.6;">Shrink a photo to an exact size in KB - 20, 50, 100 KB - for online forms.</p>
        </a>
        <div style="background:var(--color-surface); border:1px dashed var(--color-border-strong); border-radius:14px; padding:24px; opacity:0.75;">
          <p style="margin:0 0 10px; font-size:1.9rem;">&#127874;</p>
          <p style="margin:0 0 6px; font-weight:700; font-size:1.05rem;">Age Calculator</p>
          <p style="margin:0; font-size:0.9rem; color:var(--color-text-muted); line-height:1.6;">Find your exact age in years, months and days. <strong>Coming soon.</strong></p>
        </div>
      </div>
    `
};

module.exports = { TOOL_PAGES, TOOLS_HUB_PAGE };
