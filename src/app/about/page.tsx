"use client";

import React from "react";
import { useTheme } from "@/components/ui/ThemeToggle";
import { useNavbar } from "../contexts/NavbarContext";

export default function AboutPage() {
  const { theme } = useTheme();
  const { setPageTitle } = useNavbar();
  const isLight = theme === "light";

  React.useEffect(() => setPageTitle("About"), [setPageTitle]);

  return (
    <main
      className="relative min-h-screen w-full bg-blue-100"
      style={isLight ? { backgroundColor: "#5175b0" } : {}}
    >
      <div className="px-6 md:px-12 lg:px-24 pt-16 pb-14 relative z-10">
        <section
          className={`
            max-w-5xl mx-auto rounded-3xl shadow-xl p-8 md:p-12
            transition-colors duration-300
            ${isLight ? "bg-white text-gray-900" : "text-white"}
          `}
          style={!isLight ? { backgroundColor: "#202e5e" } : {}}
        >
          <h1
            className={`mb-4 text-3xl md:text-4xl font-semibold text-center ${
              isLight ? "text-gray-900" : "text-white"
            }`}
          >
            About SynerGene
          </h1>
          <div
            className={`mx-auto max-w-3xl space-y-5 ${
              isLight ? "text-gray-700" : "text-gray-200"
            } antialiased`}
            style={{ lineHeight: 1.8 }}
          >
            <p style={{ textAlign: "justify" }}>
              <span className="font-medium">SynerGene</span> is a research and
              development project created by Computer Science students at the
              University of Sharjah. The project is designed to assist researchers
              and scientists in the field of drug discovery by providing an advanced
              platform capable of predicting drug combination synergy scores with
              high accuracy.
            </p>

            <p style={{ textAlign: "justify" }}>
              The system leverages modern deep learning techniques, particularly{" "}
              <span className="font-medium">Graph Neural Networks (GNNs)</span>, to
              model and analyze complex molecular interactions between drugs and
              cancer cell lines. This helps researchers identify effective drug
              combinations, enhance treatment strategies, and accelerate the
              scientific discovery process.
            </p>

            <p style={{ textAlign: "justify" }}>
              SynerGene is designed with accessibility in mind. Its intuitive and
              user-friendly interface allows both technical and non-technical users
              to explore predictions, visualize insights, and work efficiently
              without requiring deep programming expertise.
            </p>
          </div>

          <div
            className={`mx-auto my-8 h-px w-24 ${
              isLight ? "bg-black/10" : "bg-white/20"
            }`}
          />
          <div className="mt-6 text-center">
            <p
              className={[
                "text-4xl md:text-6xl font-extrabold tracking-tight select-none",
                "bg-clip-text text-transparent",
                isLight
                  ? "bg-gradient-to-r from-[#184A80] via-[#2B9FFF] to-[#184A80]"
                  : "bg-gradient-to-r from-[#FFFFFF] via-[#A6D9FF] to-[#FFFFFF]",
              ].join(" ")}
            >
              Predict · Discover · Transform
            </p>
          </div>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
            {["Next.js", "Prisma", "Neon", "Clerk"].map((tag) => (
              <span
                key={tag}
                className={`
                  px-3 py-1.5 text-xs rounded-full transition-colors
                  ${isLight
                    ? "bg-gray-50 text-gray-700 ring-1 ring-black/10"
                    : "bg-white/10 text-white/90 ring-1 ring-white/30"
                  }
                `}
              >
                {tag}
              </span>
            ))}
          </div>
        </section>

      </div>
    </main>
  );
}
