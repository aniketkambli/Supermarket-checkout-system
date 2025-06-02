import PricingRule from '../models/PricingRule';

export class CheckoutService {
  private pricingRules = new Map();
  private scannedItems: string[] = [];

  async initPricingRules() {
    try {
      const rules = await PricingRule.find();
      if (!rules || rules.length === 0) {
        throw new Error('No pricing rules found');
      }
      rules.forEach(rule => {
        this.pricingRules.set(rule.sku, {
          unitPrice: rule.unitPrice,
          specialPrice: rule.specialPrice || undefined
        });
      });
    } catch (error) {
      throw new Error('Failed to initialize pricing rules');
    }
  }

  scan(sku: string) {
    if (!this.pricingRules.has(sku)) {
      throw new Error(`Invalid SKU: ${sku}`);
    }
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
      if (!rule) throw new Error(`Pricing rule not found for SKU: ${sku}`);
      
      const { unitPrice, specialPrice } = rule;
      
      if (specialPrice && count >= specialPrice.quantity) {
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