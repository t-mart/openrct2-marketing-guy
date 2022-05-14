// we can:
// see how much it'd cost to purchase a campaign for n weeks
// purchase a campaign for n weeks

// we cannot:
// check current campaigns
// maybe add this to the API?
// maybe just write into openrct the ability to add 255 week long campaigns?


// possibilities: ride ad campaign to most expensive ride?

const main = (): void => {
  console.log(new Date().toISOString());
  // whew, finally. this is how you do it.
  context.executeAction("parkmarketing", { type: 0, item: 0, duration: 255 }, (result) =>
    console.log(result)
  );
};

export default main;
