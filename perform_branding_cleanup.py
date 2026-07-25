import os

PROJECT_DIR = os.path.dirname(os.path.abspath(__file__))

print("=========================================================")
print("TEXTTOSPEECHH AI - BRANDING CLEANUP & IDENTIFIER AUDIT")
print("=========================================================\n")

replacements = [
    ("texttospeechh-ai", "texttospeechh.com"),
    ("voice-generator", "texttospeechh.com"),
    ("voice_generator", "texttospeechh_com"),
]

modified_files = []

for root, dirs, files in os.walk(PROJECT_DIR):
    if ".git" in root or "node_modules" in root or ".next" in root or ".vercel" in root:
        continue
    for f in files:
        if f in ["perform_branding_cleanup.py"]:
            continue
        file_p = os.path.join(root, f)
        try:
            with open(file_p, "r", encoding="utf-8") as fp:
                content = fp.read()
            
            new_content = content
            for old_str, new_str in replacements:
                if old_str in new_content:
                    new_content = new_content.replace(old_str, new_str)
            
            if new_content != content:
                with open(file_p, "w", encoding="utf-8") as fp:
                    fp.write(new_content)
                rel_p = os.path.relpath(file_p, PROJECT_DIR)
                print(f"   [UPDATED] {rel_p}")
                modified_files.append(rel_p)
        except Exception as e:
            pass

print(f"\n   Total Files Cleaned & Updated: {len(modified_files)}")
print("   [OK] Branding Cleanup Complete!")
