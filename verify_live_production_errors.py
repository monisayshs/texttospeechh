import urllib.request
import urllib.error
import ssl

ssl_context = ssl._create_unverified_context()

BASE_URL = "https://texttospeechh-ai.vercel.app"

tests = [
    {"name": "1. 404 Not Found", "url": f"{BASE_URL}/non-existent-route-audit-404", "expected_status": 404, "expected_text": "404"},
    {"name": "2. 500 Internal Error", "url": f"{BASE_URL}/500", "expected_status": 500, "expected_text": "500"},
    {"name": "3. 403 Access Denied", "url": f"{BASE_URL}/403", "expected_status": 403, "expected_text": "403"},
    {"name": "4. 429 Rate Limit", "url": f"{BASE_URL}/429", "expected_status": 429, "expected_text": "429"},
    {"name": "5. 503 Maintenance", "url": f"{BASE_URL}/503", "expected_status": 503, "expected_text": "503"},
    {"name": "6. Offline Page", "url": f"{BASE_URL}/offline.html", "expected_status": 200, "expected_text": "Offline"},
]

print("=========================================================")
print(f"LIVE PRODUCTION ERROR PAGES & ROUTING AUDIT ({BASE_URL})")
print("=========================================================\n")

results = []

for t in tests:
    req = urllib.request.Request(t["url"], headers={"User-Agent": "Mozilla/5.0 AuditEngine/1.0"})
    status_code = 0
    body = ""
    content_type = ""
    
    try:
        with urllib.request.urlopen(req, context=ssl_context) as response:
            status_code = response.getcode()
            body = response.read().decode('utf-8', errors='ignore')
            content_type = response.headers.get('Content-Type', '')
    except urllib.error.HTTPError as e:
        status_code = e.code
        body = e.read().decode('utf-8', errors='ignore')
        content_type = e.headers.get('Content-Type', '')
    except Exception as e:
        print(f"[FAIL] {t['name']}: Network Exception - {e}")
        results.append((t['name'], "FAIL", f"Network Exception - {e}"))
        continue

    is_status_pass = (status_code == t['expected_status'])
    is_html_pass = ('text/html' in content_type.lower())
    is_content_pass = (t['expected_text'].lower() in body.lower())
    is_not_plain = not body.startswith('PLAIN_TEXT') and '<html' in body.lower()
    is_not_vercel = "Vercel" not in body or "TextToSpeechH AI" in body

    passed = is_status_pass and is_html_pass and is_content_pass and is_not_plain and is_not_vercel

    result_str = "PASS" if passed else "FAIL"
    print(f"{t['name']}:")
    print(f"  - URL: {t['url']}")
    print(f"  - Received HTTP Status: {status_code} (Expected: {t['expected_status']}) -> {'[OK]' if is_status_pass else '[MISMATCH]'}")
    print(f"  - Content-Type: {content_type} -> {'[OK]' if is_html_pass else '[MISMATCH]'}")
    print(f"  - Custom Glassmorphic UI Rendered: {'[OK]' if is_content_pass and is_not_plain else '[NO]'}")
    print(f"  - Result: {result_str}\n")
    results.append((t['name'], result_str, f"Status: {status_code}, Type: {content_type}"))

print("=========================================================")
print("FINAL AUDIT SUMMARY FOR PRODUCTION DEPLOYMENT")
print("=========================================================")
all_passed = True
for name, status, details in results:
    if status != "PASS": all_passed = False
    print(f" • {name}: {status} ({details})")
print(f"\nOVERALL RESULT: {'ALL TESTS PASSED [PASS]' if all_passed else 'SOME TESTS FAILED [FAIL]'}")
print("=========================================================")
