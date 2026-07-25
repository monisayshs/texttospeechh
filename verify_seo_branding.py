import requests
import os
import re

BASE_URL = "http://localhost:3000"

print("=========================================================")
print("TEXTTOSPEECHH AI - ENTERPRISE BRANDING & SOCIAL AUDIT")
print("=========================================================\n")

# 1. Audit All 13 Production Brand Assets over HTTP
required_assets = [
    "logo.svg",
    "logo-dark.svg",
    "logo-light.svg",
    "logo-icon.svg",
    "favicon.svg",
    "favicon.ico",
    "favicon-16x16.png",
    "favicon-32x32.png",
    "apple-touch-icon.png",
    "android-chrome-192x192.png",
    "android-chrome-512x512.png",
    "site.webmanifest",
    "og-image.png"
]

print("1. Auditing 13 Production Brand Assets Availability over HTTP:")
for asset in required_assets:
    res = requests.get(f"{BASE_URL}/{asset}")
    print(f"   Asset '/{asset}': HTTP Status {res.status_code}, Length: {len(res.content)} bytes, Type: {res.headers.get('content-type')}")
    assert res.status_code == 200, f"Brand asset {asset} must return 200 OK"
    assert len(res.content) > 0, f"Brand asset {asset} must not be empty"

print("   [OK] ALL 13 Brand Assets Verified Available & Serving HTTP 200 OK!")

# 2. Audit Official Instagram Handle Integration
print("\n2. Auditing Social Media Branding Compliance:")
hp_res = requests.get(f"{BASE_URL}/")
assert hp_res.status_code == 200
hp_html = hp_res.text

assert "https://www.instagram.com/webxpert.ai/" in hp_html, "Official Instagram URL must exist"
assert "@webxpert.ai" in hp_html, "Instagram handle @webxpert.ai must exist"
assert 'target="_blank"' in hp_html, "External social link must open in target=_blank"
assert 'rel="noopener noreferrer"' in hp_html, "External social link must include rel=noopener noreferrer"

# Assert no legacy social channels exist in homepage HTML
assert "twitter.com" not in hp_html.lower(), "Legacy Twitter links must be removed"
assert "facebook.com" not in hp_html.lower(), "Legacy Facebook links must be removed"
print("   [OK] Official Instagram (@webxpert.ai) Verified as Sole Social Profile!")

# 3. Perform Codebase Scan for Legacy Branding
print("\n3. Codebase Scan for Legacy Branding ('Vocalize'):")
root_dir = os.path.dirname(os.path.abspath(__file__))
legacy_found = []

for root, dirs, files in os.walk(root_dir):
    if "node_modules" in root or ".git" in root:
        continue
    for f in files:
        if f.endswith(('.html', '.js', '.css', '.json', '.py', '.txt', '.md', '.svg')) and f != 'verify_seo_branding.py':
            filepath = os.path.join(root, f)
            try:
                with open(filepath, 'r', encoding='utf-8', errors='ignore') as file_obj:
                    content = file_obj.read()
                    if "vocalize" in content.lower():
                        legacy_found.append(filepath)
            except Exception:
                pass

print(f"   Legacy Occurrences Found in Source Code: {len(legacy_found)}")
assert len(legacy_found) == 0, f"Found legacy branding in: {legacy_found}"
print("   [OK] ZERO Legacy Branding References Found in Source Codebase!")

print("\n>>> ENTERPRISE BRANDING & SOCIAL AUDIT PASSED 100%! <<<")
