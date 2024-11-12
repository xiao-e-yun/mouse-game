import { Game } from "@/main";
import { System } from ".";
import { GameObject } from "@/modules/object";
import { InventoryItemType, getAllUpgrades } from "@/inventory";

export class InventorySystem implements System {
  items: (InventoryItemType | undefined)[] = [];
  limit: number;
  selectableUpgrades: InventoryItemType[] = getAllUpgrades();

  constructor(private game: Game, private object: GameObject, options: {
    limit?: number
  }) {
    this.limit = options.limit ?? 6;
    this.items = new Array(this.limit).fill(undefined);
  }

  get length(): number {
    return this.items.reduce((acc, item) => acc + (item ? 1 : 0), 0);
  }
  isFull(): boolean {
    return this.length >= this.limit;
  }
  isEmtpy(): boolean {
    return this.length === 0;
  }

  addOrUpgrade(item: InventoryItemType): void {
    if (this.items.find(i => i === item)) {
      item.level++;
      item.upgrade(this.game, this.object);
    }
    else this.addItem(item);
  }

  addItem(item: InventoryItemType): void {
    item.added(this.game, this.object);
    if (item.isOnce()) return
        
    // remove from selectable upgrades
    this.selectableUpgrades = this.selectableUpgrades.filter(i => i !== item);

    for (const index in this.items) {
      if (this.items[index]) continue;
      this.items[index] = item;
      item.has = true;
      break
    }
  }
  removeItem(item: InventoryItemType): void {
    const id = item.id;
    const index = this.items.findIndex(i => i && i.id === id);
    if (index === -1) throw Error(`Item ${id} not found`);
    this.items[index] = undefined;
    item.has = false;
  }

  listUpgrades(count: number): InventoryItemType[] {
    const upgrades: InventoryItemType[] = [];

    // check empty place and get all upgradeable items
    let hasEmpty = false;
    for (const item of this.items) {
      if (!item) {
        if (!hasEmpty) {
          upgrades.push(...this.selectableUpgrades);
          hasEmpty = true;
        }
        continue
      }

      if (item.upgradeable()) upgrades.push(item);
    }

    return shuffle(upgrades).slice(0, count);
  }

  next(delta: number): void {
    for (const item of this.items) {
      if (item) item.next(this.game, this.object, delta);
    }
  }
}


function shuffle<T>(array: T[]) {
  let currentIndex = array.length;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {

    // Pick a remaining element...
    let randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}