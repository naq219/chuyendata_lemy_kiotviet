import { KiotVietClient } from 'kiotviet-client-sdk';
import * as dotenv from 'dotenv';
dotenv.config();

const client = new KiotVietClient({
  clientId: process.env.KIOTVIET_CLIENT_ID!,
  clientSecret: process.env.KIOTVIET_CLIENT_SECRET!,
  retailerName: process.env.KIOTVIET_RETAILER_NAME!,
});

async function checkCategories() {
  try {
    const categories = await client.categories?.list?.({ pageSize: 100 });
    console.log('Available categories:', categories?.data);
    
    if (categories?.data && categories.data.length > 0) {
      console.log('First category ID:', categories.data[0].id);
      return categories.data[0].id;
    } else {
      console.log('No categories found');
      return null;
    }
  } catch (error) {
    console.log('Error fetching categories:', (error as Error).message);
    return null;
  }
}

checkCategories();