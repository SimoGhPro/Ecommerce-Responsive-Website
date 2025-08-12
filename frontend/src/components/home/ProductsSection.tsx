import { client } from "@/sanity/client";
import ProductCarousel from "./ProductCarousel";

const FEATURED_PRODUCTS_QUERY = `*[_type == "product"]{
  _id,
  name,
  slug,
  price,
  inventory,
  images,
  intelPoints,
  "category": category->name
}|order(_createdAt desc)[0...12]`;

export default async function ProductsSection() {
  const products = await client.fetch(FEATURED_PRODUCTS_QUERY);
  return <ProductCarousel products={products} />;
}