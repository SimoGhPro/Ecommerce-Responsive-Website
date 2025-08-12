import { client } from '../../sanityClient';
import type { Product } from '../../sanity.types';
import { logicomApi } from '../authLogicom';
import axios from 'axios';

interface LogicomProduct {
  SKU: string;
  Name: string;
  Description: string;
  Manufacturer: string;
  Category: string;
  IsESD: string;
  IsEUItem: string;
  Barcode: string;
  Price: {
    PriceExclVAT: string;
    SpecialPrice?: string;
    StartDate?: string;
    EndDate?: string;
    VAT: string;
    RecycleTax: string;
    Currency: string;
  };
  VolumePrice?: Array<{
    Quantity: string;
    Price: string;
    'Discount %': string;
  }>;
  Variants?: Array<{
    Id: string;
    Title: string;
    Price: string;
    ListPrice: string;
    Inventory: string;
    Barcodes: string;
  }>;
  IntelPoints: string;
  Warranty: string;
  Specifications: Array<{
    Name: string;
    Value: string;
  }>;
  Inventory: {
    Quantity: string;
    PO?: {
      Quantity: string;
      PODeliveryDate: string;
    };
  };
  Images: string[];
}

interface ImportStats {
    created: number;
    updated: number;
    skipped: number;
  }
  
  interface ImportResult {
    success: boolean;
    stats?: ImportStats;
    error?: Error;
  }

export async function importProducts(): Promise<ImportResult> {
  try {
    console.log('🚀 Starting product import process...');

    // 1. Fetch existing products from Sanity
    const existingProducts = await client.fetch<Product[]>(`
      *[_type == "product"] {
        _id,
        sku,
        name,
        slug,
        category->{_id}
      }
    `);

    const existingProductsMap = new Map<string, Product>(
      existingProducts.map(product => [product.sku || '', product])
    );

    // 2. Fetch products from Logicom API
    console.log('🔍 Fetching products from Logicom API...');
    const response = await logicomApi.makeRequest('GetProducts');

    if (!response || response.StatusCode !== 1) {
      throw new Error(`API request failed: ${response?.Status || 'No response data'}`);
    }

    const logicomProducts = response.Message as LogicomProduct[];
    if (!logicomProducts?.length) {
      throw new Error('No products found in API response');
    }

    // 3. Process products
    const transaction = client.transaction();
    let stats = { created: 0, updated: 0, skipped: 0 };

    for (const product of logicomProducts) {
      const existingProduct = existingProductsMap.get(product.SKU);
      const categoryRef = await getCategoryReference(product.Category);
      const slug = generateSlug(product.Name);
      const productId = existingProduct?._id || `product-${product.SKU.replace(/[^a-zA-Z0-9-]/g, '-')}`;

      // Prepare product document with proper typing
      const productDoc = {
        _id: productId,
        _type: 'product',
        sku: product.SKU,
        name: product.Name,
        slug: {
          _type: 'slug',
          current: slug
        },
        description: product.Description || undefined,
        manufacturer: product.Manufacturer || undefined,
        ...(categoryRef && { 
          category: { 
            _type: 'reference', 
            _ref: categoryRef,
          } 
        }),
        isESD: product.IsESD === '1',
        isEUItem: product.IsEUItem === '1',
        barcode: product.Barcode || undefined,
        price: {
          priceExclVAT: parseFloat(product.Price.PriceExclVAT) || undefined,
          salePrice: parseFloat(product.Price.PriceExclVAT) * 1.2 || undefined,
          specialPrice: product.Price.SpecialPrice ? parseFloat(product.Price.SpecialPrice) : undefined,
          specialSalePrice: product.Price.SpecialPrice ? parseFloat(product.Price.SpecialPrice) * 1.2 : undefined,
          ...(product.Price.StartDate && { 
            startDate: formatDate(product.Price.StartDate) 
          }),
          ...(product.Price.EndDate && { 
            endDate: formatDate(product.Price.EndDate) 
          }),
          vat: parseFloat(product.Price.VAT) || undefined,
          recycleTax: parseFloat(product.Price.RecycleTax) || undefined,
          currency: product.Price.Currency as 'EUR' | 'RON' | 'MAD' | 'SAR' | 'AED'
        },
        ...(product.VolumePrice && {
          volumePricing: product.VolumePrice.map(vp => ({
            _key: generateKey(),
            quantity: parseInt(vp.Quantity) || undefined,
            price: parseFloat(vp.Price) || undefined,
            salePrice: parseFloat(vp.Price) * 1.2 || undefined,
            discountPercent: parseFloat(vp['Discount %']) || undefined
          }))
        }),
        ...(product.Variants && {
          variants: product.Variants.map(variant => ({
            _key: generateKey(),
            id: variant.Id || undefined,
            title: variant.Title || undefined,
            price: parseFloat(variant.Price) || undefined,
            salePrice: parseFloat(variant.Price) * 1.2 || undefined,
            listPrice: parseFloat(variant.ListPrice) || undefined,
            inventory: parseInt(variant.Inventory) || undefined,
            ourInventory: Math.floor(parseInt(variant.Inventory) / 2) || undefined,
            barcodes: variant.Barcodes || undefined
          }))
        }),
        intelPoints: parseFloat(product.IntelPoints) || undefined,
        warranty: product.Warranty || undefined,
        specifications: product.Specifications.map(spec => ({
          _key: generateKey(),
          name: spec.Name || undefined,
          value: spec.Value || undefined
        })),
        inventory: {
          quantity: parseInt(product.Inventory.Quantity) || undefined,
          ourInventory: Math.floor(parseInt(product.Inventory.Quantity) / 2) || undefined,
          ...(product.Inventory.PO && {
            purchaseOrders: [{
              _key: generateKey(),
              quantity: parseInt(product.Inventory.PO.Quantity) || undefined,
              deliveryDate: formatDate(product.Inventory.PO.PODeliveryDate)
            }]
          })
        },
        ...(product.Images?.length && {
          images: (await Promise.all(
            product.Images.map(async (imgUrl, index) => {
              const assetId = await uploadWithRetry(imgUrl);
              if (!assetId) return null;
              
              return {
                _key: `img-${index}-${product.SKU.substring(0, 8)}`,
                _type: 'image',
                asset: {
                  _ref: assetId,
                  _type: 'reference'
                },
              };
            })
          )).filter(Boolean)
        }),
        lastUpdated: new Date().toISOString()
      };

      if (!existingProduct) {
        transaction.create(productDoc);
        stats.created++;
        console.log(`➕ Created: ${product.Name} (${product.SKU})`);
      } else {
        transaction.patch(existingProduct._id, {
          set: productDoc
        });
        stats.updated++;
        console.log(`🔄 Updated: ${product.Name} (${product.SKU})`);
      }
    }

    // 4. Commit changes
    if (stats.created > 0 || stats.updated > 0) {
      console.log('💾 Saving changes to Sanity...');
      await transaction.commit();
      console.log(`✅ Import completed:
        Created: ${stats.created}
        Updated: ${stats.updated}
        Skipped: ${stats.skipped}`);
        return { success: true, stats };
    } else {
      console.log('✅ All products are up-to-date');
      return { success: true, stats };
    }

  } catch (error) {
    console.error('❌ Import failed:', error instanceof Error ? error.message : 'Unknown error');
    return { 
      success: false, 
      error: error instanceof Error ? error : new Error('Unknown error') 
    };
  }
}

