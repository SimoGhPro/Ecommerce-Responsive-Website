import { client } from "@/sanity/client";
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { SanityDocument } from "next-sanity";

// Image URL builder
const { projectId, dataset } = client.config();
const urlFor = (source: SanityImageSource) =>
  projectId && dataset
    ? imageUrlBuilder({ projectId, dataset }).image(source)
    : null;

const options = { next: { revalidate: 30 } };

const BANNERS_QUERY = `*[_type == "banner"] | order(_createdAt desc) {
  _id,
  image,
  "alt": image.alt
}`;

export default async function HeroSection() {
  const banners = await client.fetch<SanityDocument[]>(BANNERS_QUERY, {}, options);

  if (!banners.length) return null;

  return (
    <section className="relative h-[80vh] max-h-[800px] w-full overflow-hidden">
      <div className="absolute inset-0 z-0">
        {banners.map((banner, index) => {
          const imageUrl = banner.image
            ? urlFor(banner.image)?.auto('format').url()
            : null;

          return (
            <div
              key={banner._id}
              className={`absolute inset-0 transition-opacity duration-1000 ${index === 0 ? 'opacity-100' : 'opacity-0'}`}
              data-banner
              style={{
                backgroundImage: imageUrl ? `url(${imageUrl})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                willChange: 'opacity'
              }}
              aria-hidden={index !== 0}
              aria-label={banner.image?.alt || 'Promotional banner'}
            />
          );
        })}
      </div>

      {/* Animation script (client-side) */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            let currentIndex = 0;
            const banners = document.querySelectorAll('[data-banner]');
            const interval = 6000;
            
            function rotateBanners() {
              banners[currentIndex].classList.remove('opacity-100');
              banners[currentIndex].classList.add('opacity-0');
              
              currentIndex = (currentIndex + 1) % banners.length;
              
              banners[currentIndex].classList.remove('opacity-0');
              banners[currentIndex].classList.add('opacity-100');
            }
            
            if (banners.length > 1) {
              setInterval(rotateBanners, interval);
            }
          `,
        }}
      />
    </section>
  );
}