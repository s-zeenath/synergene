"use client";
import React from "react";
import Card, { useCardTheme } from "@/components/ui/Card";
import Button from "@/components/ui/Button";

interface ReportCardProps {
  latestReportDate: string;
}

export default function ReportCard({ latestReportDate }: ReportCardProps) {
  const { textColor, highlightColor } = useCardTheme();

  return (
    <Card minHeight="375px" className="p-6">
      <div className="mb-6">
        <p className={`text-xl sm:text-2xl md:text-3xl font-bold ${textColor}`}>
          Latest report saved on:
        </p>
        <p
          className={`text-xl sm:text-2xl md:text-3xl font-bold mt-1 ${highlightColor}`}
        >
          {latestReportDate}
        </p>
      </div>

      <div className="flex items-center justify-between mt-4">
        <div
          className="flex flex-col gap-3 pl-15"
          style={{ minWidth: "180px" }}
        >
          <Button
            href="/view-reports"
            variant="secondary"
            className="w-full py-3 text-base text-center"
          >
            View reports
          </Button>
          <Button
            href="/generate-report"
            variant="secondary"
            className="w-full py-3 text-base text-center"
          >
            Generate report
          </Button>
        </div>

        <div className="flex-1 flex justify-end pr-6">
          <img
            src="/report.png"
            alt="report"
            className="h-50 w-auto object-contain"
          />
        </div>
      </div>
    </Card>
  );
}
