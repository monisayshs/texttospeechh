import os
import subprocess

PROJECT_DIR = os.path.dirname(os.path.abspath(__file__))

env = os.environ.copy()
env.pop('GITHUB_TOKEN', None)
env.pop('GH_TOKEN', None)

gh_exe = r"C:\Program Files\GitHub CLI\gh.exe"

print("1. Renaming GitHub repository from 'texttospeechh.com' to 'texttospeechh'...")
cmd = [gh_exe, "api", "-X", "PATCH", "repos/monisayshs/texttospeechh.com", "-f", "name=texttospeechh"]

res = subprocess.run(cmd, capture_output=True, text=True, cwd=PROJECT_DIR, env=env)
print("Returncode:", res.returncode)
print("Stdout:", res.stdout[:200] if res.stdout else "Empty")
print("Stderr:", res.stderr if res.stderr else "None")

if res.returncode == 0 or "texttospeechh" in res.stdout:
    print("   [OK] GitHub Repository successfully renamed to 'texttospeechh'!")

print("2. Updating local git remote...")
remote_cmd = ["git", "remote", "set-url", "origin", "https://github.com/monisayshs/texttospeechh.git"]
r_res = subprocess.run(remote_cmd, capture_output=True, text=True, cwd=PROJECT_DIR, env=env)
print("Remote result:", r_res.stdout, r_res.stderr)

v_res = subprocess.run(["git", "remote", "-v"], capture_output=True, text=True, cwd=PROJECT_DIR, env=env)
print("Git remotes:\n", v_res.stdout)
