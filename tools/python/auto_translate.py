import os
import json
import re
import urllib.request
import urllib.error

# 台灣在地化資工技術名詞對照表
TERM_MAPPING = {
    "Repository": "儲存庫 / 專案儲存庫",
    "Plan": "實作計畫",
    "Walkthrough": "工作歷程 / 導覽",
    "Task": "任務 / 工作項目",
    "Code": "程式碼 / 原始碼",
    "Build": "建置 / 編譯",
    "Database": "資料庫",
    "Network": "網路",
    "Internet": "網際網路",
    "Software": "軟體",
    "Program": "程式 / 應用程式",
    "Context": "上下文",
    "Project": "專案",
    "Client": "用戶端",
    "Server": "伺服器",
    "App": "應用程式 / App",
    "Application": "應用程式 / App",
    "User": "使用者",
    "Member": "成員",
    "Channel": "頻道",
    "Message": "訊息",
    "Guild": "伺服器",
    "Bot": "機器人",
    "Permission": "權限",
    "Role": "身分組"
}

SYSTEM_PROMPT = f"""
你是一位專業的技術翻譯大師。請將以下 Discord API 的 MDX 說明文件翻譯成高品質的「台灣繁體中文 (Traditional Chinese, Taiwan)」。
必須遵循以下規則：
1. 使用台灣資工與軟體工程界的標準技術用語，嚴禁簡轉繁不自然的中國用語。
   對照表參考：
   - Repository -> 儲存庫 / 專案儲存庫
   - Plan -> 實作計畫
   - Walkthrough -> 工作歷程 / 導覽
   - Task -> 任務 / 工作項目
   - Code -> 程式碼
   - Build -> 建置 / 編譯
   - Database -> 資料庫
   - Network / Internet -> 網路 / 網際網路
   - Software / Program -> 軟體 / 程式
   - Context -> 上下文
   - Project -> 專案
   - Client / Server -> 用戶端 / 伺服器
   - App / Application -> 應用程式 / App
   - User / Member -> 使用者 / 成員
   - Channel / Message -> 頻道 / 訊息
   - Guild -> 伺服器
   - Bot -> 機器人
   - Permission / Role -> 權限 / 身分組
2. 保持 MDX 標籤、程式碼區塊（code blocks）及 HTML 元件（如 <Info>, <Warning>, <Accordion> 等）的結構原封不動，只翻譯內部的文字內容。
3. 內文中的內部連結（如 `/developers/en-us/...`）翻譯後應改為指向對應的繁中路徑（如 `/developers/zh-tw/...`）。
4. 輸出僅包含翻譯後的 MDX 內容，不要包含任何額外的解釋或 Markdown 外框。
"""

def call_gemini(api_key, text):
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
    payload = {
        "contents": [{
            "parts": [{
                "text": f"{SYSTEM_PROMPT}\n\n請翻譯以下內容：\n\n{text}"
            }]
        }]
    }
    
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode('utf-8'),
        headers={'Content-Type': 'application/json'},
        method='POST'
    )
    
    try:
        with urllib.request.urlopen(req) as response:
            res_data = json.loads(response.read().decode('utf-8'))
            translated_text = res_data['candidates'][0]['content']['parts'][0]['text']
            return translated_text.strip()
    except urllib.error.HTTPError as e:
        print(f"API 請求失敗: {e.code} - {e.read().decode('utf-8')}")
        raise e
    except Exception as e:
        print(f"發送請求時發生錯誤: {e}")
        raise e

