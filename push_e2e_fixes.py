import os
import subprocess

PROJECT_DIR = os.path.dirname(os.path.abspath(__file__))

env = os.environ.copy()
env.pop('GITHUB_TOKEN', None)
env.pop('GH_TOKEN', None)

print("1. Adding updated files to Git index...")
subprocess.run(["git", "add", "."], cwd=PROJECT_DIR, env=env)

print("2. Committing serverless architecture & multipart fixes...")
commit_res = subprocess.run(["git", "commit", "-m", "Fix: Serverless /tmp queue persistence, multipart boundary extraction, and Vercel API routing"], cwd=PROJECT_DIR, capture_output=True, text=True, env=env)
print("Commit output:", commit_res.stdout)

print("3. Pushing to GitHub main branch...")
push_res = subprocess.run(["git", "push", "-u", "origin", "main"], cwd=PROJECT_DIR, capture_output=True, text=True, env=env)
print("Push stdout:", push_res.stdout)
print("Push stderr:", push_res.stderr)

assert push_res.returncode == 0, "Git push must succeed"
print("   [OK] Git push complete!")
