import { pathToFileURL } from "node:url";
import { spawn } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";
import * as ts from "typescript";
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
function execCmdCode(cmd, args) {
    return new Promise((resolve) => {
        const p = spawn(cmd, args, { stdio: "inherit" });
        p.on("exit", (code) => resolve(typeof code === "number" ? code : 1));
        p.on("error", () => resolve(1));
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
    try {
        const src = fs.readFileSync(target.path, "utf8");
        const out = ts.transpileModule(src, {
            compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 },
            fileName: target.path
        });
        const href = `data:text/javascript;base64,${Buffer.from(out.outputText).toString("base64")}`;
        await import(href);
    }
    catch (e) {
        results.push({ name: target.path, status: "fail", error: e?.message ?? String(e), duration: 0 });
    }
}
async function runPyFiles(targets, results, root) {
    if (!(await hasCmd("python"))) {
        for (const t of targets)
            results.push({ name: t.path, status: "skip", error: "python not found", duration: 0 });
        return;
    }
    if (await hasCmd("pytest")) {
        const code = await execCmdCode("pytest", ["-q", root]);
        if (code === 0) {
            results.push({ name: "pytest", status: "pass", duration: 0 });
            return;
        }
        if (code !== 5) {
            results.push({ name: "pytest", status: "fail", error: `pytest exited with ${code}`, duration: 0 });
            return;
        }
        // code 5 means no tests collected; fall back to per-file execution
    }
    for (const t of targets) {
        await execCmd(t.path, "python", [t.path], results);
    }
}
async function runGo(targets, results, root) {
    if (!(await hasCmd("go"))) {
        for (const t of targets)
            results.push({ name: t.path, status: "skip", error: "go not found", duration: 0 });
        return;
    }
    const mod = path.join(root, "go.mod");
    if (fs.existsSync(mod)) {
        await execCmd("go test ./...", "go", ["test", "./..."], results);
    }
    else {
        const dirs = Array.from(new Set(targets.map((t) => t.path.replace(/\\[^\\]+$|\/[^\/]+$/, ""))));
        for (const dir of dirs) {
            await execCmd(`go test ${dir}`, "go", ["test", dir], results);
        }
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
async function runJava(root, results) {
    const pom = path.join(root, "pom.xml");
    const gradlew = path.join(root, process.platform === "win32" ? "gradlew.bat" : "gradlew");
    const gradleBuild = path.join(root, "build.gradle");
    if (fs.existsSync(pom) && (await hasCmd("mvn"))) {
        await execCmd("mvn test", "mvn", ["-q", "-DskipTests=false", "test"], results);
        return;
    }
    if (fs.existsSync(gradlew)) {
        await execCmd("gradlew test", gradlew, ["test"], results);
        return;
    }
    if (fs.existsSync(gradleBuild) && (await hasCmd("gradle"))) {
        await execCmd("gradle test", "gradle", ["test"], results);
        return;
    }
}
async function runDotnet(root, results) {
    const has = await hasCmd("dotnet");
    if (!has)
        return;
    const sln = fs.readdirSync(root).some((f) => f.endsWith(".sln"));
    const csproj = fs.readdirSync(root).some((f) => f.endsWith(".csproj"));
    if (sln || csproj) {
        await execCmd("dotnet test", "dotnet", ["test"], results);
    }
}
function runPool(items, worker, concurrency = 4, bail = false) {
    let index = 0;
    let failed = false;
    const runners = [];
    const runNext = async () => {
        if (failed && bail)
            return;
        const i = index++;
        const item = items[i];
        if (item === undefined)
            return;
        try {
            await worker(item);
        }
        catch {
            failed = true;
        }
        await runNext();
    };
    for (let i = 0; i < Math.min(concurrency, items.length); i++)
        runners.push(runNext());
    return Promise.all(runners);
}
export async function execute(targets, results, root, options) {
    const byLang = {
        js: [], ts: [], py: [], go: [], rs: [], c: [], cpp: [], java: [], cs: []
    };
    for (const t of targets)
        byLang[t.lang].push(t);
    await runPool(byLang.js, (t) => runJs(t, results), options?.concurrency ?? 4, options?.bail ?? false);
    await runPool(byLang.ts, (t) => runTs(t, results), options?.concurrency ?? 4, options?.bail ?? false);
    if (byLang.py.length)
        await runPyFiles(byLang.py, results, root);
    if (byLang.go.length)
        await runGo(byLang.go, results, root);
    if (byLang.rs.length)
        await runRust(byLang.rs, results);
    await runJava(root, results);
    await runDotnet(root, results);
    for (const t of [...byLang.c, ...byLang.cpp])
        results.push({ name: t.path, status: "skip", error: "C/C++ not supported yet", duration: 0 });
    for (const t of byLang.java)
        results.push({ name: t.path, status: "skip", error: "Java requires test framework", duration: 0 });
    for (const t of byLang.cs)
        results.push({ name: t.path, status: "skip", error: "dotnet test required", duration: 0 });
}
