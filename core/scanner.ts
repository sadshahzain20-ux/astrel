import * as fs from "node:fs"
import * as path from "node:path"

export type Lang = "js" | "ts" | "py" | "go" | "rs" | "c" | "cpp" | "java" | "cs"

export interface TestTarget {
  path: string
  lang: Lang
}

function isTestFile(entry: string): Lang | undefined {
  if (entry.endsWith(".test.js")) return "js"
  if (entry.endsWith(".test.ts")) return "ts"
  if (entry.endsWith(".test.py") || entry.startsWith("test_") && entry.endsWith(".py")) return "py"
  if (entry.endsWith("_test.go")) return "go"
  if (entry.endsWith(".test.rs") || entry === "tests") return "rs"
  if (entry.endsWith(".test.c")) return "c"
  if (entry.endsWith(".test.cpp") || entry.endsWith(".test.cc") || entry.endsWith(".test.cxx")) return "cpp"
  if (entry.endsWith("Test.java")) return "java"
  if (entry.endsWith("Tests.cs")) return "cs"
  return undefined
}

export async function scan(root: string = process.cwd(), acc: TestTarget[] = []): Promise<TestTarget[]> {
  for (const entry of fs.readdirSync(root)) {
    if (entry === "node_modules" || entry === "dist" || entry === ".git") continue
    const full = path.join(root, entry)

    const stat = fs.statSync(full)
    if (stat.isDirectory()) {
      if (entry === "tests") {
        for (const f of fs.readdirSync(full)) {
          if (f.endsWith(".rs")) acc.push({ path: path.join(full, f), lang: "rs" })
        }
        continue
      }
      await scan(full, acc)
      continue
    }

    const lang = isTestFile(entry)
    if (lang) acc.push({ path: full, lang })
  }
  return acc
}