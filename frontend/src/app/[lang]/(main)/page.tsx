// "use client"

// app/page.tsx
// import CountdownTimer from '@/components/home/CountdownTimer';
import BrandSection from '@/components/home/BrandSection';
import CategorySection from '@/components/home/CategorySection';
import ProductsSection from '@/components/home/ProductsSection';
import CountdownTimer from '@/components/home/CountdownTimer';
import React from 'react';

export default function Home() {


  return (
    <div className="min-h-screen flex flex-col">
      
      {/* Hero Section */}
      <section className="bg-gray-100 py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Discover Our Latest Electronics in JOLOF SYSTEM</h1>
          <p className="text-xl text-gray-600 mb-8">
            Explore cutting-edge technology and innovative gadgets. Find your next favorite device today!
          </p>
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-lg">
            Shop Electronics
          </button>
        </div>
      </section>

      {/* Flash Sale */}
      <section className="py-8 px-6 bg-red-50">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Flash Sale Ends In:</h2>
            <CountdownTimer />
          </div>
        </div>
      </section>

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