def process_translation(api_key, page_path):
    print(f"\n正在處理: {page_path}")
    en_file_path = page_path + ".mdx"
    if not os.path.exists(en_file_path):
        en_file_path = page_path + ".md"
        if not os.path.exists(en_file_path):
            print(f"找不到英文實體檔案: {page_path}")
            return False
            
    with open(en_file_path, "r", encoding="utf-8") as f:
        content = f.read()
        
    # 解析 Frontmatter
    match = re.match(r"^---\r?\n(.*?)\r?\n---\r?\n(.*)$", content, re.DOTALL)
    if not match:
        print(f"未找到 Frontmatter: {en_file_path}")
        return False
        
    frontmatter = match.group(1)
    body = match.group(2)
    
    # 翻譯正文
    print("正在呼叫 Gemini API 進行繁中翻譯...")
    translated_body = call_gemini(api_key, body)
    
    # 建立目錄
    zhtw_dir = os.path.dirname(page_path.replace("developers/en-us/", "developers/zh-tw/", 1))
    bi_dir = os.path.dirname(page_path.replace("developers/en-us/", "developers/bilingual/", 1))
    os.makedirs(zhtw_dir, exist_ok=True)
    os.makedirs(bi_dir, exist_ok=True)
    
    # 生成繁中與雙語路徑
    zhtw_path = page_path.replace("developers/en-us/", "developers/zh-tw/", 1) + ".mdx"
    bi_path = page_path.replace("developers/en-us/", "developers/bilingual/", 1) + ".mdx"
    
    # 1. 寫入繁中版
    # 提取 Frontmatter 中的標題與說明並翻譯（簡單的 regex）
    title_match = re.search(r'title:\s*["\']?(.*?)["\']?\s*\n', frontmatter)
    desc_match = re.search(r'description:\s*["\']?(.*?)["\']?\s*\n', frontmatter)
    sidebar_match = re.search(r'sidebarTitle:\s*["\']?(.*?)["\']?\s*\n', frontmatter)
    
    title = title_match.group(1) if title_match else "Documentation"
    desc = desc_match.group(1) if desc_match else ""
    sidebar = sidebar_match.group(1) if sidebar_match else title
    
    # 翻譯 Frontmatter 的欄位
    print("正在翻譯 Frontmatter...")
    translated_title = call_gemini(api_key, f"請將此說明文件標題翻譯為台灣繁體中文（只回傳翻譯結果）：{title}")
    translated_desc = call_gemini(api_key, f"請將此說明文件簡短敘述翻譯為台灣繁體中文（只回傳翻譯結果）：{desc}") if desc else ""
    translated_sidebar = call_gemini(api_key, f"請將此說明文件側邊欄標題翻譯為台灣繁體中文（只回傳翻譯結果）：{sidebar}") if sidebar_match else translated_title
    
    zhtw_frontmatter = f"---\ntitle: \"{translated_title}\"\n"
    if sidebar_match:
        zhtw_frontmatter += f"sidebarTitle: \"{translated_sidebar}\"\n"
    if desc:
        zhtw_frontmatter += f"description: \"{translated_desc}\"\n"
    zhtw_frontmatter += "---\n"
    
    zhtw_content = f"{zhtw_frontmatter}\nimport {{ LanguageSelector }} from '/snippets/LanguageSelector.jsx'\n\n<LanguageSelector current=\"zh-tw\" path=\"/{page_path.replace('developers/en-us/', 'developers/zh-tw/', 1)}\" />\n\n{translated_body}\n"
    with open(zhtw_path, "w", encoding="utf-8") as f:
        f.write(zhtw_content)
    print(f"✅ 繁中版建立成功: {zhtw_path}")
    
    # 2. 寫入雙語對照版 (採用 grid 雙欄結構)
    bi_frontmatter = f"---\ntitle: \"{title} (雙語/Bilingual)\"\n"
    if sidebar_match:
        bi_frontmatter += f"sidebarTitle: \"{sidebar} (雙語)\"\n"
    if desc:
        bi_frontmatter += f"description: \"{desc}\"\n"
    bi_frontmatter += "---\n"
    
    # 格式化雙語 body
    bi_body = f"""<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
<div>

<div style={{{{ borderBottom: "2px solid #5865f2", paddingBottom: "8px", marginBottom: "16px", fontWeight: "bold", fontSize: "18px" }}}}>🇬🇧 English</div>

{body.strip()}

</div>

<div>

<div style={{{{ borderBottom: "2px solid #5865f2", paddingBottom: "8px", marginBottom: "16px", fontWeight: "bold", fontSize: "18px" }}}}>🇹🇼 繁體中文</div>

{translated_body.strip()}

</div>
</div>"""
    
    bi_content = f"{bi_frontmatter}\nimport {{ LanguageSelector }} from '/snippets/LanguageSelector.jsx'\n\n<LanguageSelector current=\"bilingual\" path=\"/{page_path.replace('developers/en-us/', 'developers/bilingual/', 1)}\" />\n\n{bi_body}\n"
    with open(bi_path, "w", encoding="utf-8") as f:
        f.write(bi_content)
    print(f"✅ 雙語版建立成功: {bi_path}")
    
    # 3. 更新原英文版以引入 LanguageSelector（如果尚未引入）
    if "LanguageSelector" not in content:
        # 在 Frontmatter 結束後插入 LanguageSelector
        new_en_content = f"{match.group(1)}---\n\nimport {{ LanguageSelector }} from '/snippets/LanguageSelector.jsx'\n\n<LanguageSelector current=\"en\" path=\"/{page_path}\" />\n\n{body}"
        # 重新包裝 Frontmatter
        new_en_content = f"---\n{new_en_content}"
        with open(en_file_path, "w", encoding="utf-8") as f:
            f.write(new_en_content)
        print(f"✅ 英文原版已整合 LanguageSelector")
        
    return True

