import mongoose from 'mongoose';
import PricingRule from '../src/models/PricingRule';
import { CheckoutService } from '../src/services/CheckoutService';

jest.setTimeout(30000);

beforeAll(async () => {
  try {
    await mongoose.connect(process.env.MONGO_TEST_URI || '');
    
    await PricingRule.deleteMany({}).exec();
    
    await PricingRule.insertMany([
      { sku: 'A', unitPrice: 50, specialPrice: { quantity: 3, totalPrice: 130 } },
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
    await PricingRule.deleteMany({}).exec();
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error in afterAll hook:', error);
  }
});

test('calculates total price correctly with special offers', async () => {
  const checkout = new CheckoutService();
  await checkout.initPricingRules();
  checkout.scan('A');
  checkout.scan('A');
  checkout.scan('A');
  checkout.scan('B');
  checkout.scan('B');
  expect(checkout.total()).toBe(175);
});

test('calculates total price correctly without special offers', async () => {
  const checkout = new CheckoutService();
  await checkout.initPricingRules();
  checkout.scan('C');
  checkout.scan('D');
  checkout.scan('D');
  expect(checkout.total()).toBe(50);
});

test('handles single item purchases', async () => {
  const checkout = new CheckoutService();
  await checkout.initPricingRules();
  checkout.scan('A');
  expect(checkout.total()).toBe(50);
});

test('handles multiple scans of same item without special price', async () => {
  const checkout = new CheckoutService();
  await checkout.initPricingRules();
  checkout.scan('C');
  checkout.scan('C');
  checkout.scan('C');
  expect(checkout.total()).toBe(60);
});

test('handles empty cart', async () => {
  const checkout = new CheckoutService();
  await checkout.initPricingRules();
  expect(checkout.total()).toBe(0);
});

test('handles mixed items with and without special prices', async () => {
  const checkout = new CheckoutService();
  await checkout.initPricingRules();
  checkout.scan('A');
  checkout.scan('B');
  checkout.scan('C');
  checkout.scan('D');
  expect(checkout.total()).toBe(115);
});

test('handles partial special price quantities', async () => {
  const checkout = new CheckoutService();
  await checkout.initPricingRules();
  checkout.scan('A');
  checkout.scan('A');
  checkout.scan('B');
  expect(checkout.total()).toBe(130);
});

test('handles multiple special price applications', async () => {
  const checkout = new CheckoutService();
  await checkout.initPricingRules();
  checkout.scan('A');
  checkout.scan('A');
  checkout.scan('A');
  checkout.scan('A');
  checkout.scan('A');
  checkout.scan('A');
  expect(checkout.total()).toBe(260);
});

test('handles invalid SKU', async () => {
  const checkout = new CheckoutService();
  await checkout.initPricingRules();
  expect(() => checkout.scan('Z')).toThrow('Invalid SKU: Z');
});

test('handles database connection error', async () => {
  await mongoose.disconnect();
  const checkout = new CheckoutService();
  await expect(checkout.initPricingRules()).rejects.toThrow();
  await mongoose.connect('mongodb://mongo:27017/supermarket_test');
});