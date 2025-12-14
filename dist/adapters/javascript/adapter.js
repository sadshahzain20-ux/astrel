import * as fs from "node:fs";
import * as path from "node:path";
export async function javascriptAdapter(root = process.cwd(), files = []) {
    for (const entry of fs.readdirSync(root)) {
        const full = path.join(root, entry);
        if (fs.statSync(full).isDirectory()) {
            if (entry === "node_modules" || entry === "dist" || entry === ".git")
                continue;
            await javascriptAdapter(full, files);
        }
        if (entry.endsWith(".test.js")) {
            files.push(full);
        }
    }
    return files;
}
