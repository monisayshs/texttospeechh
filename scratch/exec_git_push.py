import subprocess

try:
    add_out = subprocess.check_output(["git", "add", "."], text=True, stderr=subprocess.STDOUT)
    print("GIT ADD:", add_out)
    
    commit_out = subprocess.check_output(["git", "commit", "-m", "fix(seo): escape backticks in textToSpeechPillar.js to resolve Vercel SyntaxError"], text=True, stderr=subprocess.STDOUT)
    print("GIT COMMIT:", commit_out)

    push_out = subprocess.check_output(["git", "push", "origin", "main"], text=True, stderr=subprocess.STDOUT)
    print("GIT PUSH:", push_out)
except subprocess.CalledProcessError as e:
    print("Git Command Error Output:", e.output)
except Exception as e:
    print("Git General Exception:", e)
