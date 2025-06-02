import mongoose from 'mongoose';
import PricingRule from '../src/models/PricingRule';
import { CheckoutService } from '../src/services/CheckoutService';

jest.setTimeout(60000);

beforeAll(async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/supermarket_test', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    await PricingRule.deleteMany({});
    await PricingRule.insertMany([
      { sku: 'A', unitPrice: 100, specialPrice: { quantity: 3, totalPrice: 130 } },
      { sku: 'B', unitPrice: 30, specialPrice: { quantity: 2, totalPrice: 45 } },
      { sku: 'C', unitPrice: 20 },
      { sku: 'D', unitPrice: 15 },
    ]);
  } catch (error) {
    console.error('Error in beforeAll hook:', error);
    throw error;
  }
});

afterAll(async () => {
  try {
    await PricingRule.deleteMany({});
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error in afterAll hook:', error);
  }
});

test('calculates total price correctly', async () => {
  const checkout = new CheckoutService();
  await checkout.initPricingRules();
  checkout.scan('A');
  checkout.scan('A');
  checkout.scan('A');
  checkout.scan('B');
  checkout.scan('B');
  expect(checkout.total()).toBe(175);
});
