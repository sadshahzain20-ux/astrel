import { pathToFileURL } from "node:url";
import { spawn } from "node:child_process";
function hasCmd(cmd) {
    return new Promise((resolve) => {
        const p = spawn(process.platform === "win32" ? "where" : "which", [cmd]);
        p.on("exit", (code) => resolve(code === 0));
        p.on("error", () => resolve(false));
    });
}
async function execCmd(name, cmd, args, results) {
    const start = Date.now();
    return new Promise((resolve) => {
        const p = spawn(cmd, args, { stdio: "inherit" });
        p.on("exit", (code) => {
            results.push({
                name,
                status: code === 0 ? "pass" : "fail",
                error: code === 0 ? undefined : `${cmd} exited with ${code}`,
                duration: Date.now() - start
            });
            resolve();
        });
        p.on("error", (e) => {
            results.push({ name, status: "fail", error: String(e), duration: Date.now() - start });
            resolve();
        });
    });
}
async function runJs(target, results) {
    try {
        await import(pathToFileURL(target.path).href);
    }
    catch (e) {
        results.push({ name: target.path, status: "fail", error: e?.message ?? String(e), duration: 0 });
    }
}
async function runTs(target, results) {
    results.push({ name: target.path, status: "skip", error: "TypeScript test requires loader", duration: 0 });
}
async function runPy(target, results) {
    if (!(await hasCmd("python"))) {
        results.push({ name: target.path, status: "skip", error: "python not found", duration: 0 });
        return;
    }
    await execCmd(target.path, "python", [target.path], results);
}
async function runGo(targets, results) {
    if (!(await hasCmd("go"))) {
        for (const t of targets)
            results.push({ name: t.path, status: "skip", error: "go not found", duration: 0 });
        return;
    }
    const dirs = Array.from(new Set(targets.map((t) => t.path.replace(/\\[^\\]+$|\/[^\/]+$/, ""))));
    for (const dir of dirs) {
        await execCmd(`go test ${dir}`, "go", ["test", dir], results);
    }
}
async function runRust(targets, results) {
    if (!(await hasCmd("cargo"))) {
        for (const t of targets)
            results.push({ name: t.path, status: "skip", error: "cargo not found", duration: 0 });
        return;
    }
    await execCmd("cargo test", "cargo", ["test"], results);
}
export async function execute(targets, results) {
    const byLang = {
        js: [], ts: [], py: [], go: [], rs: [], c: [], cpp: [], java: [], cs: []
    };
    for (const t of targets)
        byLang[t.lang].push(t);
    for (const t of byLang.js)
        await runJs(t, results);
    for (const t of byLang.ts)
        await runTs(t, results);
    for (const t of byLang.py)
        await runPy(t, results);
    if (byLang.go.length)
        await runGo(byLang.go, results);
    if (byLang.rs.length)
        await runRust(byLang.rs, results);
    for (const t of [...byLang.c, ...byLang.cpp])
        results.push({ name: t.path, status: "skip", error: "C/C++ not supported yet", duration: 0 });
    for (const t of byLang.java)
        results.push({ name: t.path, status: "skip", error: "Java requires test framework", duration: 0 });
    for (const t of byLang.cs)
        results.push({ name: t.path, status: "skip", error: "dotnet test required", duration: 0 });
}
