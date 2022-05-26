/**
 * This is my own lil ui library that provides some quality of life improvements to the original API.
 *
 * The trouble with the original API is a widget in a WindowDesc (of openWindow) is not the same
 * reference as as it is when you access it from getWindow(). Therefore, if you want to change props
 * of the widget after it's put into a window, you must do this dance of calling window.findWidget
 * and pass in a name.
 *
 * My library provides provides widgets that know how to properly bind to the getWindow version and
 * a method of openWindow.
 */

export class TWidgetBase<T extends WidgetBase & { name: string }> {
  protected widget: T;
  protected afterBind: (() => void) | undefined = undefined;

  constructor(options: T) {
    this.widget = { ...options };
  }

  bind = (window: Window) => {
    this.widget = window.findWidget<T>(this.name);
    if (this.afterBind) {
      this.afterBind();
    }
  };

  // readonly, thus only getter
  get window() {
    return this.widget.window;
  }

  // only getter here. changing type after creation would be weird.
  get type() {
    return this.widget.type;
  }

  get x() {
    return this.widget.x;
  }

  set x(val: number) {
    this.widget.x = val;
  }

  get y() {
    return this.widget.y;
  }

  set y(val: number) {
    this.widget.y = val;
  }

  get width() {
    return this.widget.width;
  }

  set width(val: number) {
    this.widget.width = val;
  }

  get height() {
    return this.widget.height;
  }

  set height(val: number) {
    this.widget.height = val;
  }

  get name() {
    return this.widget.name;
  }

  get tooltip() {
    return this.widget.tooltip;
  }

  set tooltip(val: string | undefined) {
    this.widget.tooltip = val;
  }

  get isDisabled() {
    return this.widget.isDisabled;
  }

  set isDisabled(val: boolean | undefined) {
    this.widget.isDisabled = val;
  }

  get isVisible() {
    return this.widget.isVisible;
  }

  set isVisible(val: boolean | undefined) {
    this.widget.isVisible = val;
  }
}

export class TButtonWidget extends TWidgetBase<ButtonWidget & { name: string }> {
  constructor(options: Omit<ButtonWidget & { name: string }, "type">) {
    super({ ...options, type: "button" });
  }

  get border(): boolean | undefined {
    return this.widget.border;
  }

  set border(val: boolean | undefined) {
    this.widget.border = val;
  }

  get image(): number | undefined {
    return this.widget.image;
  }

  set image(val: number | undefined) {
    this.widget.image = val;
  }

  get isPressed(): boolean | undefined {
    return this.widget.isPressed;
  }

  set isPressed(val: boolean | undefined) {
    this.widget.isPressed = val;
  }

  get text(): string | undefined {
    return this.widget.text;
  }

  set text(val: string | undefined) {
    this.widget.text = val;
  }

  get onClick(): (() => void) | undefined {
    return this.widget.onClick;
  }

  set onClick(val: (() => void) | undefined) {
    this.widget.onClick = val;
  }
}

export class TCheckboxWidget extends TWidgetBase<CheckboxWidget & { name: string }> {
  constructor(options: Omit<CheckboxWidget & { name: string }, "type">) {
    super({ ...options, type: "checkbox" });
  }

  get text(): string | undefined {
    return this.widget.text;
  }

  set text(val: string | undefined) {
    this.widget.text = val;
  }

  get isChecked(): boolean | undefined {
    return this.widget.isChecked;
  }

  set isChecked(val: boolean | undefined) {
    this.widget.isChecked = val;
  }

  get onChange(): ((isChecked: boolean) => void) | undefined {
    return this.widget.onChange;
  }

  set onChange(val: ((isChecked: boolean) => void) | undefined) {
    this.widget.onChange = val;
  }
}

export class TColourPickerWidget extends TWidgetBase<ColourPickerWidget & { name: string }> {
  constructor(options: Omit<ColourPickerWidget & { name: string }, "type">) {
    super({ ...options, type: "colourpicker" });
  }

  get colour(): number | undefined {
    return this.widget.colour;
  }

  set colour(val: number | undefined) {
    this.widget.colour = val;
  }

  get onChange(): ((colour: number) => void) | undefined {
    return this.widget.onChange;
  }

  set onChange(val: ((colour: number) => void) | undefined) {
    this.widget.onChange = val;
  }
}

