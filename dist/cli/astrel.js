#!/usr/bin/env node
import { run } from "../core/runner.js";
import { javascriptAdapter } from "../adapters/javascript/adapter.js";
run(() => javascriptAdapter());