def main():
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("錯誤: 請先設定 GEMINI_API_KEY 環境變數。")
        print("例如: export GEMINI_API_KEY=\"AIzaSy...\"")
        return
        
    progress_file = "docs/translation_progress.json"
    if not os.path.exists(progress_file):
        print("未找到進度檔案，請先執行: python3 tools/python/init_progress.py")
        return
        
    with open(progress_file, "r", encoding="utf-8") as f:
        progress = json.load(f)
        
    completed = progress.get("completed_pages", {})
    
    # 讀取 docs.json 獲取全部英文頁面
    with open("docs.json", "r", encoding="utf-8") as f:
        docs_config = json.load(f)
        
    from init_progress import parse_navigation_pages
    all_pages = parse_navigation_pages(docs_config)
    en_pages = sorted([p for p in all_pages if p.startswith("developers/en-us/")])
    todo_pages = [p for p in en_pages if p not in completed]
    
    print(f"發現待處理頁面數: {len(todo_pages)}")
    if not todo_pages:
        print("所有頁面皆已完成翻譯！")
        return
        
    # 提供手動批次執行或逐個執行的選項
    print("\n[待翻譯的前 10 個頁面]:")
    for idx, p in enumerate(todo_pages[:10]):
        print(f"  {idx + 1}. {p}")
        
    try:
        choice = input("\n請輸入要翻譯的數量 (例如: 1 代表只翻譯第 1 個；或輸入 'all' 翻譯全部)：").strip()
    except KeyboardInterrupt:
        return
        
    pages_to_translate = []
    if choice.lower() == 'all':
        pages_to_translate = todo_pages
    else:
        try:
            num = int(choice)
            pages_to_translate = todo_pages[:num]
        except ValueError:
            print("無效輸入，退出。")
            return
            
    success_count = 0
    for page in pages_to_translate:
        try:
            success = process_translation(api_key, page)
            if success:
                completed[page] = {
                    "status": "completed",
                    "translated_at": "auto_translate_script"
                }
                success_count += 1
                # 每次翻譯成功後存檔
                progress["completed_pages"] = completed
                with open(progress_file, "w", encoding="utf-8") as f:
                    json.dump(progress, f, indent=2, ensure_ascii=False)
            # 遵守免費 Key 的 Rate Limit (每分鐘最多 15 次，大約 4 秒一次)
            import time
            time.sleep(4)
        except Exception as e:
            print(f"處理 {page} 時發生錯誤，跳過: {e}")
            
    print(f"\n工作完成！本次成功翻譯並生成了 {success_count} 個頁面的三語系架構！")
    
    # 提醒同步 docs.json
    print("\n提示: 翻譯完新頁面後，請在本地執行 restructure_docs_json.py 來自動在 docs.json 中註冊新頁面：")
    print("  python3 tools/python/restructure_docs_json.py")

if __name__ == "__main__":
    main()
