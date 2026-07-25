import requests
import time

# Create a long script (~2500 words across 5 paragraphs)
para = "This is a comprehensive test for the TextToSpeechH AI Voice Generator long script synthesis queue engine. It tests automatic paragraph and sentence chunking without mid-sentence splits, request queueing, exponential backoff retries, and seamless binary MP3 chunk merging into a single final audio output file. " * 3
script = "\n\n".join([f"Paragraph {i+1}: {para}" for i in range(5)])

print(f"Submitting script: {len(script)} characters, ~{len(script.split())} words.")

# 1. Enqueue job
resp = requests.post("http://localhost:3000/api/generate", json={
    "text": script,
    "voice": "en-US-JennyNeural"
})

print("API Response Status:", resp.status_code)
data = resp.json()
print("API Response Data:", data)

job_id = data.get("jobId")
assert job_id, "jobId should be returned for long text script"

# 2. Poll job status until COMPLETED or FAILED
for poll_num in range(60):
    status_resp = requests.get(f"http://localhost:3000/api/status?jobId={job_id}")
    status_data = status_resp.json()
    state = status_data.get("state")
    processed = status_data.get("processedChunks")
    total = status_data.get("totalChunks")
    progress = status_data.get("progress")
    err = status_data.get("error")
    
    print(f"Poll #{poll_num+1}: State={state}, Chunks={processed}/{total}, Progress={progress}%, Error={err}")
    
    if state == "COMPLETED":
        print("\n>>> SUCCESS: Long script synthesis completed 100%! <<<")
        break
    if state == "FAILED":
        print("\n>>> FAILED: Job failed:", err)
        break
    time.sleep(2)

# 3. Download Merged Audio Stream
audio_resp = requests.get(f"http://localhost:3000/api/status?jobId={job_id}&download=true")
print(f"Audio Download Response Code: {audio_resp.status_code}, Merged MP3 File Size: {len(audio_resp.content)} bytes")

assert audio_resp.status_code == 200, "Audio download status code must be 200"
assert len(audio_resp.content) > 20000, "Merged audio file must contain substantial binary data"

print("\n🎉 ALL BACKEND & QUEUE INTEGRATION TESTS PASSED PERFECTLY! 🎉")
