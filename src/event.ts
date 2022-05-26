const isWeekStart = () => {
  // this is exactly how OpenRCT2 checks for weeks
  // it doesn't have anything to do with days -- it's defined simply as a quarter of a month.
  // (each month gets 65536 ticks, so this is true on ticks #0, #16384, #32768, and #49152)
  return (date.monthProgress & 0x3fff) === 0;
};

/**
 * Run a function when a new week starts.
 *
 * @param callback A function to execute when a new week starts
 * @param frequency Call callback every `frequency` weeks, initially waiting that many weeks for the
 *   first trigger.
 * @returns An listener object, on which `dispose()` can be called to dispose of it.
 */
export const onNewWeek = (callback: () => void, frequency = 1) => {
  let count = 0;
  return context.subscribe("interval.tick", () => {
    if (isWeekStart()) {
      count++;
      if (count === frequency) {
        callback();
        count == 0;
      }
    }
  });
};

/**
 * Run a function when an action of a provided type is executed.
 *
 * @param action The ActionType to subscribe to
 * @param callback A function to execute when that type of action is executed
 * @returns An listener object, on which `dispose()` can be called to dispose of it.
 */
export const onActionExecute = (
  action: ActionType,
  callback: (args: GameActionEventArgs) => void
) => {
  return context.subscribe("action.execute", (gameActionEventArgs) => {
    if (gameActionEventArgs.action === action) {
      callback(gameActionEventArgs);
    }
  });
};
