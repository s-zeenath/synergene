"use client";
import React from "react";
import Card, { useCardTheme } from "@/components/ui/Card";

interface PopularDrugsCardProps {
  drugs: { name: string; count: number }[];
  isLoading?: boolean;
}

export default function PopularDrugsCard({
  drugs,
  isLoading,
}: PopularDrugsCardProps) {
  const { textColor, highlightColor } = useCardTheme();

  // Show loading state
  if (isLoading) {
    return (
      <Card>
        <p className={`text-xl sm:text-2xl md:text-3xl font-bold mb-4`}>
          <span className={textColor}>The most popular </span>
          <span className={highlightColor}>drugs</span>
          <span className={textColor}> used were:</span>
        </p>

        <div className="flex flex-col gap-2 mb-6 pl-6 pr-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`flex justify-between text-lg sm:text-xl md:text-2xl font-semibold ${textColor}`}
            >
              <span className="bg-gray-300 dark:bg-gray-600 animate-pulse h-6 w-32 rounded"></span>
              <span className="bg-gray-300 dark:bg-gray-600 animate-pulse h-6 w-8 rounded"></span>
            </div>
          ))}
        </div>

        <div className="flex justify-center">
          <img
            src="/drug.png"
            alt="drug"
            className="h-16 w-16 object-contain"
          />
          <img
            src="/drug.png"
            alt="drug"
            className="h-16 w-16 object-contain"
          />
          <img
            src="/drug.png"
            alt="drug"
            className="h-16 w-16 object-contain"
          />
        </div>
      </Card>
    );
  }

  // Show empty state if no drugs
  if (!drugs || drugs.length === 0) {
    return (
      <Card>
        <p className={`text-xl sm:text-2xl md:text-3xl font-bold mb-4`}>
          <span className={textColor}>The most popular </span>
          <span className={highlightColor}>drugs</span>
          <span className={textColor}> used were:</span>
        </p>

        <div className="flex flex-col gap-2 mb-6 pl-6 pr-6">
          <div
            className={`text-center text-lg sm:text-xl md:text-2xl font-semibold ${textColor}`}
          >
            No predictions yet
          </div>
        </div>

        <div className="flex justify-center">
          <img
            src="/drug.png"
            alt="drug"
            className="h-16 w-16 object-contain"
          />
          <img
            src="/drug.png"
            alt="drug"
            className="h-16 w-16 object-contain"
          />
          <img
            src="/drug.png"
            alt="drug"
            className="h-16 w-16 object-contain"
          />
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <p className={`text-xl sm:text-2xl md:text-3xl font-bold mb-4`}>
        <span className={textColor}>The most popular </span>
        <span className={highlightColor}>drugs</span>
        <span className={textColor}> used were:</span>
      </p>

      <div className="flex flex-col gap-2 mb-6 pl-6 pr-6">
        {drugs.map((drug, i) => (
          <div
            key={i}
            className={`flex justify-between text-lg sm:text-xl md:text-2xl font-semibold ${textColor}`}
          >
            <span>{drug.name}</span>
            <span className={highlightColor + " pr-4"}>{drug.count}</span>
          </div>
        ))}
      </div>

      <div className="flex justify-center">
        <img src="/drug.png" alt="drug" className="h-16 w-16 object-contain" />
        <img src="/drug.png" alt="drug" className="h-16 w-16 object-contain" />
        <img src="/drug.png" alt="drug" className="h-16 w-16 object-contain" />
      </div>
    </Card>
  );
}
