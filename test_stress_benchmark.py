import requests
import time
import os

# Test word sizes required by Step 14
TARGET_WORD_COUNTS = [500, 2500, 5000, 7500, 10000]

def generate_script(word_target):
    base = "This is an enterprise stress test sentence for TextToSpeechH AI Voice Platform. It tests long script synthesis, quotation preservation, sentence boundary chunking, queue performance, and audio normalization. "
    repeat_count = max(1, word_target // 25)
    sentences = [f"Sentence {i+1}: {base}" for i in range(repeat_count)]
    paragraphs = [" ".join(sentences[i:i+10]) for i in range(0, len(sentences), 10)]
    return "\n\n".join(paragraphs)

print("=========================================================")
print("TEXTTOSPEECHH AI VOICE PLATFORM - STEP 14 STRESS BENCHMARK TEST")
print("=========================================================\n")

results_table = []

for target_words in TARGET_WORD_COUNTS:
    script = generate_script(target_words)
    actual_words = len(script.split())
    actual_chars = len(script)
    
    print(f"\n--- Benchmarking Script: ~{target_words} words (Actual: {actual_words} words, {actual_chars} chars) ---")
    
    start_time = time.time()
    
    # 1. Enqueue Request
    resp = requests.post("http://localhost:3000/api/generate", json={
        "text": script,
        "voice": "en-US-JennyNeural"
    })
    
    if resp.headers.get("content-type", "").startswith("audio/"):
        audio_bytes = resp.content
        elapsed = time.time() - start_time
        status_code = resp.status_code
        download_filename = "direct_stream.mp3"
    else:
        data = resp.json()
        job_id = data.get("jobId")
        print(f"Job Enqueued: ID={job_id}, Chunks={data.get('totalChunks')}, WordCount={data.get('wordCount')}")
        
        # 2. Poll Status until COMPLETED
        completed = False
        for poll_idx in range(120): # Up to 4 minutes
            status_resp = requests.get(f"http://localhost:3000/api/status?jobId={job_id}")
            status_data = status_resp.json()
            state = status_data.get("state")
            processed = status_data.get("processedChunks")
            total = status_data.get("totalChunks")
            progress = status_data.get("progress")
            
            if poll_idx % 3 == 0 or state == "COMPLETED":
                print(f"Poll #{poll_idx+1}: State={state}, Chunks={processed}/{total}, Progress={progress}%")
                
            if state == "COMPLETED":
                completed = True
                break
            if state == "FAILED":
                print("Job Failed:", status_data.get("error"))
                break
            time.sleep(2)
            
        elapsed = time.time() - start_time
        
        # 3. Stream & Verify Download Format
        dl_resp = requests.get(f"http://localhost:3000/api/status?jobId={job_id}&download=true")
        audio_bytes = dl_resp.content
        status_code = dl_resp.status_code
        
        cd = dl_resp.headers.get("Content-Disposition", "")
        download_filename = cd.split("filename=")[-1].strip('"') if "filename=" in cd else "unknown.mp3"

    file_size_mb = len(audio_bytes) / (1024 * 1024)
    
    res = {
        "target_words": target_words,
        "actual_words": actual_words,
        "chars": actual_chars,
        "elapsed_sec": round(elapsed, 2),
        "status_code": status_code,
        "file_size_mb": round(file_size_mb, 2),
        "download_filename": download_filename
    }
    results_table.append(res)
    print(f"DONE in {res['elapsed_sec']}s | Size: {res['file_size_mb']} MB | Filename: {res['download_filename']}")

print("\n=========================================================")
print("STEP 14 BENCHMARK SUMMARY RESULTS TABLE")
print("=========================================================")
print(f"{'Target Words':<14} | {'Actual Words':<14} | {'Time (s)':<10} | {'MP3 Size':<10} | {'HTTP Status':<12} | {'Filename':<28}")
print("-" * 100)
for r in results_table:
    print(f"{r['target_words']:<14} | {r['actual_words']:<14} | {r['elapsed_sec']:<10} | {r['file_size_mb']:<7} MB | {r['status_code']:<12} | {r['download_filename']:<28}")
print("=========================================================")
