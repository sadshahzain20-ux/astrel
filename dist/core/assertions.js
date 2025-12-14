export function expect(value) {
    return {
        toBe(expected) {
            if (value !== expected) {
                throw new Error(`Expected ${expected}, received ${value}`);
            }
        },
        toEqual(expected) {
            const a = JSON.stringify(value);
            const b = JSON.stringify(expected);
            if (a !== b) {
                throw new Error(`Expected ${b}, received ${a}`);
            }
        },
        toContain(expected) {
            if (typeof value === "string") {
                if (!value.includes(expected))
                    throw new Error(`Expected to contain ${expected}`);
                return;
            }
            if (Array.isArray(value)) {
                if (!value.includes(expected))
                    throw new Error(`Expected to contain ${expected}`);
                return;
            }
            throw new Error("toContain supports string or array");
        },
        toThrow() {
            if (typeof value !== "function")
                throw new Error("toThrow expects a function");
            try {
                value();
            }
            catch {
                return;
            }
            throw new Error("Expected function to throw");
        },
        toBeCloseTo(expected, precision = 2) {
            const p = Math.pow(10, precision);
            if (Math.round(Math.abs(value - expected) * p) !== 0) {
                throw new Error(`Expected ${expected} ±${Math.pow(10, -precision)}`);
            }
        }
    };
}
