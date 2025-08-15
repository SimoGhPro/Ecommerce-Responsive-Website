import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-100">
      {/* Mobile Contact Bar */}
      <div className="block md:hidden border-t border-gray-200 px-4 py-4 text-sm text-gray-700">
        <div className="space-y-3">
          {/* Address */}
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c.828 0 1.5-.672 1.5-1.5S12.828 8 12 8s-1.5.672-1.5 1.5S11.172 11 12 11z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10c0 6-9 12-9 12S3 16 3 10a9 9 0 1118 0z" />
            </svg>
            <span>93, Bd Abdelmoumen - Etage 3 Bureau 63</span>
          </div>

          {/* Phone */}
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h1.586l2.414 2.414V8H7L5 6V5z" />
            </svg>
            <a href="tel:+212522272600" className="hover:underline">+212 522 27 26 00</a>
          </div>

          {/* Email */}
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12H8m8 0l-8-8m8 8l-8 8" />
            </svg>
            <a href="mailto:info@jolofsystem.ma" className="hover:underline">info@jolofsystem.ma</a>
          </div>
          {/* Link to website */}
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5z" />
            </svg>
            <a href="https://jolofsystem.com/" className="hover:underline">www.jolofsystem.ma</a>
        </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="py-6 px-6 text-center text-gray-600 border-t border-gray-200">
        <p>© {new Date().getFullYear()} E-COMMERCE. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
