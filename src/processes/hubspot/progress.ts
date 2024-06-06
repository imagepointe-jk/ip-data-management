//This progress tracker allows for easy tracking of total tasks / tasks completed.
//It can optionally also call a callback whenever the update function is called,
//assuming a minimum number of ms has passed since the last time it called that function.
//Good for performing some logic upon completion of various stages of a long task, while
//limiting how often that logic can run.
export class ProgressTracker {
  public readonly totalTasks;
  private completedTasks;
  public readonly startTime;
  private lastIntervalStartTime;
  public readonly intervalMs; //the minimum ms that must elapse between calls of onInterval
  public readonly onInterval;
  private ignoreOnIntervalErrors; //if true, any errors resulting from the onInterval call will be suppressed.

  constructor(
    totalTasks: number,
    intervalMs: number,
    onInterval?: (progress: number) => void,
    ignoreOnIntervalErrors = true
  ) {
    this.totalTasks = totalTasks;
    this.completedTasks = 0;
    this.startTime = Date.now();
    this.intervalMs = intervalMs;
    this.onInterval = onInterval;
    this.lastIntervalStartTime = Date.now();
    this.ignoreOnIntervalErrors = ignoreOnIntervalErrors;
  }

  update(tasksCompleted = 1) {
    this.completedTasks += tasksCompleted;
    if (this.completedTasks > this.totalTasks) {
      this.completedTasks = this.totalTasks;
      console.warn("ProgressTracker attempted to exceed totalTasks.");
    }
    const curTime = Date.now();
    if (curTime - this.lastIntervalStartTime >= this.intervalMs) {
      if (this.onInterval) {
        if (this.ignoreOnIntervalErrors) {
          try {
            this.onInterval(this.completedTasks / this.totalTasks);
          } catch (_) {}
        } else {
          this.onInterval(this.completedTasks / this.totalTasks);
        }
      }
      this.lastIntervalStartTime = curTime;
    }
  }
}
