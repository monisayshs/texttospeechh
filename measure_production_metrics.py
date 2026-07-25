import requests
import time
import os
import json

BASE_URL = "http://localhost:3000"
PROJECT_DIR = os.path.dirname(os.path.abspath(__file__))

print("=========================================================")
print("TEXTTOSPEECHH AI - EMPIRICAL PRODUCTION MEASUREMENTS")
print("=========================================================\n")

# 1. Measured File Sizes on Disk
print("1. Disk File Size Measurements:")
files_to_measure = [
    ("public/index.html", "Homepage HTML"),
    ("public/app.js", "Frontend Logic Bundle"),
    ("public/style.css", "SaaS CSS Bundle"),
    ("public/logo.svg", "Primary SVG Logo"),
    ("public/logo-icon.svg", "Icon Emblem SVG"),
    ("public/favicon.svg", "Favicon SVG"),
    ("public/og-image.png", "OpenGraph Social Card (1200x630)")
]

file_metrics = []
for rel_path, desc in files_to_measure:
    full_p = os.path.join(PROJECT_DIR, rel_path)
    if os.path.exists(full_p):
        size_bytes = os.path.getsize(full_p)
        size_kb = round(size_bytes / 1024, 2)
        file_metrics.append((rel_path, desc, size_bytes, size_kb))
        print(f"   [MEASURED] {desc} ({rel_path}): {size_bytes} bytes ({size_kb} KB)")
    else:
        print(f"   [UNVERIFIED] File {rel_path} not found")

# 2. Measured HTTP Response TTFB over 5 Runs
print("\n2. Empirical Network TTFB & Transfer Measurements (5 Runs Average):")
target_routes = [
    ("/", "Homepage"),
    ("/faq", "FAQ Directory"),
    ("/logo.svg", "Logo Vector"),
    ("/style.css", "Stylesheet"),
    ("/guide/understanding-ai-voice-cloning", "Educational Guide"),
    ("/keyword/text-to-speech-free", "Programmatic Landing Page")
]

headers = { "Accept-Encoding": "gzip, deflate" }
network_results = []

for route, label in target_routes:
    durations = []
    content_len = 0
    encoding = "none"
    cache_ctrl = "none"
    status_code = 0

    for run in range(5):
        t0 = time.time()
        res = requests.get(f"{BASE_URL}{route}", headers=headers)
        t1 = time.time()
        durations.append((t1 - t0) * 1000)
        content_len = len(res.content)
        encoding = res.headers.get("content-encoding", "none")
        cache_ctrl = res.headers.get("cache-control", "none")
        status_code = res.status_code

    avg_ttfb = round(sum(durations) / len(durations), 2)
    min_ttfb = round(min(durations), 2)
    max_ttfb = round(max(durations), 2)

    network_results.append({
        "route": route,
        "label": label,
        "status": status_code,
        "avg_ttfb_ms": avg_ttfb,
        "min_ttfb_ms": min_ttfb,
        "max_ttfb_ms": max_ttfb,
        "transfer_bytes": content_len,
        "encoding": encoding,
        "cache_control": cache_ctrl
    })

    print(f"   [MEASURED] {label} ({route}) -> HTTP {status_code} | Avg TTFB: {avg_ttfb} ms (Min: {min_ttfb}ms, Max: {max_ttfb}ms) | Size: {content_len} bytes | Encoding: {encoding}")

# 3. Empirical API Submission Benchmark
print("\n3. Empirical API Job Submission Latency Measurement:")
api_payload = {
    "text": "TextToSpeechH AI empirical benchmark text.",
    "voice": "en-US-JennyNeural"
}

t_api0 = time.time()
api_res = requests.post(f"{BASE_URL}/api/generate", json=api_payload)
t_api1 = time.time()
api_duration_ms = round((t_api1 - t_api0) * 1000, 2)

print(f"   [MEASURED] /api/generate Job Submission -> HTTP {api_res.status_code} | Latency: {api_duration_ms} ms")
if api_res.status_code == 200:
    job_data = api_res.json()
    print(f"   [MEASURED] Job ID Created: {job_data.get('jobId')}")

# Save Summary Json
summary_data = {
    "file_metrics": file_metrics,
    "network_results": network_results,
    "api_latency_ms": api_duration_ms
}

with open(os.path.join(PROJECT_DIR, 'empirical_metrics.json'), 'w') as f:
    json.dump(summary_data, f, indent=2)

print("\n>>> EMPIRICAL MEASUREMENTS COMPLETED SUCCESSFULLY! <<<")
