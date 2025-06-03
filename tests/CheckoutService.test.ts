import mongoose from 'mongoose';
import PricingRule from '../src/models/PricingRule';
import { CheckoutService } from '../src/services/CheckoutService';

jest.setTimeout(30000);

beforeAll(async () => {
  await mongoose.connect('mongodb://mongo:27017/supermarket_test');
  await PricingRule.deleteMany({});
  await PricingRule.insertMany([
    { sku: 'A', unitPrice: 50, specialPrice: { quantity: 3, totalPrice: 130 } },
    { sku: 'B', unitPrice: 30, specialPrice: { quantity: 2, totalPrice: 45 } },
    { sku: 'C', unitPrice: 20 },
    { sku: 'D', unitPrice: 15 }
  ]);
});

afterAll(async () => {
  await PricingRule.deleteMany({});
  await mongoose.disconnect();
});

test('calculates total with special prices applied', async () => {
  const checkout = new CheckoutService();
  await checkout.initPricingRules();
  checkout.scan('A');
  checkout.scan('A');
  checkout.scan('A');
  checkout.scan('B');
  checkout.scan('B');
  expect(checkout.total()).toBe(175);
});

test('calculates total without triggering special price', async () => {
  const checkout = new CheckoutService();
  await checkout.initPricingRules();
  checkout.scan('A');
  checkout.scan('B');
  expect(checkout.total()).toBe(80);
});

test('calculates total with single item', async () => {
  const checkout = new CheckoutService();
  await checkout.initPricingRules();
  checkout.scan('C');
  expect(checkout.total()).toBe(20);
});

test('calculates total with item without special price', async () => {
  const checkout = new CheckoutService();
  await checkout.initPricingRules();
  checkout.scan('D');
  checkout.scan('D');
  expect(checkout.total()).toBe(30);
});

test('returns total 0 when no items scanned', async () => {
  const checkout = new CheckoutService();
  await checkout.initPricingRules();
  expect(checkout.total()).toBe(0);
});

test('throws error for unknown SKU', async () => {
  const checkout = new CheckoutService();
  await checkout.initPricingRules();
  expect(() => checkout.scan('X')).toThrow('Invalid SKU: X');
});

test('throws error for mixed valid and unknown SKUs', async () => {
  const checkout = new CheckoutService();
  await checkout.initPricingRules();
  checkout.scan('A');
  expect(() => checkout.scan('Z')).toThrow('Invalid SKU: Z');
});

test('correctly applies multiple special price sets', async () => {
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

test('correctly applies special and regular pricing together', async () => {
  const checkout = new CheckoutService();
  await checkout.initPricingRules();
  checkout.scan('B');
  checkout.scan('B');
  checkout.scan('B');
  expect(checkout.total()).toBe(75);
});

test('handles repeated initPricingRules calls', async () => {
  const checkout = new CheckoutService();
  await checkout.initPricingRules();
  await checkout.initPricingRules();
  checkout.scan('C');
  checkout.scan('C');
  expect(checkout.total()).toBe(40);
});
