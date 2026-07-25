import os
import subprocess

PROJECT_DIR = os.path.dirname(os.path.abspath(__file__))

env = os.environ.copy()
env.pop('GITHUB_TOKEN', None)
env.pop('GH_TOKEN', None)

gh_exe = r"C:\Program Files\GitHub CLI\gh.exe"

print("1. Renaming GitHub repository from 'texttospeechh.com' to 'texttospeechh.com'...")
cmd = [gh_exe, "api", "-X", "PATCH", "repos/monisayshs/texttospeechh.com", "-f", "name=texttospeechh.com"]

res = subprocess.run(cmd, capture_output=True, text=True, cwd=PROJECT_DIR, env=env)
print("Returncode:", res.returncode)
print("Stdout:", res.stdout[:200] if res.stdout else "Empty")
print("Stderr:", res.stderr if res.stderr else "None")

if res.returncode == 0 or "name" in res.stdout:
    print("   [OK] GitHub Repository successfully renamed to 'texttospeechh.com'!")
