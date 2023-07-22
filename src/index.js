import path from "node:path";
import { log, task } from "./task.js";
import { parse } from "acorn";
import { read, write } from "./fs.js";
import { printCentered } from "./util.js";

const main = task("main", () => {
  const baseDir = path.join(process.cwd(), "demo");
  const outDir = path.join(process.cwd(), "demo", "dist");
  const entry = path.join(baseDir, "/index.js");
  const header = path.join(process.cwd(), "demo", "header.js");
  copyGraph(baseDir, outDir, entry, header);
  log.enable && printCentered(`🔥🔥 首次构建完成 🔥🔥`);
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
        return value.startsWith(".");
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
