import requests

LOCAL_URL = "http://localhost:3000"
PROD_URL = "https://texttospeechhcom.vercel.app"

print("=========================================================")
print("REAL END-TO-END DIAGNOSTIC AUDIT (LOCALHOST vs VERCEL)")
print("=========================================================\n")

def test_target(base_url, name):
    print(f"--- Testing Target: {name} ({base_url}) ---")
    
    # 1. Test /api/generate
    print("1. Testing POST /api/generate ...")
    job_id = None
    audio_data_uri = None
    try:
        payload = {"text": "Hello world, this is an end to end test of AI voice synthesis on production.", "voice": "en-US-AriaNeural"}
        res = requests.post(f"{base_url}/api/generate", json=payload, headers={"Content-Type": "application/json"}, timeout=15)
        print(f"   Status: {res.status_code}")
        print(f"   Headers: {res.headers.get('Content-Type')}")
        data = res.json()
        job_id = data.get('jobId')
        audio_data_uri = data.get('audioDataUri')
        print(f"   Generated Job ID: {job_id}")
        print(f"   Has Audio Data URI: {bool(audio_data_uri)}")
        if audio_data_uri:
            print(f"   Audio Data URI Length: {len(audio_data_uri)} chars")
    except Exception as e:
        print(f"   ERROR in POST /api/generate: {e}")

    # 2. Test /api/upload
    print("\n2. Testing POST /api/upload (JSON Document Extraction) ...")
    try:
        upload_payload = {
            "filename": "sample_script.txt",
            "text": "TextToSpeechH AI converts document scripts into natural neural voice audio."
        }
        res = requests.post(f"{base_url}/api/upload", json=upload_payload, headers={"Content-Type": "application/json"}, timeout=15)
        print(f"   Status: {res.status_code}")
        print(f"   Body: {res.text}")
    except Exception as e:
        print(f"   ERROR in POST /api/upload: {e}")

    print("\n" + "="*50 + "\n")

test_target(LOCAL_URL, "Localhost Dev Server")
test_target(PROD_URL, "Vercel Production Deployment (texttospeechhcom.vercel.app)")
