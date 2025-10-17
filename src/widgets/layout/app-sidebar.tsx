"use client"

import * as React from "react"
import Link from "next/link"
import { ChevronDown, ChevronUp, Folder, LogOut, Moon, Sun } from "lucide-react"
import { clearTokens, redirectToLogin } from "@/shared/lib/auth"
import { useThemeStore } from "@/shared/store/theme"
import { useUserStore } from "@/shared/store/user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/shared/components/ui/sidebar"

export function AppSidebar() {
  const [isProjectOpen, setIsProjectOpen] = React.useState<boolean>(true)
  const theme = useThemeStore((s) => s.theme)
  const toggleTheme = useThemeStore((s) => s.toggleTheme)
  const clearUser = useUserStore((s) => s.clearUser)

  const handleLogout = React.useCallback(() => {
    clearUser()
    clearTokens()
    redirectToLogin()
  }, [clearUser])

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setIsProjectOpen((prev) => !prev)}
                  data-state={isProjectOpen ? "open" : "closed"}
                >
                  <Folder />
                  <span className="group-data-[collapsible=icon]:hidden">Проект</span>
                  {isProjectOpen ? (
                    <ChevronUp className="ml-auto group-data-[collapsible=icon]:hidden" />
                  ) : (
                    <ChevronDown className="ml-auto group-data-[collapsible=icon]:hidden" />
                  )}
                </SidebarMenuButton>
                {isProjectOpen && (
                  <SidebarMenuSub>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild>
                        <Link href="/projects/new">
                          <span>Создать проект</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild>
                        <Link href="/projects/editor">
                          <span>Редактор проекта</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                )}
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="flex w-full justify-end gap-2 group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:justify-start">
          <SidebarMenuButton
            size="sm"
            className="w-auto"
            onClick={toggleTheme}
            tooltip={theme === "dark" ? "Светлая тема" : "Тёмная тема"}
          >
            {theme === "dark" ? <Sun /> : <Moon />}
          </SidebarMenuButton>
          <SidebarMenuButton
            size="sm"
            className="w-auto"
            onClick={handleLogout}
            tooltip="Выйти"
          >
            <LogOut />
          </SidebarMenuButton>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
