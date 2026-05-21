import React from 'react'
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from '@/components/ui/sidebar'
import { LogOut, Home, Users, FileText } from 'lucide-react'
import { Button } from './ui/button'

export default function Layout() {
  const { user, profile, signOut, isAdmin } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  if (!user) return <Outlet />

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-slate-50">
        <Sidebar className="border-r border-slate-200">
          <SidebarHeader className="p-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-lcdpr-primary text-white flex items-center justify-center font-black">
                L
              </div>
              <div>
                <h1 className="font-bold text-slate-800 leading-tight">LCDPR Master</h1>
                <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                  {profile?.companies?.name || 'Sem Empresa'}
                </p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={location.pathname === '/'}>
                      <Link to="/">
                        <Home className="mr-2 h-4 w-4" />
                        <span>Painel Principal</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  {isAdmin && (
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild isActive={location.pathname === '/admin'}>
                        <Link to="/admin">
                          <Users className="mr-2 h-4 w-4" />
                          <span>Equipe & Usuários</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="p-4 border-t border-slate-100">
            <div className="flex items-center justify-between w-full">
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-slate-800">{profile?.name}</span>
                <span className="text-xs text-slate-500 capitalize">{profile?.role}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSignOut}
                title="Sair"
                className="text-slate-500 hover:text-red-600"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  )
}
