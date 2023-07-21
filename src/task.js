import { TupleMap } from "./tupleMap.js";

const taskCache = new TupleMap();

export let currentTask = null;

// wrap current task to be able to track dependent tasks
const wrapCurrentTask = (task, f) => {
  const oldTask = currentTask;
  currentTask = task;
  try {
    return f();
  } finally {
    currentTask = oldTask;
  }
};

export const task = (name, f) => {
  return (...args) => {
    let task = taskCache.get([name, ...args]) ?? null;
    if (!task) {
      task = {
        name,
        args,
        f,
        result: undefined,
        dependentTasks: new Set(),
      };
      task.result = wrapCurrentTask(task, () => logged(name, f, args));
      taskCache.set([name, ...args], task);
    }
    currentTask && task.dependentTasks.add(currentTask);
    return task.result;
  };
};

const logged = (name, f, args) => {
  const start = Date.now();
  if (log.enable) console.group(name, args[0] ?? "");
  const res = f(...args);
  const duration = Date.now() - start;
  if (duration > 50 && log.enable)
    console.log(name, "=> duration", duration, "ms");
  if (log.enable) console.groupEnd();
  return res;
};

export const log = {
  enable: false,
};

export const getInvalidator = () => {
  if (!currentTask) log.enable && console.log(">>>>>no task");
  // need to cache by another variable because currentTask is changing
  const task = currentTask;
  return () => invalidate(task);
};

export const invalidate = (task) => {
  const oldTaskResult = task.result;
  // recalculate task
  logged(
    task.name,
    () => {
      task.result = wrapCurrentTask(task, () => {
        return task.f(...task.args);
      });
    },
    task.args
  );
  // invalidate dependent tasks
  if (JSON.stringify(oldTaskResult) !== JSON.stringify(task.result)) {
    if (task.dependentTasks.size > 0) {
      for (const dependentTask of task.dependentTasks) {
        invalidate(dependentTask);
      }
    }
  } else {
    log.enable && console.log(">>>>>no change", task.name);
  }
};
