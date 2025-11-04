"use client"

import type React from "react"
import { AppSidebar } from "@/src/components/layout/app-sidebar";
import { AppHeader } from "@/src/components/layout/app-header";
import { Breadcrumbs } from "@/src/components/layout/breadcrumbs";
import { ProtectedRoute } from "@/src/components/auth/protected-route";
import { useIsMobile } from "@/src/hooks/use-mobile";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute>
      <div className="flex h-screen overflow-hidden">
        <AppSidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <AppHeader />
          <main className="flex-1 overflow-y-auto">
            <div className="container mx-auto p-4 md:p-6">
              <div className="mb-6">
                <Breadcrumbs />
              </div>
              {children}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
