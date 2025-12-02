"use client";

import { Spinner } from "@/src/components/ui/spinner";

export default function Loading() {
  return (
    <div className="flex items-center justify-center h-[60vh]">
      <Spinner className="h-6 w-6" />
    </div>
  );
}