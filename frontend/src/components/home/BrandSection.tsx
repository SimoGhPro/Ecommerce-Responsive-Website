// Brand Section Component

// Next.js imports
import Link from "next/link";

// Sanity imports
import { type SanityDocument } from "next-sanity";
import { client } from "@/sanity/client";

// Sanity Client Configuration
const options = { next: { revalidate: 30 } };

// Sanity query for fetching brands
const BRANDS_QUERY = `*[
  _type == "brand"
  && defined(slug.current)
]|order(name asc)[0...12]{_id, name, slug, logo}`;

export default async function BrandSection() {
  const brands = await client.fetch<SanityDocument[]>(BRANDS_QUERY, {}, options);

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-primary-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Our Trusted Brands</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Shop from our carefully selected collection of premium brands
          </p>
        </div>
        
        {!brands || brands.length === 0 ? (
          <div className="text-center py-12 bg-white bg-opacity-70 rounded-xl backdrop-blur-sm">
            <p className="text-gray-500 text-lg">
              No brands available at the moment.
            </p>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-full flex flex-wrap justify-center gap-6 max-w-6xl">
              {brands.map((brand) => (
                <div 
                  key={brand._id}
                  className="group relative overflow-hidden rounded-xl bg-white bg-opacity-80 backdrop-blur-sm border border-gray-200 hover:border-primary-300 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 w-[160px] h-[160px] flex items-center justify-center"
                  aria-label={`Browse ${brand.name} brand`}
                >
                  <div
                    className="focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 rounded-xl h-full w-full flex flex-col items-center justify-center p-4"
                  >
                    <div className="mb-3 w-16 h-16 flex items-center justify-center bg-gray-100 rounded-full text-primary-600 font-bold text-xl">
                      {brand.name.charAt(0)}
                    </div>
                    <h3 className="text-center font-medium text-gray-900 group-hover:text-primary-600 transition-colors text-sm sm:text-base">
                      {brand.name}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}