import React, { useState, useEffect } from 'react';
import FeaturedProducts from '@/components/product/AllproductItems';


export default function Home() {
  // const [loading, setLoading] = useState(true);


  // if (loading) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center">
  //       <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  //     </div>
  //   );
  // }

  return <FeaturedProducts />;
}