import os

def fix_imports():
    langs = ["en-us", "zh-tw", "bilingual"]
    base_dir = "developers"
    
    count = 0
    for lang in langs:
        lang_dir = os.path.join(base_dir, lang)
        if not os.path.exists(lang_dir):
            continue
            
        for root, _, files in os.walk(lang_dir):
            for file in files:
                if file.endswith(".mdx"):
                    file_path = os.path.join(root, file)
                    with open(file_path, "r", encoding="utf-8") as f:
                        content = f.read()
                        
                    old_import = "/snippets/discord-social-sdk/"
                    new_import = f"/snippets/{lang}/discord-social-sdk/"
                    
                    if old_import in content:
                        updated_content = content.replace(old_import, new_import)
                        with open(file_path, "w", encoding="utf-8") as f:
                            f.write(updated_content)
                        print(f"[{lang}] 已修復導入路徑: {file_path}")
                        count += 1
                        
    print(f"修復完成！共更新了 {count} 個檔案。")

if __name__ == "__main__":
    fix_imports()
