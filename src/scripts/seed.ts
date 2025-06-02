import mongoose from 'mongoose';
import PricingRule from '../models/PricingRule';
import dotenv from 'dotenv';
dotenv.config();

async function seed() {
  await mongoose.connect(process.env.MONGO_URI || '');
  await PricingRule.deleteMany({});
  await PricingRule.insertMany([
    { sku: 'A', unitPrice: 100, specialPrice: { quantity: 3, totalPrice: 130 } },
    { sku: 'B', unitPrice: 30, specialPrice: { quantity: 2, totalPrice: 45 } },
    { sku: 'C', unitPrice: 20 },
    { sku: 'D', unitPrice: 15 }
  ]);
  await mongoose.disconnect();
}

seed();