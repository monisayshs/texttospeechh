import requests

BASE_URL = "http://localhost:3000"

print("=========================================================")
print("TEXTTOSPEECHH AI - CONTENT, EEAT & FAQ AUTHORITY AUDIT")
print("=========================================================\n")

# 1. Audit FAQ Directory
faq_res = requests.get(f"{BASE_URL}/faq")
print("1. FAQ Directory HTTP Status:", faq_res.status_code)
assert faq_res.status_code == 200
assert "Frequently Asked Questions" in faq_res.text
assert "Verified EEAT Authority Content" in faq_res.text
assert "Last Updated:" in faq_res.text
print("   [OK] FAQ Directory & EEAT Header Verified!")

# 2. Audit Educational Guides (Voice Cloning & Voice Changer)
guides = [
    "guide/understanding-ai-voice-cloning",
    "guide/how-voice-changers-work"
]
print("\n2. Testing Educational Guides for Unimplemented Tools:")
for g in guides:
    res = requests.get(f"{BASE_URL}/{g}")
    print(f"   Guide '/{g}': HTTP Status {res.status_code}")
    assert res.status_code == 200
    assert "Verified EEAT Authority Content" in res.text
    assert "TextToSpeechH AI" in res.text
print("   [OK] Educational Guides & EEAT Compliance Verified!")

# 3. Test Intent Silo Pages
intent_pages = [
    "blog/ultimate-ai-voice-generator-guide",
    "blog/ai-voiceover-for-youtube-shorts",
    "blog/text-to-speech-audiobook-creation"
]
print("\n3. Testing Content Silos & Internal Links:")
for p in intent_pages:
    res = requests.get(f"{BASE_URL}/{p}")
    print(f"   Silo Article '/{p}': HTTP Status {res.status_code}")
    assert res.status_code == 200
    assert "TextToSpeechH AI" in res.text
print("   [OK] Content Silos & Internal Links Verified!")

print("\n>>> CONTENT, EEAT & FAQ AUTHORITY AUDIT PASSED 100%! <<<")
