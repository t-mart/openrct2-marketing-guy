export const executeMarketingAction = (
  args: { type: number; item?: number | undefined; duration: number },
  callback?: (() => void) | undefined
) => {
  const { type, item = 0, duration } = args;
  context.executeAction("parkmarketing", { type, item, duration }, callback);
};
