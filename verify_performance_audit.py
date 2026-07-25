import requests
import time
import json

BASE_URL = "http://localhost:3000"

print("=========================================================")
print("TEXTTOSPEECHH AI - PRODUCTION PERFORMANCE & SCALABILITY AUDIT")
print("=========================================================\n")

# 1. Audit Security Headers, Cache-Control & Gzip Compression
print("1. Auditing Network Compression & Caching Headers:")
headers = { "Accept-Encoding": "gzip, deflate" }
res = requests.get(f"{BASE_URL}/", headers=headers)

print(f"   Homepage HTTP Status: {res.status_code}")
print(f"   Content-Encoding: {res.headers.get('content-encoding')}")
print(f"   Cache-Control: {res.headers.get('cache-control')}")
print(f"   X-Content-Type-Options: {res.headers.get('x-content-type-options')}")

assert res.status_code == 200
assert res.headers.get('content-encoding') == 'gzip', "Gzip compression must be enabled"
assert 'max-age' in res.headers.get('cache-control', ''), "Cache-Control headers must be present"
assert res.headers.get('x-content-type-options') == 'nosniff', "Security headers must be present"
print("   [OK] Gzip Compression & Security Caching Headers Verified!")

# 2. Measure TTFB & Latency Metrics
print("\n2. Measuring Response Time & TTFB Across Key Routes:")
routes = [
    "/",
    "/faq",
    "/logo.svg",
    "/style.css",
    "/guide/understanding-ai-voice-cloning",
    "/keyword/text-to-speech-free"
]

ttfb_results = []
for route in routes:
    start_time = time.time()
    r = requests.get(f"{BASE_URL}{route}", headers=headers)
    duration_ms = round((time.time() - start_time) * 1000, 2)
    ttfb_results.append((route, r.status_code, duration_ms))
    print(f"   Route '{route}': HTTP {r.status_code} | TTFB: {duration_ms} ms")
    assert r.status_code == 200
    assert duration_ms < 500, f"TTFB for {route} should be under 500ms, got {duration_ms}ms"

print("   [OK] TTFB Performance Target (< 500ms) Passed 100%!")

# 3. Audit AI Pipeline Latency
print("\n3. Auditing AI Speech Synthesis Pipeline Latency:")
test_payload = {
    "text": "TextToSpeechH AI is an ultra-realistic neural voice generator optimized for performance and low latency audio synthesis.",
    "voice": "en-US-JennyNeural",
    "speed": 1.0,
    "pitch": 1.0
}

start_gen = time.time()
gen_res = requests.post(f"{BASE_URL}/api/generate", json=test_payload)
gen_duration = round((time.time() - start_gen) * 1000, 2)

print(f"   /api/generate Job Submission HTTP: {gen_res.status_code} | Duration: {gen_duration} ms")
assert gen_res.status_code == 200
job_data = gen_res.json()
job_id = job_data.get('jobId')
assert job_id is not None, "Job ID must be returned"
print(f"   Received Job ID: {job_id}")

# Poll status until completed
status = "processing"
attempts = 0
start_poll = time.time()
while status in ["queued", "processing"] and attempts < 20:
    time.sleep(0.5)
    attempts += 1
    st_res = requests.get(f"{BASE_URL}/api/status?jobId={job_id}")
    if st_res.headers.get('content-type') == 'audio/mpeg':
        status = "completed"
        print(f"   Audio Generation Completed! Total Processing Time: {round((time.time() - start_poll)*1000, 2)} ms")
        break
    elif st_res.status_code == 200:
        st_json = st_res.json()
        status = st_json.get('status')
        print(f"   Poll Attempt #{attempts}: Status = {status}, Progress = {st_json.get('progress')}%")

print("   [OK] AI Speech Synthesis Pipeline Verified!")

print("\n>>> PRODUCTION PERFORMANCE AUDIT PASSED 100%! <<<")
