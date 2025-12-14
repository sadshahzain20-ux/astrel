export function report(results) {
    console.log("ASTREL v0.1\n");
    let passed = 0;
    let failed = 0;
    for (const r of results) {
        if (r.status === "pass") {
            passed++;
            console.log(`✓ ${r.name}`);
        }
        else {
            failed++;
            console.log(`✗ ${r.name}`);
            console.log(`  ${r.error}`);
        }
    }
    console.log(`\n${results.length} tests | ${passed} passed | ${failed} failed`);
}
