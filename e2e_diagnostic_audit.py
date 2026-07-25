import requests

LOCAL_URL = "http://localhost:3000"
PROD_URL = "https://texttospeechh-ai.vercel.app"

print("=========================================================")
print("REAL END-TO-END DIAGNOSTIC AUDIT & PRODUCTION VERIFICATION")
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
    print("\n2. Testing POST /api/upload ...")
    try:
        upload_payload = {
            "filename": "sample_script.txt",
            "text": "TextToSpeechH AI converts document scripts into natural neural voice audio."
        }
        res = requests.post(f"{base_url}/api/upload", json=upload_payload, headers={"Content-Type": "application/json"}, timeout=15)
        print(f"   Status: {res.status_code}")
        print(f"   Body snippet: {res.text[:120]}")
    except Exception as e:
        print(f"   ERROR in POST /api/upload: {e}")

    # 3. Test /api/voices
    print("\n3. Testing GET /api/voices ...")
    try:
        res = requests.get(f"{base_url}/api/voices", timeout=15)
        print(f"   Status: {res.status_code}")
        data = res.json()
        print(f"   Total Voices Returned: {data.get('totalVoices')}")
    except Exception as e:
        print(f"   ERROR in GET /api/voices: {e}")

    # 4. Test /api/languages
    print("\n4. Testing GET /api/languages ...")
    try:
        res = requests.get(f"{base_url}/api/languages", timeout=15)
        print(f"   Status: {res.status_code}")
        data = res.json()
        print(f"   Total Languages Returned: {data.get('totalLanguages')}")
    except Exception as e:
        print(f"   ERROR in GET /api/languages: {e}")

    # 5. Test /api/jobs
    print("\n5. Testing GET /api/jobs ...")
    try:
        res = requests.get(f"{base_url}/api/jobs", timeout=15)
        print(f"   Status: {res.status_code}")
        print(f"   Body snippet: {res.text[:120]}")
    except Exception as e:
        print(f"   ERROR in GET /api/jobs: {e}")

    # 6. Test Legal Pages (/privacy, /terms, /contact, /about, /support)
    print("\n6. Testing Legal & Navigation Pages ...")
    legal_routes = ['/privacy', '/privacy-policy', '/terms', '/contact', '/about', '/support', '/disclaimer', '/cookie-policy']
    for r in legal_routes:
        try:
            res = requests.get(f"{base_url}{r}", timeout=15)
            print(f"   {r} -> Status: {res.status_code} ({'OK' if res.status_code == 200 else 'FAIL'})")
        except Exception as e:
            print(f"   {r} -> ERROR: {e}")

    print("\n" + "="*50 + "\n")

test_target(LOCAL_URL, "Localhost Dev Server")
test_target(PROD_URL, "Vercel Production Deployment (texttospeechh-ai.vercel.app)")
