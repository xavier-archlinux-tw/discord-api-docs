import os

def add_selector():
    target_dir = "developers/en-us/activities/development-guides"
    if not os.path.exists(target_dir):
        print("目錄不存在！")
        return
        
    for file in os.listdir(target_dir):
        if file.endswith(".mdx"):
            file_path = os.path.join(target_dir, file)
            name_without_ext = os.path.splitext(file)[0]
            
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()
                
            selector_str = f"\n\nimport {{ LanguageSelector }} from '/snippets/LanguageSelector.jsx'\n\n<LanguageSelector current=\"en\" path=\"/developers/en-us/activities/development-guides/{name_without_ext}\" />\n"
            
            # 找到第二個 ---
            parts = content.split("---", 2)
            if len(parts) >= 3:
                # 檢查是否已經有 LanguageSelector
                if "LanguageSelector" not in parts[2]:
                    parts[2] = selector_str + parts[2]
                    new_content = "---" + parts[1] + "---" + parts[2]
                    with open(file_path, "w", encoding="utf-8") as f:
                        f.write(new_content)
                    print(f"已為 {file} 新增 LanguageSelector")
                else:
                    print(f"{file} 已經有 LanguageSelector，跳過")

if __name__ == "__main__":
    add_selector()
