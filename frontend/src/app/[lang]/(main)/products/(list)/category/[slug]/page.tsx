import ProductFiltered from "@/components/pages/ProductFiltered";

export default function Page({ params }: { params: { slug: string; lang: string } }) {
  return <ProductFiltered params={params} />;
}