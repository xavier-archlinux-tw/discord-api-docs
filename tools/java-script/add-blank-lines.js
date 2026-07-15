import fs from "fs";

const FILES_TO_FIX = [
  "./developers/bilingual/activities/building-an-activity.mdx",
  "./developers/bilingual/activities/development-guides/assets-and-metadata.mdx",
  "./developers/bilingual/activities/development-guides/growth-and-referrals.mdx",
  "./developers/bilingual/activities/development-guides/multiplayer-experience.mdx",
  "./developers/bilingual/activities/development-guides/layout.mdx",
  "./developers/bilingual/activities/development-guides/mobile.mdx",
  "./developers/bilingual/activities/development-guides/networking.mdx",
  "./developers/bilingual/activities/development-guides/user-actions.mdx",
  "./developers/bilingual/activities/how-activities-work.mdx",
  "./developers/bilingual/topics/rate-limits.mdx",
  "./developers/bilingual/topics/oauth2.mdx",
  "./developers/bilingual/topics/permissions.mdx",
  "./developers/bilingual/interactions/overview.mdx",
  "./developers/bilingual/interactions/receiving-and-responding.mdx",
  "./developers/bilingual/interactions/application-commands.mdx",
  "./developers/bilingual/discovery/overview.mdx",
  "./developers/bilingual/discovery/enabling-discovery.mdx",
  "./developers/bilingual/discovery/best-practices.mdx",
  "./developers/bilingual/platform/oauth2-and-permissions.mdx",
  "./developers/bilingual/platform/activities.mdx",
  "./developers/bilingual/platform/app-monetization.mdx",
  "./developers/bilingual/platform/discovery.mdx",
  "./developers/bilingual/platform/rich-presence.mdx",
];

FILES_TO_FIX.forEach((filePath) => {
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }

  const content = fs.readFileSync(filePath, "utf8");
  const lines = content.split(/\r?\n/);
  const newLines = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed === "</div>" && i > 0) {
      const prevLine = newLines[newLines.length - 1];
      if (prevLine.trim() !== "") {
        newLines.push("");
      }
      newLines.push("</div>");
    } else if (trimmed === "<div>") {
      newLines.push("<div>");
    } else {
      newLines.push(line);
    }
  }

  fs.writeFileSync(filePath, newLines.join("\n"), "utf8");
  console.log(`Processed and fixed formatting in: ${filePath}`);
});
