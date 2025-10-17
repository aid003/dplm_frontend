import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/shared/components/ui/sidebar";
import { AppSidebar } from "@/widgets/layout/app-sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="flex items-center gap-2 p-2">
          <SidebarTrigger />
        </div>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
