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
    try:
        payload = {"text": "Hello world, this is an end to end test of AI voice synthesis.", "voice": "en-US-AriaNeural"}
        res = requests.post(f"{base_url}/api/generate", json=payload, headers={"Content-Type": "application/json"}, timeout=15)
        print(f"   Status: {res.status_code}")
        print(f"   Headers: {res.headers.get('Content-Type')}")
        data = res.json()
        job_id = data.get('jobId')
        print(f"   Generated Job ID: {job_id}")
        print(f"   Response JSON: {data}")
    except Exception as e:
        print(f"   ERROR in POST /api/generate: {e}")

    # 2. Test /api/status
    print("\n2. Testing GET /api/status (Status Check) ...")
    try:
        if job_id:
            res = requests.get(f"{base_url}/api/status?jobId={job_id}", timeout=15)
            print(f"   Status: {res.status_code}")
            print(f"   Body: {res.text}")
        else:
            print("   Skipping (No jobId from generate)")
    except Exception as e:
        print(f"   ERROR in GET /api/status: {e}")

    # 3. Test /api/status?download=true
    print("\n3. Testing GET /api/status?download=true (Audio Download Stream) ...")
    try:
        if job_id:
            res = requests.get(f"{base_url}/api/status?jobId={job_id}&download=true", timeout=15)
            print(f"   Status: {res.status_code}")
            print(f"   Content-Type: {res.headers.get('Content-Type')}")
            print(f"   Audio Length: {len(res.content)} bytes")
        else:
            print("   Skipping (No jobId from generate)")
    except Exception as e:
        print(f"   ERROR in GET /api/status (download): {e}")

    # 4. Test /api/upload
    print("\n4. Testing POST /api/upload ...")
    try:
        files = {'file': ('test.txt', b'This is a sample document for TTS voice generator.')}
        res = requests.post(f"{base_url}/api/upload", files=files, timeout=15)
        print(f"   Status: {res.status_code}")
        print(f"   Body: {res.text}")
    except Exception as e:
        print(f"   ERROR in POST /api/upload: {e}")

    print("\n" + "="*50 + "\n")

test_target(LOCAL_URL, "Localhost Dev Server")
test_target(PROD_URL, "Vercel Production Deployment")