export class TCustomWidget extends TWidgetBase<CustomWidget & { name: string }> {
  constructor(options: Omit<CustomWidget & { name: string }, "type">) {
    super({ ...options, type: "custom" });
  }

  get onDraw(): ((this: CustomWidget, g: GraphicsContext) => void) | undefined {
    return this.widget.onDraw;
  }

  set onDraw(val: ((this: CustomWidget, g: GraphicsContext) => void) | undefined) {
    this.widget.onDraw = val;
  }
}

/**
 * Like a normal DropdownWidget, but it accepts arbitrary objects (that must be able to toString for
 * labelling) instead of just Strings. Exposes an `onChangeItem` method that passes the index of the
 * selected item and the item to which it corresponds.
 */
export class TDropdownWidget<ItemType> extends TWidgetBase<DropdownWidget & { name: string }> {
  items: ItemType[];
  toText: (i: ItemType) => string;
  onChangeItem: ((item: ItemType, index: number) => void) | undefined = undefined;

  protected override afterBind: (() => void) | undefined = () => {
    // After binding, set the onChange method to be a function that calls onChangeItem, which is an
    // item-aware version of onChange.
    // This must be done after binding because ... let's test this? I feel like the closure of
    // onChange in the WindowDesc form won't know about onChange after its bound... something
    this.widget.onChange = (index: number) => {
      if (this.onChangeItem) {
        this.onChangeItem(this.getItem(index), index);
      }
    };
    this.widget.items = this.items.map((i) => this.toText(i))
  };

  private getItem: (index: number | undefined) => ItemType = (index: number | undefined) => {
    // Centralizing this logic that's used in mulitple places.
    if (index === undefined) {
      throw new Error("Asking for item of undefined index???");
    }
    const item = this.items[index];
    if (item === undefined) {
      throw new Error("Could not access index of items (returned undefined)???");
    }
    return item;
  };

  constructor(
    options: Omit<DropdownWidget & { name: string }, "type" | "items"> & {
      items: ItemType[];
      toText: (i: ItemType) => string;
    }
  ) {
    super({ ...options, type: "dropdown", items: options.items.map((i) => options.toText(i)) });
    this.items = options.items;
    this.toText = options.toText;
  }

  get selectedIndex(): number | undefined {
    return this.widget.selectedIndex;
  }

  set selectedIndex(val: number | undefined) {
    this.widget.selectedIndex = val;
  }

  get selectedItem() {
    return this.getItem(this.selectedIndex);
  }
}

export class TGroupBoxWidget extends TWidgetBase<GroupBoxWidget & { name: string }> {
  constructor(options: Omit<GroupBoxWidget & { name: string }, "type">) {
    super({ ...options, type: "groupbox" });
  }

  get text(): string | undefined {
    return this.widget.text;
  }

  set text(val: string | undefined) {
    this.widget.text = val;
  }
}

export class TLabelWidget extends TWidgetBase<LabelWidget & { name: string }> {
  constructor(options: Omit<LabelWidget & { name: string }, "type">) {
    super({ ...options, type: "label" });
  }

  get text(): string | undefined {
    return this.widget.text;
  }

  set text(val: string | undefined) {
    this.widget.text = val;
  }

  get textAlign(): TextAlignment | undefined {
    return this.widget.textAlign;
  }

  set textAlign(val: TextAlignment | undefined) {
    this.widget.textAlign = val;
  }
}

type ConvertingColumn<ItemType> = ListViewColumn & { toText: (i: ItemType) => string };

export class TListViewWidget<ItemType> extends TWidgetBase<ListViewWidget & { name: string }> {
  items: ItemType[];
  columns: ConvertingColumn<ItemType>[];
  onSelectItem: ((item: ItemType, index: number) => void) | undefined = undefined;

  constructor(
    options: Omit<ListViewWidget & { name: string }, "type" | "items" | "columns"> & {
      items: ItemType[];
      columns: ConvertingColumn<ItemType>[];
    }
  ) {
    super({
      ...options,
      type: "listview",
      items: options.items.map((item) => options.columns.map((column) => column.toText(item))),
      columns: options.columns,
    });
    this.items = options.items;
    this.columns = options.columns;
  }

  protected override afterBind: (() => void) | undefined = () => {
    // for some reason, we need to set the items again. not sure why. otherwise, they're empty
    this.widget.items = this.items.map((item) => this.columns.map((column) => column.toText(item)));
  };

