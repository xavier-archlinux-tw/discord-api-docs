import fs from "fs";
import path from "path";

// Audit both developers and snippets directories
const TARGET_PAIRS = [
  {
    en: "./developers/en-us",
    zh: "./developers/zh-tw",
    bi: "./developers/bilingual",
  },
  {
    en: "./snippets/en-us",
    zh: "./snippets/zh-tw",
    bi: "./snippets/bilingual",
  },
];

function walk(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(fullPath));
    } else if (file.endsWith(".mdx") || file.endsWith(".md")) {
      results.push(fullPath);
    }
  });
  return results;
}

function parseFile(filePath) {
  if (!fs.existsSync(filePath)) return null;
  const content = fs.readFileSync(filePath, "utf8");

  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  const headings = [];
  let match;
  while ((match = headingRegex.exec(content)) !== null) {
    headings.push({
      level: match[1].length,
      text: match[2].trim(),
    });
  }

  const codeBlockRegex = /```[a-z]*/g;
  const codeBlocksCount = (content.match(codeBlockRegex) || []).length / 2;

  const imgRegex = /!\[.*?\]\(.*?\)/g;
  const imagesCount = (content.match(imgRegex) || []).length;

  const infoCount = (content.match(/<Info>/g) || []).length;
  const warningCount = (content.match(/<Warning>/g) || []).length;
  const tabsCount = (content.match(/<Tabs>/g) || []).length;
  const tabCount = (content.match(/<Tab\s+/g) || []).length;
  const cardCount = (content.match(/<Card\s+/g) || []).length;

  return {
    headings,
    codeBlocksCount,
    imagesCount,
    infoCount,
    warningCount,
    tabsCount,
    tabCount,
    cardCount,
    contentLength: content.length,
  };
}

function runAudit() {
  const fullReport = [];
  const existingDiscrepancies = [];
  let totalEnFiles = 0;

  TARGET_PAIRS.forEach(({ en: enDir, zh: zhDir, bi: biDir }) => {
    const enFiles = walk(enDir);
    totalEnFiles += enFiles.length;

    enFiles.forEach((enPath) => {
      const relPath = path.relative(enDir, enPath);
      const zhPath = path.join(zhDir, relPath);
      const biPath = path.join(biDir, relPath);

      const enData = parseFile(enPath);
      const zhData = parseFile(zhPath);
      const biData = parseFile(biPath);

      // Label path to distinguish between developers/ and snippets/
      const displayPath = path
        .join(path.basename(enDir) === "en-us" ? path.basename(path.dirname(enDir)) : "", relPath)
        .replace(/\\/g, "/");
      const fileReport = {
        relPath: displayPath,
        zhExists: !!zhData,
        biExists: !!biData,
        issues: [],
      };

      if (zhData) {
        if (zhData.headings.length < enData.headings.length) {
          fileReport.issues.push(
            `zh-tw has fewer headings than en-us (${zhData.headings.length} vs ${enData.headings.length})`,
          );
        }
        if (zhData.codeBlocksCount < enData.codeBlocksCount) {
          fileReport.issues.push(
            `zh-tw has fewer code blocks than en-us (${zhData.codeBlocksCount} vs ${enData.codeBlocksCount})`,
          );
        }
        if (zhData.imagesCount < enData.imagesCount) {
          fileReport.issues.push(`zh-tw has fewer images than en-us (${zhData.imagesCount} vs ${enData.imagesCount})`);
        }
        if (zhData.infoCount < enData.infoCount) {
          fileReport.issues.push(
            `zh-tw has fewer <Info> boxes than en-us (${zhData.infoCount} vs ${enData.infoCount})`,
          );
        }
        if (zhData.warningCount < enData.warningCount) {
          fileReport.issues.push(
            `zh-tw has fewer <Warning> boxes than en-us (${zhData.warningCount} vs ${enData.warningCount})`,
          );
        }
      } else {
        fileReport.issues.push("Missing zh-tw translation file");
      }

      if (biData) {
        if (biData.headings.length < enData.headings.length) {
          fileReport.issues.push(
            `bilingual has fewer headings than en-us (${biData.headings.length} vs ${enData.headings.length})`,
          );
        }
        if (biData.codeBlocksCount < enData.codeBlocksCount) {
          fileReport.issues.push(
            `bilingual has fewer code blocks than en-us (${biData.codeBlocksCount} vs ${enData.codeBlocksCount})`,
          );
        }
        if (biData.imagesCount < enData.imagesCount) {
          fileReport.issues.push(
            `bilingual has fewer images than en-us (${biData.imagesCount} vs ${enData.imagesCount})`,
          );
        }
      } else {
        fileReport.issues.push("Missing bilingual translation file");
      }

      if (fileReport.issues.length > 0) {
        fullReport.push(fileReport);

        const hasActualDiscrepancy =
          (zhData && fileReport.issues.some((i) => i.startsWith("zh-tw"))) ||
          (biData && fileReport.issues.some((i) => i.startsWith("bilingual")));

        if (hasActualDiscrepancy) {
          existingDiscrepancies.push({
            relPath: displayPath,
            zhExists: !!zhData,
            biExists: !!biData,
            issues: fileReport.issues.filter((i) => !i.includes("Missing")),
          });
        }
      }
    });
  });

  if (!fs.existsSync("./docs")) {
    fs.mkdirSync("./docs");
  }
  fs.writeFileSync("./docs/audit_report.json", JSON.stringify(fullReport, null, 2), "utf8");

  console.log("=== audit_report.json saved to docs/audit_report.json ===");
  console.log(`Total English files audited: ${totalEnFiles}`);
  console.log(
    `Files with actual layout/content discrepancies (among existing translations): ${existingDiscrepancies.length}`,
  );
  console.log(JSON.stringify(existingDiscrepancies, null, 2));
}

runAudit();
