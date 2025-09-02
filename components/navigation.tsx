"use client"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Home, Users, Search, Bell, MessageCircle, GraduationCap, Settings, LogOut } from "lucide-react"
import { UserProfile } from "@/lib/auth-config"

type ActiveSection = "home" | "clubs" | "lost-found"

interface NavigationProps {
  activeSection: ActiveSection
  onSectionChange: (section: ActiveSection) => void
  user: UserProfile | null
  onLogout: () => void
}

export function Navigation({ activeSection, onSectionChange, user, onLogout }: NavigationProps) {
  const navItems = [
    { id: "home" as const, label: "Home", icon: Home },
    { id: "clubs" as const, label: "Clubs", icon: Users },
    { id: "lost-found" as const, label: "Lost & Found", icon: Search },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and brand */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary rounded-lg">
              <GraduationCap className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">SchoolConnect</span>
          </div>

          {/* Navigation items */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = activeSection === item.id

              return (
                <Button
                  key={item.id}
                  variant={isActive ? "default" : "ghost"}
                  className={`gap-2 ${isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  onClick={() => onSectionChange(item.id)}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Button>
              )
            })}
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-primary rounded-full text-xs"></span>
            </Button>

            {/* Messages */}
            <Button variant="ghost" size="icon">
              <MessageCircle className="h-5 w-5" />
            </Button>

            {/* User menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.profilePicture || "/placeholder-user.jpg"} alt="Profile" />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {user.name?.split(" ").map(n => n[0]).join("") || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex flex-col space-y-1 p-2">
                    <p className="text-sm font-medium leading-none">{user.name || "User"}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    <p className="text-xs leading-none text-muted-foreground capitalize">{user.role}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              // Show placeholder when no user (during loading or not authenticated)
              <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
            )}
          </div>

          {/* Mobile navigation */}
          <div className="md:hidden flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <div className="flex flex-col gap-1">
                    <div className="w-4 h-0.5 bg-current"></div>
                    <div className="w-4 h-0.5 bg-current"></div>
                    <div className="w-4 h-0.5 bg-current"></div>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                {navItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <DropdownMenuItem
                      key={item.id}
                      onClick={() => onSectionChange(item.id)}
                      className={activeSection === item.id ? "bg-accent" : ""}
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      <span>{item.label}</span>
                    </DropdownMenuItem>
                  )
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  )
}
