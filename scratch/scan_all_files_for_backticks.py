import os
import re

def scan_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    lines = content.split('\n')
    in_template = False
    template_start_line = 0
    issues = []

    for idx, line in enumerate(lines, 1):
        # Count unescaped backticks in line
        # Regex to find backticks not preceded by backslash
        backticks = [m.start() for m in re.finditer(r'(?<!\\)`', line)]
        if backticks:
            for pos in backticks:
                if not in_template:
                    in_template = True
                    template_start_line = idx
                else:
                    in_template = False

    if in_template:
        print(f"UNCLOSED TEMPLATE LITERAL DETECTED in {file_path} starting near line {template_start_line}!")

files_to_scan = []
for root, dirs, files in os.walk('.'):
    if 'node_modules' in root or '.git' in root:
        continue
    for file in files:
        if file.endswith('.js'):
            files_to_scan.append(os.path.join(root, file))

print(f"Scanning {len(files_to_scan)} JS files...")
for f in files_to_scan:
    scan_file(f)

print("Scan complete.")
