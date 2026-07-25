import requests

LIVE_VERCEL_URL = "https://texttospeechhcom.vercel.app"

print("=========================================================")
print("TEXTTOSPEECHH.COM - LIVE VERCEL PRODUCTION AUDIT")
print("=========================================================\n")

# 1. Audit Live Production Homepage
print("1. Testing Live Production Homepage:")
res = requests.get(LIVE_VERCEL_URL)
print(f"   Live URL: {LIVE_VERCEL_URL}")
print(f"   HTTP Status: {res.status_code}")
print(f"   Content Length: {len(res.content)} bytes")
assert res.status_code == 200, "Live Vercel production homepage must return HTTP 200 OK"
assert "TextToSpeechH AI" in res.text, "TextToSpeechH AI brand name must exist on live deployment"
print("   [OK] Live Production Homepage Verified 100%!")

# 2. Audit Live Vercel Brand Assets
print("\n2. Testing Live Production Brand Assets:")
assets = ["logo.svg", "logo-icon.svg", "favicon.svg", "og-image.png", "robots.txt", "site.webmanifest"]
for asset in assets:
    a_res = requests.get(f"{LIVE_VERCEL_URL}/{asset}")
    print(f"   Live Asset '/{asset}': HTTP Status {a_res.status_code}, Length: {len(a_res.content)} bytes")
    assert a_res.status_code == 200, f"Asset {asset} must return 200 OK"

print("\n>>> LIVE VERCEL PRODUCTION DEPLOYMENT AUDIT PASSED 100%! <<<")
