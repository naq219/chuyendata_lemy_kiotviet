import { KiotVietClient } from 'kiotviet-client-sdk';
import * as dotenv from 'dotenv';
dotenv.config();

const client = new KiotVietClient({
  clientId: process.env.KIOTVIET_CLIENT_ID!,
  clientSecret: process.env.KIOTVIET_CLIENT_SECRET!,
  retailerName: process.env.KIOTVIET_RETAILER_NAME!,
});

async function checkProduct(code: string) {
  try {
    const product = await client.products.getByCode(code);
    console.log('Product found:', product);
  } catch (error) {
    console.log('Product not found or error:', (error as Error).message);
  }
}

checkProduct('LY000196');