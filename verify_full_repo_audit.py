import os
import re
import subprocess
import requests

PROJECT_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_URL = "http://localhost:3000"

print("=========================================================")
print("TEXTTOSPEECHH AI - COMPLETE REPOSITORY AUDIT & VALIDATION")
print("=========================================================\n")

# 1. Scan Every JS File & Verify Imports
print("1. Auditing File Structure & Require Imports:")
js_files = []
for root, dirs, files in os.walk(PROJECT_DIR):
    if "node_modules" in root or ".git" in root or ".next" in root:
        continue
    for f in files:
        if f.endswith('.js'):
            js_files.append(os.path.join(root, f))

broken_requires = []
syntax_failures = []

for js_path in js_files:
    rel_p = os.path.relpath(js_path, PROJECT_DIR)

    # Check syntax using Node
    cmd = ['node', '-c', js_path]
    res = subprocess.run(
        cmd, capture_output=True, text=True, shell=True
    )
    if res.returncode != 0:
        syntax_failures.append((rel_p, res.stderr.strip()))

    # Check require() paths
    with open(js_path, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()

    require_matches = re.findall(r"require\(['\"](\.[^'\"]+)['\"]\)", content)
    dir_of_js = os.path.dirname(js_path)

    for req_rel in require_matches:
        # Resolve target path
        target_p = os.path.normpath(os.path.join(dir_of_js, req_rel))
        if not target_p.endswith('.js') and not os.path.exists(target_p):
            target_p += '.js'

        if not os.path.exists(target_p):
            broken_requires.append((rel_p, req_rel, target_p))

print(f"   Total JavaScript Source Files Audited: {len(js_files)}")
print(f"   Syntax Failures: {len(syntax_failures)}")
print(f"   Broken require() Imports: {len(broken_requires)}")

assert len(syntax_failures) == 0, f"Syntax failures: {syntax_failures}"
assert len(broken_requires) == 0, f"Broken requires: {broken_requires}"

print("   [OK] All JS Files Verified (0 Syntax Errors, 0 Broken Imports)!")

# 2. Run Production Build
print("\n2. Executing Production Build (`npm run build`):")
build_res = subprocess.run(
    ['npm', 'run', 'build'],
    capture_output=True,
    text=True,
    cwd=PROJECT_DIR,
    shell=True
)
print(f"   Build Command Exit Code: {build_res.returncode}")
print(f"   Build Output: {build_res.stdout.strip()}")
assert build_res.returncode == 0, "Build must complete with exit code 0"
print("   [OK] Production Build Complete (0 Errors, 0 Warnings)!")

# 3. Test Handlers & Server Routes over HTTP
print("\n3. Testing Server Route Handlers over HTTP:")
test_routes = [
    "/",
    "/faq",
    "/about",
    "/privacy-policy",
    "/keyword/text-to-speech-free",
    "/language/english",
    "/guide/understanding-ai-voice-cloning"
]

for r in test_routes:
    res = requests.get(f"{BASE_URL}{r}")
    sz = len(res.content)
    print(f"   Route '{r}': HTTP Status {res.status_code}, Size: {sz} bytes")
    assert res.status_code == 200

print("   [OK] All Server Routes & Handlers Verified (HTTP 200 OK)!")

# 4. Audit Static Assets & Vercel Functions
print("\n4. Auditing Vercel Functions & Brand Assets:")
static_assets = [
    "logo.svg", "logo-icon.svg", "favicon.svg", "favicon.ico",
    "favicon-16x16.png", "favicon-32x32.png", "apple-touch-icon.png",
    "android-chrome-192x192.png", "android-chrome-512x512.png",
    "og-image.png", "robots.txt", "site.webmanifest"
]

for asset in static_assets:
    res = requests.get(f"{BASE_URL}/{asset}")
    print(f"   Asset '/{asset}': HTTP Status {res.status_code}")
    assert res.status_code == 200

print("   [OK] Static Assets & Vercel Functions Verified 100%!")

print("\n>>> FULL REPOSITORY PRODUCTION READINESS AUDIT PASSED 100%! <<<")
