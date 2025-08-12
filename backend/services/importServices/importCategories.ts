// importCategories.ts
import { logicomApi } from '../authLogicom';
import { client } from '../../sanityClient';
import type { Category } from '../../sanity.types';

interface LogicomCategory {
  Id: string;
  Name: string;
  Subcategories?: {
    Id: string;
    Name: string;
  }[];
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

export async function importCategories(): Promise<ImportResult> {
  try {
    console.log('🚀 Starting category import process...');

    // 1. Fetch existing categories from Sanity
    const existingCategories = await client.fetch<Category[]>(`
      *[_type == "category"] {
        _id,
        Id,
        name,
        slug,
        parentCategory->{_id}
      }
    `);

    const existingCategoriesMap = new Map<string, Category>(
      existingCategories.map(cat => [cat.Id || '', cat])
    );

    // 2. Fetch from Logicom API
    console.log('🔍 Fetching categories from Logicom API...');
    const response = await logicomApi.makeRequest('GetProductCategories');

    if (!response || response.StatusCode !== 1) {
      throw new Error(`API request failed: ${response?.Status || 'No response data'}`);
    }

    const logicomCategories = response.Message as LogicomCategory[];
    if (!logicomCategories?.length) {
      throw new Error('No categories found in API response');
    }

    // 3. Process categories
    const transaction = client.transaction();
    let stats = { created: 0, updated: 0, skipped: 0 };

    const processCategory = (category: LogicomCategory, parentId?: string) => {
      const sanitizedId = `category-${category.Id.replace(/[^a-zA-Z0-9-]/g, '-')}`;
      const existing = existingCategoriesMap.get(category.Id);

      // Generate slug
      const slug = {
        _type: 'slug' as const,
        current: category.Name
          .toLowerCase()
          .replace(/[^a-z0-9 -]/g, '')
          .replace(/\s+/g, '-')
          .replace(/^-+|-+$/g, '')
          .slice(0, 96)
      };

      // Prepare document data
      const docData = {
        _type: 'category' as const,
        Id: category.Id,
        name: category.Name,
        slug: slug,
        ...(parentId && {
          parentCategory: {
            _type: 'reference' as const,
            _ref: parentId
          }
        })
      };

      if (!existing) {
        // Create new document
        transaction.create({
          _id: sanitizedId,
          ...docData
        });
        stats.created++;
        console.log(`➕ Created: ${category.Name}`);
      } else {
        // Check if update needed
        const needsUpdate = 
          existing.name !== category.Name ||
          JSON.stringify(existing.slug) !== JSON.stringify(slug) ||
          existing.parentCategory?._ref !== parentId;

        if (needsUpdate) {
          transaction.patch(existing._id, {
            set: docData
          });
          stats.updated++;
          console.log(`🔄 Updated: ${category.Name}`);
        } else {
          stats.skipped++;
        }
      }

      // Process subcategories
      category.Subcategories?.forEach(subCat => {
        processCategory(
          { Id: subCat.Id, Name: subCat.Name },
          existing?._id || sanitizedId
        );
      });
    };

    // Process all root categories
    logicomCategories.forEach(cat => processCategory(cat));

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
      console.log('✅ All categories are up-to-date');
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