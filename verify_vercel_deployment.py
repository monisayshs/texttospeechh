import requests
import os
import json

BASE_URL = "http://localhost:3000"
PROJECT_DIR = os.path.dirname(os.path.abspath(__file__))

print("=========================================================")
print("TEXTTOSPEECHH AI - PRODUCTION VERCEL DEPLOYMENT AUDIT")
print("=========================================================\n")

# 1. Inspect package.json
print("1. Auditing package.json Configuration:")
pkg_path = os.path.join(PROJECT_DIR, 'package.json')
assert os.path.exists(pkg_path), "package.json must exist"

with open(pkg_path, 'r') as f:
    pkg = json.load(f)

print(f"   Name: {pkg.get('name')}")
print(f"   Main Script: {pkg.get('main')}")
print(f"   Build Command: {pkg.get('scripts', {}).get('build')}")

assert 'build' in pkg.get('scripts', {}), "build script must exist in package.json"
assert 'start' in pkg.get('scripts', {}), "start script must exist in package.json"
print("   [OK] package.json Vercel Readiness Verified!")

# 2. Inspect vercel.json
print("\n2. Auditing vercel.json Configuration:")
vercel_path = os.path.join(PROJECT_DIR, 'vercel.json')
assert os.path.exists(vercel_path), "vercel.json must exist"

with open(vercel_path, 'r') as f:
    v_conf = json.load(f)

print(f"   Vercel Version: {v_conf.get('version')}")
print(f"   Clean URLs: {v_conf.get('cleanUrls')}")
print(f"   Header Rules Count: {len(v_conf.get('headers', []))}")

assert v_conf.get('version') == 2, "Vercel version must be 2"
assert v_conf.get('cleanUrls') is True, "cleanUrls must be enabled"
print("   [OK] vercel.json Configuration Verified!")

# 3. Audit Serverless API Handlers in api/
print("\n3. Auditing Vercel Serverless Function Endpoints in api/:")
api_endpoints = ['api/generate.js', 'api/status.js', 'api/upload.js']
for ep in api_endpoints:
    ep_path = os.path.join(PROJECT_DIR, ep)
    assert os.path.exists(ep_path), f"Serverless endpoint {ep} must exist"
    print(f"   [OK] Serverless Function File Exists: {ep}")

# 4. Audit Static Assets & SEO Files
print("\n4. Auditing Static Assets & SEO Resources in public/:")
required_static = [
    "index.html",
    "app.js",
    "style.css",
    "logo.svg",
    "logo-icon.svg",
    "favicon.svg",
    "favicon-32x32.png",
    "apple-touch-icon.png",
    "android-chrome-192x192.png",
    "android-chrome-512x512.png",
    "og-image.png",
    "robots.txt",
    "site.webmanifest"
]

for s in required_static:
    s_path = os.path.join(PROJECT_DIR, 'public', s)
    assert os.path.exists(s_path), f"Static asset {s} must exist in public/"
    print(f"   [OK] Static Asset Exists: public/{s}")

# 5. Audit Security & Git Preparedness
print("\n5. Auditing Git Security (.gitignore):")
git_ignore_path = os.path.join(PROJECT_DIR, '.gitignore')
assert os.path.exists(git_ignore_path), ".gitignore must exist"
with open(git_ignore_path, 'r') as f:
    gi_content = f.read()

assert 'node_modules' in gi_content, "node_modules must be in .gitignore"
assert '.env' in gi_content, ".env must be in .gitignore"
print("   [OK] .gitignore Security Policy Verified!")

print("\n>>> PRODUCTION VERCEL DEPLOYMENT AUDIT PASSED 100%! <<<")
