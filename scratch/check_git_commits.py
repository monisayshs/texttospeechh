import subprocess
import json

def get_git_status():
    try:
        log = subprocess.check_output(['git', 'log', '-n', '5', '--oneline'], text=True)
        print("=== GIT LOG ===")
        print(log)
        
        status = subprocess.check_output(['git', 'status', '--short'], text=True)
        print("=== GIT STATUS ===")
        print(status if status else "Clean working tree")
    except Exception as e:
        print("Git error:", e)

get_git_status()
