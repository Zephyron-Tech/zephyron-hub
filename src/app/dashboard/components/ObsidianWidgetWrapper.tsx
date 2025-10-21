"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";

// Dynamically import the server component
const ObsidianWidget = dynamic(() => import("./ObsidianWidget"), {
  ssr: false,
  loading: () => (
    <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <svg
          className="w-6 h-6 text-purple-500"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h2 className="text-2xl font-bold text-white">
          Poslední poznámky z Obsidianu
        </h2>
      </div>
      <div className="text-center py-8">
        <p className="text-gray-400">Načítání poznámek...</p>
      </div>
    </div>
  ),
});

export default function ObsidianWidgetWrapper() {
  return (
    <Suspense
      fallback={
        <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <svg
              className="w-6 h-6 text-purple-500"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h2 className="text-2xl font-bold text-white">
              Poslední poznámky z Obsidianu
            </h2>
          </div>
          <div className="text-center py-8">
            <p className="text-gray-400">Načítání poznámek...</p>
          </div>
        </div>
      }
    >
      <ObsidianWidget />
    </Suspense>
  );
}
