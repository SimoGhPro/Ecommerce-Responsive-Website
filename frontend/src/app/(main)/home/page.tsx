
// app/page.tsx
// import CountdownTimer from '@/components/home/CountdownTimer';
import BrandSection from '@/components/home/BrandSection';
import CategorySection from '@/components/home/CategorySection';
import ProductsSection from '@/components/home/ProductsSection';
import React from 'react';
import HeroSection from '@/components/home/HeroSection';
export default function Home() {


  return (
    <div className="min-h-screen flex flex-col">
      
      {/* Hero Section */}
      <HeroSection />

      {/* Main Content */}
      <main className="flex-grow py-8 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Shop by Brand */}
          <BrandSection />

          {/* Explore Categories */}
          <CategorySection />

          {/* Recommended Products */}
          <ProductsSection />
          
        </div>
      </main>
      
    </div>
  );
}