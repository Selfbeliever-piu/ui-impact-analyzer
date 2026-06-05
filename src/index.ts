import { execSync } from "child_process"

const output = execSync("git diff --name-only").toString()

console.log(output)

console.log("Impact Analyzer started")