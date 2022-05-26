import { ALL_CAMPAIGNS, Campaign, type Item, type RepeatConfig } from "./campaign";
import { Color } from "./color";
import { onActionExecute } from "./event";
import {
  TButtonWidget,
  TDropdownWidget,
  TGroupBoxWidget,
  TLabelWidget,
  TListViewWidget,
} from "./ui";
import { openWindow } from "./ui";

const classification = "__name__-window";
const windowWidth = 400;
const windowHeight = 300;
const margin = 3;
const gridGap = 10;
const lineHeight = 14;

export const getOptionsWindow = () => {
  let window = ui.getWindow(classification);
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (window) {
    window.bringToFront();
  } else {
    window = createOptionsWindow();
  }
  return window;
};

const createOptionsWindow = () => {
  const campaignListView = new TListViewWidget<Campaign>({
    name: "campaignListView",
    height: (ALL_CAMPAIGNS.length + 1) * lineHeight,
    width: windowWidth - 2 * margin,
    x: margin,
    y: lineHeight + margin,
    scrollbars: "none",
    showColumnHeaders: true,
    columns: [
      { canSort: true, header: "Campaign Type", minWidth: 250, toText: (c) => c.name },
      {
        canSort: true,
        header: "Renewal Frequency",
        toText: (c) =>
          c.renewalFrequency
            ? context.formatString(
                `Renews every ${c.renewalFrequency} weeks for {CURRENCY}`,
                c.pricePerWeek * c.renewalFrequency
              )
            : "Off",
      },
    ],
    items: ALL_CAMPAIGNS.filter((c) => c.isApplicable()),
    selectedCell: { column: 0, row: 0 },
    onClick: (row) => {
      campaignListView.selectedCell = { column: 0, row };
      const selectedCampaign = campaignListView.selectedItem;
      if (selectedCampaign) {
        campaignNameValueLabel.text = selectedCampaign.name;
        if (selectedCampaign.itemCollection) {
          campaignItemDropdown.isVisible = true;
          campaignItemDropdown.items = selectedCampaign.itemCollection.getAll();
        } else {
          campaignItemDropdown.isVisible = false;
        }
        console.log(selectedCampaign.itemCollection?.getAll());
      }
    },
  });

  const campaignDetailsGroupBox = new TGroupBoxWidget({
    name: "campaignDetailsGroupBox",
    height: windowHeight - (campaignListView.y + campaignListView.height + 2 * margin),
    width: windowWidth - 2 * margin,
    x: margin,
    y: campaignListView.y + campaignListView.height + margin,
    text: "Auto Campaign Details",
  });

  const campaignNameLabelLabel = new TLabelWidget({
    name: "campaignNameLabelLabel",
    height: lineHeight,
    width: 75,
    x: margin * 3,
    y: campaignDetailsGroupBox.y + lineHeight,
    text: "{BLACK}Type:",
  });

  const campaignNameValueLabel = new TLabelWidget({
    name: "campaignNameValueLabel",
    height: lineHeight,
    width: 250,
    x: campaignNameLabelLabel.x + campaignNameLabelLabel.width,
    y: campaignDetailsGroupBox.y + lineHeight,
    text: campaignListView.selectedItem?.name ?? "",
  });

  const campaignItemLabelLabel = new TLabelWidget({
    name: "campaignItemLabelLabel",
    height: lineHeight,
    width: 75,
    x: margin * 3,
    y: campaignNameLabelLabel.y + lineHeight,
    text: "{BLACK}Item:",
  });

  const campaignItemDropdown = new TDropdownWidget({
    name: "campaignItemValueLabel",
    height: lineHeight,
    width: 250,
    x: campaignItemLabelLabel.x + campaignItemLabelLabel.width,
    y: campaignNameLabelLabel.y + lineHeight,
    items: campaignListView.selectedItem?.itemCollection?.getAll() ?? [],
    toText: (i) => i.name,
  });

  const onCloseFns: (() => void)[] = [];

  const window = openWindow({
    classification,
    height: windowHeight,
    minHeight: windowHeight,
    maxHeight: windowHeight,
    width: windowWidth,
    minWidth: windowWidth,
    maxWidth: windowWidth,
    title: "__human_name__ Options",
    colours: [Color.DARK_YELLOW, Color.DARK_YELLOW, Color.DARK_YELLOW],
    widgets: [
      campaignListView,
      campaignDetailsGroupBox,
      campaignNameLabelLabel,
      campaignNameValueLabel,
      campaignItemLabelLabel,
      campaignItemDropdown,
    ],
    onClose: () => {
      onCloseFns.forEach((fn) => fn());
    },
  });

  const closeOnDemo = onActionExecute("ridedemolish", () => window.close());
  // hypothetical race condition exists here if window is closed (i.e. onClose method is run)
  // before we can push this subscription. would take inhuman speed to do that though. and the
  // worst that would happen is we just have a leak of an action.execute listener
  onCloseFns.push(() => closeOnDemo.dispose());

  return window;
};

