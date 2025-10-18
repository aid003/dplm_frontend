"use client";

import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/shared/components/ui/sidebar";
import { AppSidebar } from "@/widgets/layout/app-sidebar";
import { GlobalSpinner } from "@/shared/components/ui/global-spinner";
import { useGlobalSpinnerStore } from "@/shared/store/global-spinner";

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { isVisible, message } = useGlobalSpinnerStore();

  return (
    <>
      <GlobalSpinner isVisible={isVisible} message={message} />
      <SidebarInset className="overflow-x-hidden">
        <div className="flex items-center gap-2 p-2">
          <SidebarTrigger />
        </div>
        {children}
      </SidebarInset>
    </>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <LayoutContent>{children}</LayoutContent>
    </SidebarProvider>
  );
}
