import PricingRule from '../models/PricingRule';

export class CheckoutService {
  private pricingRules = new Map();
  private scannedItems: string[] = [];

  async initPricingRules() {
    const rules = await PricingRule.find();
    rules.forEach(rule => {
      this.pricingRules.set(rule.sku, {
        unitPrice: rule.unitPrice,
        specialPrice: rule.specialPrice || undefined
      });
    });
  }

  scan(sku: string) {
    this.scannedItems.push(sku);
  }

  total(): number {
    const itemCounts: Record<string, number> = {};
    this.scannedItems.forEach(sku => {
      itemCounts[sku] = (itemCounts[sku] || 0) + 1;
    });

    let total = 0;

    for (const [sku, count] of Object.entries(itemCounts)) {
      const rule = this.pricingRules.get(sku);
      if (!rule) continue;
      const { unitPrice, specialPrice } = rule;
      if (specialPrice) {
        const fullSets = Math.floor(count / specialPrice.quantity);
        const remainder = count % specialPrice.quantity;
        total += fullSets * specialPrice.totalPrice + remainder * unitPrice;
      } else {
        total += count * unitPrice;
      }
    }

    return total;
  }

  reset() {
    this.scannedItems = [];
  }
}