/** the-core-of-turbopack-explained */
import { readFileSync, writeFileSync } from "node:fs"
import path from "node:path"

let logEnabled

const task = (name, f) => {
  return (...args) => {
    const taskResult = logged(name, f, ...args)
    return taskResult
  }
}

const logged = (name, f, ...args) => {
  const start = Date.now()
  if (logEnabled) console.group(name, args[0] ?? "")
  const res = f(...args)
  const duration = Date.now() - start
  if (duration > 50) console.log("name => duration", duration, "ms")
  return res
}
const main = task("main", () => {
  const baseDir = path.join(process.cwd(), "src")
  const outDir = path.join(process.cwd(), "dist")
  const entry = path.join(baseDir, "index.js")
  const header = path.join(baseDir, "header.js")
  copyGraph(baseDir, outDir, entry, header)
})

const copyGraph = task("copyGraph", (baseDir, outDir, entry, header) => {
  const relaPath = path.relative(baseDir, entry)
  const output = path.join(outDir, relaPath)
  copy(output, header, entry)
})

const copy = task("copy", (output, header, entry) => {
  write(output, read(header) + read(entry))
})
const write = task("write", (output, content) => {
  return writeFileSync(output, content, (err) => {
    console.error(">>>>>>>write error", err)
  })
})
const read = task("read", (entry) => {
  return readFileSync(entry, "utf8", (err) => {
    console.error(">>>>>>>read error", err)
  })
})

logEnabled = true
main()
logEnabled = false
