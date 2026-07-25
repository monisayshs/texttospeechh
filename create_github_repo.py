import os
import subprocess

PROJECT_DIR = os.path.dirname(os.path.abspath(__file__))

env = os.environ.copy()
env.pop('GITHUB_TOKEN', None)
env.pop('GH_TOKEN', None)

print("Creating GitHub repository 'texttospeechh.com'...")

# Run gh auth login status first
gh_exe = r"C:\Program Files\GitHub CLI\gh.exe"
cmd = [gh_exe, "repo", "create", "texttospeechh.com", "--public", "--source=.", "--remote=origin", "--push"]

res = subprocess.run(cmd, capture_output=True, text=True, cwd=PROJECT_DIR, env=env)
print("Returncode:", res.returncode)
print("Stdout:", res.stdout)
print("Stderr:", res.stderr)