// const getWidgets = () => {
//   const runningCampaigns = ALL_CAMPAIGNS.filter((c) => c.isRepeating());
//   const availableCampaigns = ALL_CAMPAIGNS.filter((c) => c.isApplicable() && !c.isRepeating());
//   const widgets = [];

//   const newCampaignGroup: GroupBoxWidget = {
//     type: "groupbox",
//     name: "newCampaignGroup",
//     text: "Create new auto repeat campaign",
//     x: margin,
//     y: lineHeight + margin,
//     width: windowWidth - 2 * margin,
//     height: availableCampaigns.length > 0 ? lineHeight * 7 : lineHeight,
//   };
//   widgets.push(newCampaignGroup);

//   const newCampaignGroupContentStartY = newCampaignGroup.y + lineHeight;
//   const newCampaignGroupContentStartX = 4 * margin;
//   if (availableCampaigns.length === 0) {
//     widgets.push({
//       type: "label",
//       height: lineHeight,
//       width: windowWidth - 4 * margin,
//       x: newCampaignGroupContentStartY,
//       y: newCampaignGroupContentStartX,
//       text: "All campaigns are already scheduled",
//     } as LabelWidget);
//   } else {
//     const campaignDropdown = new Dropdown<Campaign>({
//       name: "campaignDropdown",
//       height: lineHeight,
//       width: windowWidth - 8 * margin - 100,
//       x: newCampaignGroupContentStartX + 100,
//       y: newCampaignGroupContentStartY,
//       sourceItems: availableCampaigns,
//       toLabel: (c) => c.name,
//     });
//     widgets.push({
//       type: "label",
//       height: lineHeight,
//       width: 100,
//       x: newCampaignGroupContentStartX,
//       y: newCampaignGroupContentStartY,
//       text: "Type:",
//     } as LabelWidget);
//     widgets.push(campaignDropdown);

//     if (campaignDropdown.selectedItem.itemCollection) {
//       const itemDropdown = new Dropdown<Item>({
//         name: "itemDropdown",
//         height: lineHeight,
//         width: windowWidth - 8 * margin - 100,
//         x: newCampaignGroupContentStartX + 100,
//         y: newCampaignGroupContentStartY + (lineHeight + margin),
//         sourceItems: campaignDropdown.selectedItem.itemCollection.getAll(),
//         toLabel: (i) => i.name,
//       });
//       widgets.push({
//         type: "label",
//         height: lineHeight,
//         width: 100,
//         x: newCampaignGroupContentStartX,
//         y: newCampaignGroupContentStartY + (lineHeight + margin),
//         text: "Item:",
//       } as LabelWidget);
//       widgets.push(itemDropdown);
//     }
//   }
//   return widgets;
// };

// const getWindowDesc = (onCloseDisposables: IDisposable[]): WindowDesc => {
//   const widgets = getWidgets();

//   return {
//     classification,
//     height: windowHeight,
//     minHeight: windowHeight,
//     maxHeight: windowHeight,
//     width: windowWidth,
//     minWidth: windowWidth,
//     maxWidth: windowWidth,
//     title: "__human_name__",
//     colours: [Color.DARK_YELLOW, Color.DARK_YELLOW, Color.DARK_YELLOW],
//     widgets,
//     onClose: () => {
//       onCloseDisposables.forEach((d) => d.dispose());
//     },
//   };
// };
