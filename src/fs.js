import { readFileSync, writeFileSync, watch } from "node:fs";
import { task, getInvalidator, log } from "./task.js";
import { resolve } from "node:path";

const invalidatorCache = new Map();

watch(process.cwd(), { recursive: true }, (eventType, filename) => {
  if (!filename) return;
  filename = resolve(filename);
  const invalidator = invalidatorCache.get(filename);
  invalidator &&
    setTimeout(() => {
      invalidatorCache.delete(filename);
      log.enable && console.time("file change");
      invalidator();
      log.enable && console.timeEnd("file change");
    }, 100);
});

export const read = task("read", (entry) => {
  const invalidator = getInvalidator();
  invalidatorCache.set(entry, invalidator);
  return readFileSync(entry, "utf8", (err) => {
    console.error(">>>>>>>read error", err);
  });
});

export const write = task("write", (output, content) => {
  return writeFileSync(output, content, (err) => {
    console.error(">>>>>>>write error", err);
  });
});
