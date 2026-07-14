import json
import os

def parse_navigation_pages(nav_data):
    pages = []
    def extract(item):
        if isinstance(item, str):
            pages.append(item)
        elif isinstance(item, dict):
            if "pages" in item:
                for p in item["pages"]:
                    extract(p)
            if "groups" in item:
                for g in item["groups"]:
                    extract(g)
    if "navigation" in nav_data:
        if "tabs" in nav_data["navigation"]:
            for tab in nav_data["navigation"]["tabs"]:
                if "pages" in tab:
                    for p in tab["pages"]:
                        extract(p)
                if "groups" in tab:
                    for g in tab["groups"]:
                        extract(g)
    return list(set(pages))

def main():
    docs_json = "docs.json"
    progress_file = "docs/translation_progress.json"
    
    if not os.path.exists(docs_json):
        print("找不到 docs.json")
        return
        
    with open(docs_json, "r", encoding="utf-8") as f:
        config = json.load(f)
        
    all_pages = parse_navigation_pages(config)
    # 只篩選以 developers/en-us/ 開頭的頁面
    en_pages = [p for p in all_pages if p.startswith("developers/en-us/")]
    
    # 讀取現有進度
    progress = {"completed_pages": {}, "failed_pages": {}}
    if os.path.exists(progress_file):
        try:
            with open(progress_file, "r", encoding="utf-8") as f:
                progress = json.load(f)
        except Exception:
            pass
            
    completed = progress.get("completed_pages", {})
    
    # 自動掃描實體檔案是否已存在於 zh-tw 與 bilingual，如果是，且沒有在進度中，就將其自動標記為已完成
    scanned_count = 0
    for page in en_pages:
        if page in completed:
            continue
            
        zhtw_path = page.replace("developers/en-us/", "developers/zh-tw/", 1) + ".mdx"
        bi_path = page.replace("developers/en-us/", "developers/bilingual/", 1) + ".mdx"
        
        # 若以 .md 存在也算
        if not os.path.exists(zhtw_path):
            zhtw_path = zhtw_path.replace(".mdx", ".md")
        if not os.path.exists(bi_path):
            bi_path = bi_path.replace(".mdx", ".md")
            
        if os.path.exists(zhtw_path) and os.path.exists(bi_path):
            completed[page] = {
                "status": "completed",
                "translated_at": "auto_detected"
            }
            scanned_count += 1
            
    progress["completed_pages"] = completed
    
    # 計算未完成的檔案
    todo_pages = [p for p in en_pages if p not in completed]
    
    os.makedirs(os.path.dirname(progress_file), exist_ok=True)
    with open(progress_file, "w", encoding="utf-8") as f:
        json.dump(progress, f, indent=2, ensure_ascii=False)
        
    print(f"進度初始化成功！")
    print(f"總頁面數: {len(en_pages)}")
    print(f"已完成頁面數: {len(completed)} (本次自動偵測到已存在的檔案: {scanned_count})")
    print(f"待處理頁面數: {len(todo_pages)}")
    
    # 列出前 10 個待處理的檔案
    if todo_pages:
        print("\n前 10 個待翻譯頁面:")
        for p in todo_pages[:10]:
            print(f"  - {p}")

if __name__ == "__main__":
    main()
