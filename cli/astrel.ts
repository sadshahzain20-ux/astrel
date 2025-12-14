#!/usr/bin/env node
import { run } from "../core/runner.js"

const cmd = process.argv[2] || "test"

if (cmd === "test") {
  run()
} else {
  console.log(`Unknown command: ${cmd}`)
  process.exit(1)
}