import json
import os

# 定義英文群組名稱到「繁體中文 (英文)」雙語名稱的對照表
GROUP_TRANSLATIONS = {
    "Fundamentals": "開發基礎 (Fundamentals)",
    "App Fundamentals": "應用程式基礎 (App Fundamentals)",
    "Getting Started": "開始使用 (Getting Started)",
    "Core Features": "核心功能 (Core Features)",
    "Voice & Video": "語音與視訊 (Voice & Video)",
    "Social Features": "社群功能 (Social Features)",
    "Overlay & Game Invites": "覆蓋圖層與遊戲邀請 (Overlay & Game Invites)",
    "Lobbies & Networking": "大廳與網路通訊 (Lobbies & Networking)",
    "Development Guides": "開發指南 (Development Guides)",
    "Discord Activities": "互動活動概述 (Discord Activities)",
    "Monetization": "營利機制 (Monetization)",
    "Discovery": "探索發現 (Discovery)",
    "Best Practices": "最佳實踐 (Best Practices)",
    "Building on Discord": "在 Discord 上建置 (Building on Discord)",
    "Communities & Servers": "社群與伺服器 (Communities & Servers)",
    "Building Games": "建置遊戲 (Building Games)"
}

def restructure():
    docs_path = "docs.json"
    if not os.path.exists(docs_path):
        print("docs.json 不存在！")
        return

    with open(docs_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    tabs = data.get("navigation", {}).get("tabs", [])
    
    for tab in tabs:
        pages_key = "pages" if "pages" in tab else "groups"
        items = tab.get(pages_key, [])
        
        # 1. 移除先前添加的舊 "Language Variants" 或是 "__lang__" 群組
        filtered_items = []
        for item in items:
            if isinstance(item, dict):
                group_name = item.get("group", "")
                if group_name in ["Language Variants", "__lang__", ""] and item.get("hidden"):
                    continue
            filtered_items.append(item)
            
        # 2. 遍歷當前 tab 的所有正常群組，為它們建立對應的雙語 hidden 群組
        new_hidden_groups = []
        for item in filtered_items:
            if isinstance(item, dict) and "group" in item:
                orig_group_name = item["group"]
                # 收集該群組下所有 en-us 頁面
                en_pages = item.get("pages", [])
                
                zh_pages = []
                bi_pages = []
                for p in en_pages:
                    if isinstance(p, str) and "en-us" in p:
                        zh_p = p.replace("/en-us/", "/zh-tw/")
                        bi_p = p.replace("/en-us/", "/bilingual/")
                        
                        if os.path.exists(zh_p + ".mdx"):
                            zh_pages.append(zh_p)
                        if os.path.exists(bi_p + ".mdx"):
                            bi_pages.append(bi_p)
                            
                lang_pages = zh_pages + bi_pages
                if lang_pages:
                    translated_group_name = GROUP_TRANSLATIONS.get(orig_group_name, f"{orig_group_name} (zh-tw)")
                    new_hidden_groups.append({
                        "group": translated_group_name,
                        "hidden": True,
                        "pages": lang_pages
                    })
                    
        # 3. 將生成的所有新 hidden 群組加入到 tab 的選單末尾
        tab[pages_key] = filtered_items + new_hidden_groups
        print(f"Tab '{tab.get('tab')}' 已重構：新增了 {len(new_hidden_groups)} 個雙語 hidden 群組。")

    with open(docs_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        
    print("\n🎉 docs.json 結構重組完成！")

if __name__ == "__main__":
    restructure()
