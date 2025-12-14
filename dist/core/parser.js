import { expect } from "./assertions.js";
export function createTestEnv(results) {
    const before = [];
    const after = [];
    const only = new Set();
    function runHookList(list) {
        for (const h of list) {
            const r = h();
            if (r && typeof r.then === "function") {
                ;
                r.catch(() => { });
            }
        }
    }
    function runTest(name, fn, timeout) {
        const start = Date.now();
        try {
            for (const h of before) {
                const rh = h();
                if (rh && typeof rh.then === "function") {
                    ;
                    rh.catch(() => { });
                }
            }
            const ret = fn();
            if (ret && typeof ret.then === "function") {
                let done = false;
                const onResolve = () => {
                    if (done)
                        return;
                    done = true;
                    results.push({ name, status: "pass", duration: Date.now() - start });
                    runHookList(after);
                };
                const onReject = (e) => {
                    if (done)
                        return;
                    done = true;
                    results.push({ name, status: "fail", error: e?.message ?? String(e), duration: Date.now() - start });
                    runHookList(after);
                };
                const p = ret;
                p.then(onResolve, onReject);
                if (timeout && timeout > 0) {
                    setTimeout(() => {
                        if (done)
                            return;
                        done = true;
                        results.push({ name, status: "fail", error: "timeout", duration: Date.now() - start });
                        runHookList(after);
                    }, timeout);
                }
                return;
            }
            results.push({
                name,
                status: "pass",
                duration: Date.now() - start
            });
            runHookList(after);
        }
        catch (e) {
            results.push({
                name,
                status: "fail",
                error: e?.message ?? String(e),
                duration: Date.now() - start
            });
            runHookList(after);
        }
    }
    ;
    globalThis.test = ((name, fn, timeout) => {
        if (only.size > 0 && !only.has(name)) {
            results.push({ name, status: "skip", duration: 0 });
            return;
        }
        runTest(name, fn, timeout);
    });
    globalThis.test.skip = (name) => {
        results.push({ name, status: "skip", duration: 0 });
    };
    globalThis.test.only = (name, fn, timeout) => {
        only.add(name);
        runTest(name, fn, timeout);
    };
    globalThis.beforeEach = (h) => {
        before.push(h);
    };
    globalThis.afterEach = (h) => {
        after.push(h);
    };
    globalThis.expect = expect;
}
