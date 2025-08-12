// components/shared/PageLoader.tsx
"use client";

export default function PageLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-gray-900">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      <p className="mt-4 text-gray-600 dark:text-gray-300">Loading...</p>
    </div>
  );
}
