import os
import subprocess

PROJECT_DIR = os.path.dirname(os.path.abspath(__file__))

env = os.environ.copy()
env.pop('GITHUB_TOKEN', None)
env.pop('GH_TOKEN', None)

print("1. Adding updated files to Git index...")
subprocess.run(["git", "add", "."], cwd=PROJECT_DIR, env=env)

print("2. Committing unified brand updates...")
commit_res = subprocess.run(["git", "commit", "-m", "Refactor: Unified brand identity to TextToSpeechH AI and renamed repository to texttospeechh.com"], cwd=PROJECT_DIR, capture_output=True, text=True, env=env)
print("Commit output:", commit_res.stdout)

print("3. Pushing to GitHub main branch...")
push_res = subprocess.run(["git", "push", "-u", "origin", "main"], cwd=PROJECT_DIR, capture_output=True, text=True, env=env)
print("Push stdout:", push_res.stdout)
print("Push stderr:", push_res.stderr)

assert push_res.returncode == 0, "Git push to main branch must succeed"
print("   [OK] Git push to monisayshs/texttospeechh.com main branch complete!")
