// src/components/pages/productFiltered.tsx
import { client } from "@/sanity/client";
import ProductItemsClient from "@/components/product/productItems.tsx/ProductItemsClient";

const PRODUCTS_BY_CATEGORY_QUERY = `*[_type == "product" && references($categoryId)]{
  _id,
  name,
  slug,
  price,
  inventory,
  images,
  intelPoints,
  "category": category->name
}|order(_createdAt desc)`;

const CATEGORY_ID_QUERY = `*[_type == "category" && slug.current == $slug][0]{
  _id
}`;

export default async function ProductFiltered({ 
  params 
}: { 
  params: { slug: string; lang: string } 
}) {
  // Get the slug from params
  const { slug } = params;
  
  // First get the category ID from the slug
  const category = await client.fetch(CATEGORY_ID_QUERY, { slug });
  
  if (!category) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900">Category not found</h3>
          <p className="mt-2 text-sm text-gray-500">
            The requested category does not exist.
          </p>
        </div>
      </div>
    );
  }

  // Then get products for this category
  const products = await client.fetch(PRODUCTS_BY_CATEGORY_QUERY, { 
    categoryId: category._id 
  });

  return <ProductItemsClient products={products} />;
}