"use client";

import { Spinner } from "@/src/components/ui/spinner";

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Spinner className="h-6 w-6" />
    </div>
  );
}