  get scrollbars(): ScrollbarType | undefined {
    return this.widget.scrollbars;
  }

  set scrollbars(val: ScrollbarType | undefined) {
    this.widget.scrollbars = val;
  }

  get isStriped(): boolean | undefined {
    return this.widget.isStriped;
  }

  set isStriped(val: boolean | undefined) {
    this.widget.isStriped = val;
  }

  get showColumnHeaders(): boolean | undefined {
    return this.widget.showColumnHeaders;
  }

  set showColumnHeaders(val: boolean | undefined) {
    this.widget.showColumnHeaders = val;
  }

  // get columns(): ConvertingColumn<ItemType>[] | undefined {
  //   // TODO fix this, the widget doesn't have the toText function
  //   return this.widget.columns as ConvertingColumn<ItemType>[] | undefined;
  // }

  // set columns(val: ConvertingColumn<ItemType>[] | undefined) {
  //   this.widget.columns = val;
  // }

  // get items(): string[] | ListViewItem[] | undefined {
  //   return this.widget.items;
  // }

  // set items(val: string[] | ListViewItem[] | undefined) {
  //   this.widget.items = val;
  // }

  get selectedCell(): RowColumn | undefined {
    return this.widget.selectedCell;
  }

  set selectedCell(val: RowColumn | undefined) {
    this.widget.selectedCell = val;
  }

  get selectedItem() {
    if (this.selectedCell === undefined) {
      return undefined;
    }
    return this.items[this.selectedCell.row];
  }

  // readonly, only getter
  get highlightedCell(): RowColumn | undefined {
    return this.widget.highlightedCell;
  }

  get canSelect(): boolean | undefined {
    return this.widget.canSelect;
  }

  set canSelect(val: boolean | undefined) {
    this.widget.canSelect = val;
  }

  get onHighlight(): ((item: number, column: number) => void) | undefined {
    return this.widget.onHighlight;
  }

  set onHighlight(val: ((item: number, column: number) => void) | undefined) {
    this.widget.onHighlight = val;
  }

  get onClick(): ((item: number, column: number) => void) | undefined {
    return this.widget.onClick;
  }

  set onClick(val: ((item: number, column: number) => void) | undefined) {
    this.widget.onClick = val;
  }
}

export class TSpinnerWidget extends TWidgetBase<SpinnerWidget & { name: string }> {
  constructor(options: Omit<SpinnerWidget & { name: string }, "type">) {
    super({ ...options, type: "spinner" });
  }

  get text(): string | undefined {
    return this.widget.text;
  }

  set text(val: string | undefined) {
    this.widget.text = val;
  }

  get onDecrement(): (() => void) | undefined {
    return this.widget.onDecrement;
  }

  set onDecrement(val: (() => void) | undefined) {
    this.widget.onDecrement = val;
  }

  get onIncrement(): (() => void) | undefined {
    return this.widget.onIncrement;
  }

  set onIncrement(val: (() => void) | undefined) {
    this.widget.onIncrement = val;
  }

  get onClick(): (() => void) | undefined {
    return this.widget.onClick;
  }

  set onClick(val: (() => void) | undefined) {
    this.widget.onClick = val;
  }
}

export class TTextBoxWidget extends TWidgetBase<TextBoxWidget & { name: string }> {
  constructor(options: Omit<TextBoxWidget & { name: string }, "type">) {
    super({ ...options, type: "textbox" });
  }

  get text(): string | undefined {
    return this.widget.text;
  }

  set text(val: string | undefined) {
    this.widget.text = val;
  }

  get maxLength(): number | undefined {
    return this.widget.maxLength;
  }

  set maxLength(val: number | undefined) {
    this.widget.maxLength = val;
  }

  get onChange(): ((text: string) => void) | undefined {
    return this.widget.onChange;
  }

  set onChange(val: ((text: string) => void) | undefined) {
    this.widget.onChange = val;
  }
}

export class TViewportWidget extends TWidgetBase<ViewportWidget & { name: string }> {
  constructor(options: Omit<ViewportWidget & { name: string }, "type">) {
    super({ ...options, type: "viewport" });
  }

  get viewport(): Viewport | undefined {
    return this.widget.viewport;
  }

  set viewport(val: Viewport | undefined) {
    this.widget.viewport = val;
  }
}
