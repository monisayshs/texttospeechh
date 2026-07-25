import os
import shutil

SOURCE_DIR = os.path.dirname(os.path.abspath(__file__))
DEST_BASE = r"C:\Users\Admin\Desktop\TextToSpeechH_AI_Workflow"
CODEBASE_DEST = os.path.join(DEST_BASE, "Project_Codebase")
REPORTS_DEST = os.path.join(DEST_BASE, "Documentation_And_Reports")

print("=========================================================")
print("CREATING WORKFLOW FOLDER ON LAPTOP DESKTOP")
print("=========================================================\n")

os.makedirs(CODEBASE_DEST, exist_ok=True)
os.makedirs(REPORTS_DEST, exist_ok=True)

# Copy Codebase
print("1. Copying full project codebase to Desktop workflow folder...")
for item in os.listdir(SOURCE_DIR):
    if item in ['.git', 'node_modules', '.next']:
        continue
    src_item = os.path.join(SOURCE_DIR, item)
    dst_item = os.path.join(CODEBASE_DEST, item)
    if os.path.isdir(src_item):
        shutil.copytree(src_item, dst_item, dirs_exist_ok=True)
    else:
        shutil.copy2(src_item, dst_item)

print(f"   [OK] Codebase copied to: {CODEBASE_DEST}")

# Copy Walkthrough & Reports
WALKTHROUGH_SRC = r"C:\Users\Admin\.gemini\antigravity-ide\brain\632a1195-b07f-4597-bcc8-ee13a5c55a40\walkthrough.md"
if os.path.exists(WALKTHROUGH_SRC):
    shutil.copy2(WALKTHROUGH_SRC, os.path.join(REPORTS_DEST, "Master_Workflow_walkthrough.md"))
    print(f"   [OK] Master Walkthrough copied to: {os.path.join(REPORTS_DEST, 'Master_Workflow_walkthrough.md')}")

readme_src = os.path.join(SOURCE_DIR, "README.md")
if os.path.exists(readme_src):
    shutil.copy2(readme_src, os.path.join(REPORTS_DEST, "Deployment_README.md"))

print(f"\n>>> WORKFLOW FOLDER CREATED SUCCESSFULLY AT: {DEST_BASE} <<<")
