import os
import subprocess

PROJECT_DIR = os.path.dirname(os.path.abspath(__file__))

env = os.environ.copy()

print("1. Git status check...")
status_res = subprocess.run(["git", "status"], cwd=PROJECT_DIR, capture_output=True, text=True, env=env)
print("Git Status Output:\n", status_res.stdout)

print("2. Staging all changes...")
subprocess.run(["git", "add", "."], cwd=PROJECT_DIR, env=env)

print("3. Committing pillar page updates...")
commit_msg = "feat(seo): Add Text to Speech master pillar page /text-to-speech, spokes, and blog hub"
commit_res = subprocess.run(["git", "commit", "-m", commit_msg], cwd=PROJECT_DIR, capture_output=True, text=True, env=env)
print("Commit STDOUT:\n", commit_res.stdout)
print("Commit STDERR:\n", commit_res.stderr)

print("4. Getting latest commit hash...")
hash_res = subprocess.run(["git", "rev-parse", "HEAD"], cwd=PROJECT_DIR, capture_output=True, text=True, env=env)
commit_hash = hash_res.stdout.strip()
print(f"LATEST COMMIT HASH: {commit_hash}")

print("5. Pushing to GitHub origin main...")
push_res = subprocess.run(["git", "push", "origin", "main"], cwd=PROJECT_DIR, capture_output=True, text=True, env=env)
print("Push STDOUT:\n", push_res.stdout)
print("Push STDERR:\n", push_res.stderr)

if push_res.returncode == 0:
    print("SUCCESSFULLY PUSHED TO GITHUB MAIN!")
else:
    print("PUSH FAILED!")
