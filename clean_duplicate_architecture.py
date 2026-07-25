import os
import shutil

PROJECT_DIR = os.path.dirname(os.path.abspath(__file__))

print("=========================================================")
print("TEXTTOSPEECHH AI - ARCHITECTURAL CLEANUP & DE-DUPLICATION")
print("=========================================================\n")

deleted_files = []

# 1. Remove legacy root services/ directory if present
legacy_services_dir = os.path.join(PROJECT_DIR, 'services')
if os.path.exists(legacy_services_dir):
    shutil.rmtree(legacy_services_dir)
    print("   [DELETED] Removed legacy duplicate folder 'services/'")
    deleted_files.append("services/")

# 2. Remove legacy root providers/ directory if present
legacy_providers_dir = os.path.join(PROJECT_DIR, 'providers')
if os.path.exists(legacy_providers_dir):
    shutil.rmtree(legacy_providers_dir)
    print("   [DELETED] Removed legacy duplicate folder 'providers/'")
    deleted_files.append("providers/")

print(f"\n   Total Legacy Duplicate Folders Removed: {len(deleted_files)}")
print("   [OK] Unified Architecture Enforced (src/services & src/providers)")
