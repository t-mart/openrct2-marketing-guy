import { executeMarketingAction } from "./action";
import { ConfigItem } from "./config";
import { onActionExecute, onNewWeek } from "./event";
import { FOOD_OR_DRINK_SHOP_ITEMS } from "./shopItem";

export interface Item {
  name: string;
  id: number;
}

const getRides = () =>
  map.rides.filter((r) => {
    // OpenRCT2 uses a different approach based on flags to filter this (see
    // src\openrct2-ui\windows\NewCampaign.cpp:RefreshRides()), but we don't see to have access to
    // those flags with the current API. this "classification" is probably the same though -- if
    // not, a reasonable substitute.
    return r.classification === "ride";
  });
const getFoodOrDrinkItems = () => {
  const items = [];
  const itemNames: Record<string, boolean> = {};
  for (const ride of map.rides) {
    for (const id of [ride.object.shopItem, ride.object.shopItemSecondary]) {
      const name = FOOD_OR_DRINK_SHOP_ITEMS[id];
      if (name && !(name in itemNames)) {
        items.push({ name, id });
        itemNames[name] = true;
      }
    }
  }
  return items;
};

const canMarket = () => {
  return !park.getFlag("forbidMarketingCampaigns");
};
const entryPriceUnlocked = () => {
  return park.getFlag("unlockAllPrices") || !park.getFlag("freeParkEntry");
};
const ridePricesUnlocked = () => {
  return park.getFlag("unlockAllPrices") || park.getFlag("freeParkEntry");
};
const rideExists = () => {
  return getRides().length > 0;
};
const foodOrDrinkExists = () => {
  return getFoodOrDrinkItems().length > 0;
};
export interface RepeatConfig {
  item?: number;
  duration: number;
}

class ItemCollection {
  constructor(public getAll: () => Item[]) {}

  findById = (id: number) => {
    for (const item of this.getAll()) {
      if (item.id === id) {
        return item;
      }
    }
    return undefined;
  };
}

const rideCollection = new ItemCollection(getRides);
const foodOrDrinkItemCollection = new ItemCollection(getFoodOrDrinkItems);

interface CampaignOptions {
  nameStringId: number;
  type: number;
  itemCollection?: ItemCollection | undefined;
  isApplicable: () => boolean;
  pricePerWeek: number;
}

export class Campaign implements CampaignOptions {
  private readonly autoRepeatConfig;
  nameStringId: number;
  type: number;
  itemCollection?: ItemCollection | undefined;
  isApplicable: () => boolean;
  pricePerWeek: number;
  private repeatListener: null | IDisposable;
  private demoListener: null | IDisposable;

  constructor(options: CampaignOptions) {
    this.nameStringId = options.nameStringId;
    this.type = options.type;
    this.itemCollection = options.itemCollection;
    this.isApplicable = options.isApplicable;
    this.pricePerWeek = options.pricePerWeek;
    this.repeatListener = null;
    this.demoListener = null;

    this.autoRepeatConfig = new ConfigItem<RepeatConfig>({
      key: `campaign-${options.type}`,
      storage: "park",
    });
  }

  get name() {
    return context.formatString("{STRINGID}", this.nameStringId)
  }

  get renewalFrequency() {
    const config = this.autoRepeatConfig.get();
    if (!config) {
      return undefined
    }
    return config.duration;
  }

  restoreRepeatFromStorage = () => {
    const restoredRepeat = this.autoRepeatConfig.get();
    if (restoredRepeat) {
      this.startRepeat(restoredRepeat);
    }
  };

  clearRepeatFromStorage = () => {
    this.autoRepeatConfig.clear();
  };

  isRepeating = () => {
    return this.autoRepeatConfig.get() != undefined;
  };

  startRepeat = (repeatState: RepeatConfig) => {
    this.autoRepeatConfig.set(repeatState);
    const fn = () => executeMarketingAction({ ...repeatState, type: this.type })
    fn(); // start the campaign right now for 1 week
    this.repeatListener = onNewWeek(fn); // and then run it weekly after that
    // every time there's a demolish, we need to check that we haven't invalidated the campaign
    this.demoListener = onActionExecute("ridedemolish", () => {
      if (repeatState.item === undefined) {
        throw new Error(`Campaign ${this.name} must define item`)
      }
      if (this.itemCollection && !this.itemCollection.findById(repeatState.item)) {
        this.endRepeat();
      }
    });
  };

  endRepeat = () => {
    if (!this.repeatListener) {
      throw new Error(`Can't stop repeating a campaign when it was never started.`);
    }

    this.repeatListener.dispose();
    this.repeatListener = null;
    this.demoListener?.dispose();
    this.demoListener = null;
    this.autoRepeatConfig.clear();
  };
}

/**
 * Vouchers for free entry to the park
 */
const PARK_ENTRY_FREE: Campaign = new Campaign({
  nameStringId: 2424,
  type: 0,
  pricePerWeek: 500,
  isApplicable: () => canMarket() && entryPriceUnlocked(),
});

/**
 * Vouchers for free rides on a particular ride
 */
const RIDE_FREE: Campaign = new Campaign({
  nameStringId: 2425,
  type: 1,
  itemCollection: rideCollection,
  pricePerWeek: 500,
  isApplicable: () => canMarket() && ridePricesUnlocked() && rideExists(),
});

/**
 * Vouchers for half-price entry to the park
 */
const PARK_ENTRY_HALF_PRICE: Campaign = new Campaign({
  nameStringId: 2426,
  type: 2,
  pricePerWeek: 500,
  isApplicable: () => canMarket() && entryPriceUnlocked(),
});

/**
 * Vouchers for free food or drink
 */
const FOOD_OR_DRINK_FREE: Campaign = new Campaign({
  nameStringId: 2427,
  type: 3,
  itemCollection: foodOrDrinkItemCollection,
  pricePerWeek: 500,
  isApplicable: () => canMarket() && foodOrDrinkExists(),
});

/**
 * Advertising campaign for the park
 */
const PARK: Campaign = new Campaign({
  nameStringId: 2428,
  type: 4,
  pricePerWeek: 3500,
  isApplicable: () => canMarket(),
});

/**
 * Advertising campaign for a particular ride
 */
const RIDE: Campaign = new Campaign({
  nameStringId: 2429,
  type: 5,
  itemCollection: rideCollection,
  pricePerWeek: 2000,
  isApplicable: () => canMarket() && rideExists(),
});

export const ALL_CAMPAIGNS: Campaign[] = [
  PARK_ENTRY_FREE,
  RIDE_FREE,
  PARK_ENTRY_HALF_PRICE,
  FOOD_OR_DRINK_FREE,
  PARK,
  RIDE,
];

/**
 * { error: 4, errorTitle: 'Can’t do this…', errorMessage: 'Not enough cash - requires $50.00',
 * cost: 500, expenditureType: 11 }
 *
 * { error: 0, cost: 500, expenditureType: 11 }
 */
