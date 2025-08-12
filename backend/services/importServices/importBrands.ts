// importBrands.ts
import { client } from '../../sanityClient';
import type { Brand } from '../../sanity.types';
import { logicomApi } from '../authLogicom';

interface LogicomBrand {
  Brand: string;
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


export async function importBrands(): Promise<ImportResult> {
  try {
    console.log('🚀 Starting brand import process...');

    // 1. Fetch existing brands from Sanity
    const existingBrands = await client.fetch<Brand[]>(`
      *[_type == "brand"] {
        _id,
        name,
        slug
      }
    `);

    // Create a map for quick lookup (case-insensitive)
    const existingBrandsMap = new Map<string, Brand>(
      existingBrands.map(brand => [brand.name?.toLowerCase() || '', brand])
    );

    // 2. Fetch brands from Logicom API
    console.log('🔍 Fetching brands from Logicom API...');
    const response = await logicomApi.makeRequest('GetBrands');

    if (!response || response.StatusCode !== 1) {
      throw new Error(`API request failed: ${response?.Status || 'No response data'}`);
    }

    const logicomBrands = response.Message as LogicomBrand[];
    if (!logicomBrands?.length) {
      throw new Error('No brands found in API response');
    }

    // 3. Process brands
    const transaction = client.transaction();
    let stats = { created: 0, updated: 0, skipped: 0 };

    logicomBrands.forEach(brand => {
      const brandName = brand.Brand.trim();
      if (!brandName) return; // Skip empty brand names

      const normalizedKey = brandName.toLowerCase();
      const existingBrand = existingBrandsMap.get(normalizedKey);

      // Generate slug
      const slug = {
        _type: 'slug' as const,
        current: brandName
          .toLowerCase()
          .replace(/[^a-z0-9 -]/g, '')
          .replace(/\s+/g, '-')
          .replace(/^-+|-+$/g, '')
          .slice(0, 96)
      };

      // Prepare brand document
      const brandDoc: Omit<Brand, '_createdAt'|'_updatedAt'|'_rev'> = {
        _id: `brand-${slug.current}`,
        _type: 'brand',
        name: brandName,
        slug: slug
      };

      if (!existingBrand) {
        // Create new brand
        transaction.create({
          ...brandDoc,
          _id: `brand-${slug.current}`
        });
        stats.created++;
        console.log(`➕ Created: ${brandName}`);
      } else {
        // Check if update needed (compare slugs)
        const existingSlug = existingBrand.slug?.current || '';
        if (existingSlug !== slug.current || existingBrand.name !== brandName) {
          transaction.patch(existingBrand._id, {
            set: {
              name: brandName,
              slug: slug
            }
          });
          stats.updated++;
          console.log(`🔄 Updated: ${brandName}`);
        } else {
          stats.skipped++;
        }
      }
    });

    // 4. Commit changes if needed
    if (stats.created > 0 || stats.updated > 0) {
      console.log('💾 Saving changes to Sanity...');
      await transaction.commit();
      console.log(`✅ Import completed:
        Created: ${stats.created}
        Updated: ${stats.updated}
        Skipped: ${stats.skipped}`);
      return { success: true, stats };
    } else {
      console.log('✅ All brands are up-to-date');
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

// Export types for consumers
export type { ImportResult, ImportStats, };