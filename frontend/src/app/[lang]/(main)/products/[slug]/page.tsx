import ProductPageClient from './ProductPageClient';
import { client } from '@/sanity/client';

export default async function ProductPage({
  params,
}: {
  params: { slug: string; lang: string };
}) {
  const product = await client.fetch(
    `*[_type == "product" && slug.current == $slug][0]{
      _id,
      name,
      description,
      images,
      price,
      volumePricing,
      specifications,
      warranty,
      inventory,
      manufacturer,
      isESD,
      isEUItem,
      variants,
      intelPoints
    }`,
    { slug: params.slug }
  );

  if (!product) {
    return <div className="container mx-auto px-4 py-8">Product not found</div>;
  }

  return <ProductPageClient product={product} lang={params.lang} />;
}