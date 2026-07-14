import os
import re

workspace_dir = "."
developers_dir = os.path.join(workspace_dir, "developers")

mismatches = []
imports = []

# Scan for LanguageSelector paths
for root, dirs, files in os.walk(developers_dir):
    for file in files:
        if file.endswith(".mdx"):
            file_path = os.path.join(root, file)
            rel_path = os.path.relpath(file_path, workspace_dir).replace("\\", "/")
            
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()
            
            # Check for content imports
            if "import Content from" in content:
                imports.append((rel_path, file_path))
                
            # Check for LanguageSelector tag
            match = re.search(r'<LanguageSelector\s+[^>]*path=["\']([^"\']+)["\']', content)
            if match:
                selector_path = match.group(1)
                # Compute expected path from file path (stripping extension)
                expected_suffix = rel_path.replace("developers/", "/developers/").replace(".mdx", "")
                if selector_path != expected_suffix:
                    mismatches.append({
                        "file": rel_path,
                        "selector_path": selector_path,
                        "expected_path": expected_suffix
                    })

print("=== Mismatches in hardcoded LanguageSelector path ===")
for m in mismatches:
    print(f"File: {m['file']}")
    print(f"  Selector: {m['selector_path']}")
    print(f"  Expected: {m['expected_path']}\n")

print("\n=== Content Wrapper Files (Imports) ===")
for imp in imports:
    print(f"Wrapper: {imp[0]}")