// Helper functions remain the same
function generateKey(): string {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 96);
}

async function getCategoryReference(categoryName: string): Promise<string | null> {
  const category = await client.fetch(
    `*[_type == "category" && name == $name][0]._id`,
    { name: categoryName.trim() }
  );
  return category || null;
}


function formatDate(dateString: string): string {
  const [day, month, year] = dateString.split('-');
  return `${year}-${month}-${day}`;
}

async function uploadImageToSanity(imageUrl: string): Promise<string | undefined> {
  if (!imageUrl?.trim()) {
    console.log('⚠️ Empty image URL provided');
    return undefined;
  }

  try {
    // 1. Validate and clean the URL
    let cleanUrl = imageUrl;
    try {
      const urlObj = new URL(imageUrl);
      cleanUrl = urlObj.toString(); // This will properly encode the URL
    } catch (error) {
      console.log(`⚠️ Invalid URL format: ${imageUrl}`);
      return undefined;
    }

    // 2. Configure axios with timeout and headers
    const response = await axios.get(cleanUrl, {
      responseType: 'arraybuffer',
      timeout: 20000, // 20 seconds timeout
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'image/*',
        'Referer': 'https://www.logicompartners.com/' // Some sites need referer
      },
      maxRedirects: 5
    });

    // 3. Validate response
    if (!response.headers['content-type']?.startsWith('image/')) {
      console.log(`⚠️ Invalid content-type (${response.headers['content-type']}) for URL: ${cleanUrl}`);
      return undefined;
    }

    if (!response.data || response.data.length === 0) {
      console.log(`⚠️ Empty response data for URL: ${cleanUrl}`);
      return undefined;
    }

    // 4. Upload to Sanity
    const filename = new URL(cleanUrl).pathname.split('/').pop() || `image-${Date.now()}`;
    const asset = await client.assets.upload('image', Buffer.from(response.data), {
      filename,
      contentType: response.headers['content-type']
    });

    console.log(`✅ Successfully uploaded image: ${cleanUrl}`);
    return asset._id;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`❌ Axios error for ${imageUrl}:`, {
        status: error.response?.status,
        code: error.code,
        message: error.message
      });
    } else {
      console.error(`❌ Unexpected error for ${imageUrl}:`, error instanceof Error ? error.message : error);
    }
    return undefined;
  }
}
async function uploadWithRetry(imageUrl: string, retries = 2): Promise<string | undefined> {
  let lastError;
  
  for (let i = 0; i < retries; i++) {
    try {
      const result = await uploadImageToSanity(imageUrl);
      if (result) return result;
    } catch (error) {
      lastError = error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // Wait longer between retries
    }
  }
  
  console.error(`Failed after ${retries} retries for ${imageUrl}`, lastError);
  return undefined;
}


// Export types for consumers
export type { ImportResult, ImportStats, };