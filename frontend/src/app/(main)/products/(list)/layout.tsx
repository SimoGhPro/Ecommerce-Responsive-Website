import React from 'react';
import SideBarFilter from '@/components/navbar/FilterByCat';

const ProductListLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar - Hidden on mobile, shown on desktop */}
          <div className="lg:w-1/4">
            <div className="hidden lg:block sticky top-4">
              <SideBarFilter />
            </div>
            
            {/* Mobile filter button - shown only on mobile */}
            <div className="lg:hidden mb-4">
              <button className="w-full py-2 px-4 bg-white border border-gray-200 rounded-lg shadow-sm flex items-center justify-between">
                <span>Filters</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Main content area */}
          <div className="lg:w-3/4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductListLayout;