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
        <div style="background:var(--color-surface); border:1px dashed var(--color-border-strong); border-radius:14px; padding:24px; opacity:0.75;">
          <p style="margin:0 0 10px; font-size:1.9rem;">&#128196;</p>
          <p style="margin:0 0 6px; font-weight:700; font-size:1.05rem;">YouTube Transcript Generator</p>
          <p style="margin:0; font-size:0.9rem; color:var(--color-text-muted); line-height:1.6;">Get the full text of any YouTube video in one click. <strong>Coming soon.</strong></p>
        </div>
        <div style="background:var(--color-surface); border:1px dashed var(--color-border-strong); border-radius:14px; padding:24px; opacity:0.75;">
          <p style="margin:0 0 10px; font-size:1.9rem;">&#128247;</p>
          <p style="margin:0 0 6px; font-weight:700; font-size:1.05rem;">Image Compressor</p>
          <p style="margin:0; font-size:0.9rem; color:var(--color-text-muted); line-height:1.6;">Shrink a photo to an exact size in KB for online forms. <strong>Coming soon.</strong></p>
        </div>
        <div style="background:var(--color-surface); border:1px dashed var(--color-border-strong); border-radius:14px; padding:24px; opacity:0.75;">
          <p style="margin:0 0 10px; font-size:1.9rem;">&#127874;</p>
          <p style="margin:0 0 6px; font-weight:700; font-size:1.05rem;">Age Calculator</p>
          <p style="margin:0; font-size:0.9rem; color:var(--color-text-muted); line-height:1.6;">Find your exact age in years, months and days. <strong>Coming soon.</strong></p>
        </div>
      </div>
    `
};

module.exports = { TOOL_PAGES, TOOLS_HUB_PAGE };
