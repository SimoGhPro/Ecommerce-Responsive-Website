import { client } from "@/sanity/client";
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { SanityDocument } from "next-sanity";
import HeroSectionClient from "./HeroSectionClient";

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

  // Prepare image URLs on server
  const bannerData = banners.map(banner => ({
    ...banner,
    imageUrl: banner.image ? urlFor(banner.image)?.width(2000).height(1000).url() : null,
    thumbUrl: banner.image ? urlFor(banner.image)?.width(100).height(60).url() : null
  }));

  return <HeroSectionClient banners={bannerData} />;
}