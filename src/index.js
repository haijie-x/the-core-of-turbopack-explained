import path from "node:path";
import { log, task, currentTask } from "./task.js";
import { parse } from "acorn";
import { read, write } from "./fs.js";

const main = task("main", () => {
  const baseDir = path.join(process.cwd(), "test");
  const outDir = path.join(process.cwd(), "test", "dist");
  const entry = path.join(baseDir, "/index.js");
  const header = path.join(process.cwd(), "src", "header.js");
  copyGraph(baseDir, outDir, entry, header);
});

const copyGraph = task("copyGraph", (baseDir, outDir, entry, header) => {
  const relPath = path.relative(baseDir, entry);
  const output = path.join(outDir, relPath);
  copy(output, header, entry);
  const importers = getImporter(entry);
  if (importers?.length > 0)
    for (const importer of importers) {
      copyGraph(baseDir, outDir, importer, header);
    }
});

const getImporter = task("getImporter", (entry) => {
  const ast = parse(read(entry), {
    sourceType: "module",
    ecmaVersion: "latest",
  });
  return (
    ast.body
      .filter((node) => node.type === "ImportDeclaration")
      .map((node) => node.source.value)
      .filter((value) => {
        return value.startsWith("./");
      })
      .map((value) => path.join(path.dirname(entry), value)) ?? []
  );
});

const copy = task("copy", (output, header, entry) => {
  write(output, read(header) + read(entry));
});

log.enable = true;
main();
log.enable = true;
