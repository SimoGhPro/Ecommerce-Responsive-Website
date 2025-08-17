"use client";

import React, { useState, useEffect } from 'react';
import { ShoppingCartIcon, UserIcon, ArchiveBoxIcon } from '@heroicons/react/24/outline'; // Added ArchiveBoxIcon
import Link from 'next/link';
import Form from 'next/form';
import { useUser, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';
import { useSelector } from 'react-redux';
import { 
  Search,
  SearchIcon,
  X
} from "lucide-react";
import { 
  Input
} from "@/components/ui/input";
import { useRouter, useSearchParams } from "next/navigation";
import { useDebounce } from "use-debounce";

const Header = () => {
  const { isSignedIn } = useUser();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const cart = useSelector((state: any) => state.cart);

  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("query") || "");
  const [debouncedQuery] = useDebounce(query, 500);

  // Handle clear action
  const handleClear = () => {
    setQuery("");
  };

  // Optional: Enable real-time search as user types
  useEffect(() => {
    if (debouncedQuery.trim()) {
      router.push(`?query=${encodeURIComponent(debouncedQuery.trim())}`);
    }
  }, [debouncedQuery, router]);

  return (
    <>
      {/* Top Contact Bar */}
      <div className="hidden md:block bg-gray-100 text-gray-700 text-sm">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between py-2 px-4 space-y-2 md:space-y-0">
          
          {/* Left side - Address & Contacts */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Address */}
            <div className="flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c.828 0 1.5-.672 1.5-1.5S12.828 8 12 8s-1.5.672-1.5 1.5S11.172 11 12 11z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10c0 6-9 12-9 12S3 16 3 10a9 9 0 1118 0z" />
              </svg>
              <span>93, Bd Abdelmoumen - Etage 3 Bureau 63</span>
            </div>

            {/* Phone */}
            <div className="flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h1.586a1 1 0 01.707.293l2.414 2.414a1 1 0 01.293.707V8a1 1 0 01-1 1H7l-1.293-1.293A1 1 0 015 7.586V5zM15 7h3a2 2 0 012 2v3.586a1 1 0 01-.293.707l-2.414 2.414a1 1 0 01-.707.293H15a1 1 0 01-1-1v-1l-1.293-1.293a1 1 0 01-.293-.707V9a1 1 0 011-1h1V7z" />
              </svg>
              <a href="tel:+212522272600" className="hover:underline">+212 522 27 26 00</a>
            </div>

            {/* Fax */}
            <div className="flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7V4a1 1 0 00-1-1h-5v2H8V3H5a1 1 0 00-1 1v3H2v13h20V7h-3z" />
              </svg>
              <span>+212 522 27 50 43</span>
            </div>

            {/* Email */}
            <div className="flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12H8m8 0l-8-8m8 8l-8 8" />
              </svg>
              <a href="mailto:info@jolofsystem.ma" className="hover:underline">info@jolofsystem.ma</a>
            </div>
          </div>

          {/* Middle - Link to website */}
          <div className="flex-1 text-center">
            <Link href="https://jolofsystem.com/" className="text-blue-600 hover:underline">
              Visit Our Official Website
            </Link>
          </div>
      </div>
      </div>

      
      {/* Main Navigation */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            
            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Logo */}
            <Link href="/home" className="text-2xl font-bold text-gray-800">
              <span className="text-amber-600">JOLOF</span> <span className="text-blue-900">SYSTEM</span>
            </Link>

            {/* Search Bar - Hidden on mobile */}
            <div className="hidden sm:flex flex-1 max-w-2xl mx-2 sm:mx-4">
              <Form action="/products/search" className="w-full">
                <div className="relative flex items-center">
                  <Search className="absolute left-3 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  <Input
                    type="text"
                    name="query"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search for Products, Categories..."
                    className="pl-8 sm:pl-10 pr-20 sm:pr-24 py-2 sm:py-2 md:py-3 rounded-lg border border-gray-200 focus:border-blue-500 text-sm sm:text-base"
                  />
                  
                  {/* Clear button (X icon) */}
                  {query && (
                    <button
                      type="button"
                      onClick={handleClear}
                      className="absolute right-3 text-gray-400 hover:text-gray-600 transition-colors"
                      aria-label="Clear search"
                    >
                      <X className='h-4 w-4 sm:h-5 sm:w-5' />
                    </button>
                  )}
                </div>
              </Form>
            </div>

            {/* Right Side Icons */}
            <div className="flex items-center space-x-6">
              {/* About Link */}
              <Link 
                href="/about" 
                className="hidden md:inline text-gray-700 hover:text-blue-600 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About
              </Link>

              {/* User Account */}
              {isSignedIn ? (
                <>
                  {/* Orders Icon - Only visible when signed in */}
                  <Link 
                    href="/orders" 
                    className="relative flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors"
                    title="My Orders"
                  >
                    <ArchiveBoxIcon className="h-5 w-5" />
                    <span className="hidden md:inline">Orders</span>
                  </Link>
                  
                  <UserButton afterSignOutUrl="/" />
                </>
              ) : (
                <div className="hidden md:flex items-center space-x-4">
                  <SignInButton mode="modal">
                    <button className="text-gray-700 hover:text-blue-600 transition-colors flex items-center space-x-1">
                      <UserIcon className="h-5 w-5" />
                      <span>Sign In</span>
                    </button>
                  </SignInButton>
                </div>
              )}

              {/* Shopping Cart */}
              <Link href="/cart" className="relative flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors">
                <ShoppingCartIcon className="h-5 w-5" />
                <span className="hidden md:inline">Cart</span>
                <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cart.totalQuantity || 0}
                </span>
              </Link>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 space-y-3 border-t">
              <Link 
                href="/about" 
                className="block py-2 text-gray-700 hover:text-blue-600 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About
              </Link>
              <Link 
                href="/products" 
                className="block py-2 text-gray-700 hover:text-blue-600 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Products
              </Link>
              {/* Add Orders link to mobile menu when signed in */}
              {isSignedIn && (
                <Link 
                  href="/orders" 
                  className="block py-2 text-gray-700 hover:text-blue-600 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  My Orders
                </Link>
              )}
              {!isSignedIn && (
                <div className="pt-2 space-y-2">
                  <SignInButton mode="modal">
                    <button 
                      className="w-full py-2 text-left text-gray-700 hover:text-blue-600 transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Sign In
                    </button>
                  </SignInButton>
                  <SignUpButton>
                    <button 
                      className="w-full py-2 text-left text-gray-700 hover:text-blue-600 transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Create Account
                    </button>
                  </SignUpButton>
                </div>
              )}
            </div>
          )}
        </div>
      </header>
    </>
  );
};

export default Header;