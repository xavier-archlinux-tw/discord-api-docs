import json
import os

def map_path_to_en(item):
    if isinstance(item, str):
        if item.startswith("developers/") and not any(x in item for x in ["/en-us/", "/zh-tw/", "/bilingual/"]):
            return item.replace("developers/", "developers/en-us/", 1)
        return item
    elif isinstance(item, dict):
        new_item = item.copy()
        if "pages" in item:
            new_item["pages"] = [map_path_to_en(p) for p in item["pages"]]
        if "groups" in item:
            new_item["groups"] = [map_path_to_en(g) for g in item["groups"]]
        return new_item
    return item

def map_path_to_lang(item, lang):
    if isinstance(item, str):
        # 替換 developers/en-us/ 為 developers/lang/
        return item.replace("developers/en-us/", f"developers/{lang}/", 1)
    elif isinstance(item, dict):
        new_item = item.copy()
        if "pages" in item:
            new_item["pages"] = [map_path_to_lang(p, lang) for p in item["pages"]]
        if "groups" in item:
            new_item["groups"] = [map_path_to_lang(g, lang) for g in item["groups"]]
        return new_item
    return item

def main():
    docs_json_path = "docs.json"
    if not os.path.exists(docs_json_path):
        print("找不到 docs.json")
        return
        
    with open(docs_json_path, "r", encoding="utf-8") as f:
        config = json.load(f)
        
    if "navigation" not in config or "tabs" not in config["navigation"]:
        print("docs.json 格式不符合預期")
        return
        
    orig_tabs = config["navigation"]["tabs"]
    
    # 只保留原始英文 Tabs，並將路徑重組為 en-us/
    en_tabs = []
    for tab in orig_tabs:
        title = tab.get("tab", "")
        if "繁中" not in title and "雙語" not in title:
            new_tab = tab.copy()
            if "pages" in tab:
                new_tab["pages"] = [map_path_to_en(p) for p in tab["pages"]]
            if "groups" in tab:
                new_tab["groups"] = [map_path_to_en(g) for g in tab["groups"]]
            en_tabs.append(new_tab)
            
    config["navigation"]["tabs"] = en_tabs
    
    with open(docs_json_path, "w", encoding="utf-8") as f:
        json.dump(config, f, indent=2, ensure_ascii=False)
        
    print("docs.json 結構重組完成 (已移除繁中/雙語的 Tab 導覽)！")

if __name__ == "__main__":
    main()
