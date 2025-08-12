// app/search/page.tsx (or wherever your SearchPage is)
import React from "react";
import { client } from "@/sanity/client";
import ProductListing from "@/components/pages/ProductItemsClient";

const SEARCH_PRODUCTS_QUERY = `
  *[
    _type == "product" &&
    (
      lower(name) match lower($search + "*") ||
      lower(category->name) match lower($search + "*")
    )
  ]{
    _id,
    name,
    slug,
    price,
    inventory,
    images,
    intelPoints,
    "category": category->name
  } | order(_createdAt desc)
`;

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { query?: string };
}) {
  const query = searchParams?.query || "";

  // If query is empty, return no results
  if (!query.trim()) {
    return (
        <p className="text-gray-500">Please enter a search term.</p>
    );
  }

  const products = await client.fetch(SEARCH_PRODUCTS_QUERY, {
    search: query,
  });

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">
        Search Results for: <span className="text-blue-600">{query}</span>
      </h1>
      <ProductListing products={products} />
    </div>
  );
}
