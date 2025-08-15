import ProductFiltered from "@/components/product/ProductFiltered";

export default function Page({ params }: { params: { slug: string; lang: string } }) {
  return <ProductFiltered params={params} />;
}