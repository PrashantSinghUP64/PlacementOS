import fs from "node:fs";
import path from "node:path";

const dir = "C:/Users/ps702/Documents/PlacementOS/PlacementOS/app/routes";

function patchDarkClasses(filePath) {
  let content = fs.readFileSync(filePath, "utf-8");
  const original = content;

  // Add dark variants only if not already present in the string
  const rules = [
    [/bg-white(?!\s+dark:bg-gray-900)/g, "bg-white dark:bg-gray-900"],
    [/bg-gray-50(?!\s+dark:bg-gray-[89|950])/g, "bg-gray-50 dark:bg-gray-950"],
    [/text-gray-900(?!\s+dark:text-white)/g, "text-gray-900 dark:text-white"],
    [/text-gray-800(?!\s+dark:text-gray-200)/g, "text-gray-800 dark:text-gray-200"],
    [/text-gray-700(?!\s+dark:text-gray-300)/g, "text-gray-700 dark:text-gray-300"],
    [/text-gray-600(?!\s+dark:text-gray-400)/g, "text-gray-600 dark:text-gray-400"],
    [/border-gray-200(?!\s+dark:border-gray-[78]00)/g, "border-gray-200 dark:border-gray-800"],
    [/border-gray-100(?!\s+dark:border-gray-[78]00)/g, "border-gray-100 dark:border-gray-800"],
    [/bg-violet-50(?!\s+dark:bg-violet-900\/20)/g, "bg-violet-50 dark:bg-violet-900/20"],
    [/border-violet-200(?!\s+dark:border-violet-800)/g, "border-violet-200 dark:border-violet-800"],
    [/bg-blue-50(?!\s+dark:bg-blue-900\/20)/g, "bg-blue-50 dark:bg-blue-900/20"],
    [/bg-green-50(?!\s+dark:bg-green-900\/20)/g, "bg-green-50 dark:bg-green-900/20"],
    [/bg-red-50(?!\s+dark:bg-red-900\/20)/g, "bg-red-50 dark:bg-red-900/20"],
    [/bg-amber-50(?!\s+dark:bg-amber-900\/20)/g, "bg-amber-50 dark:bg-amber-900/20"],
    [/bg-purple-50(?!\s+dark:bg-purple-900\/20)/g, "bg-purple-50 dark:bg-purple-900/20"]
  ];

  for (const [regex, repl] of rules) {
    content = content.replace(regex, repl);
  }

  if (original !== content) {
    fs.writeFileSync(filePath, content, "utf-8");
    console.log("Patched:", path.basename(filePath));
  }
}

function walk(dirPath) {
  const files = fs.readdirSync(dirPath);
  for (const f of files) {
    const fullPath = path.join(dirPath, f);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (f.endsWith(".tsx")) {
      patchDarkClasses(fullPath);
    }
  }
}

walk(dir);
walk("C:/Users/ps702/Documents/PlacementOS/PlacementOS/app/components");
