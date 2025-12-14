import { expect } from "./assertions.js";
export function createTestEnv(results) {
    globalThis.test = (name, fn) => {
        const start = Date.now();
        try {
            fn();
            results.push({
                name,
                status: "pass",
                duration: Date.now() - start
            });
        }
        catch (e) {
            results.push({
                name,
                status: "fail",
                error: e.message,
                duration: Date.now() - start
            });
        }
    };
    globalThis.expect = expect;
}
