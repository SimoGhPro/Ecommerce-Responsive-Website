// services/index.ts
import { importBrands } from './importServices/importBrands';
import { importCategories } from './importServices/importCategories';
import { importProducts } from './importServices/importProducts';

export default async function runAllImports() {
  console.log('Starting all imports...');
  
  const brandResult = await importBrands();
  if (!brandResult.success) {
    console.error('Brand import failed:', brandResult.error?.message);
    throw new Error(brandResult.error?.message);
  }

  const categoryResult = await importCategories();
  if (!categoryResult.success) {
    console.error('Category import failed:', categoryResult.error?.message);
    throw new Error(categoryResult.error?.message);
  }

  const productResult = await importProducts();
  if (!productResult.success) {
    console.error('Product import failed:', productResult.error?.message);
    throw new Error(productResult.error?.message);
  }

  return {
    brandStats: brandResult.stats,
    categoryStats: categoryResult.stats,
    productStats: productResult.stats
  };
}

runAllImports();