"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import {
  Users,
  GraduationCap,
  Building2,
  BarChart3,
  LogOut,
  UserPlus,
  Shield,
  Menu,
  X,
  Plus,
  BrainCircuit,
  Briefcase,
  Home,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { hasPermission } from "@/lib/permissions"
import { Badge } from "@/components/ui/badge"

interface SidebarProps {
  userRole: string
  userName: string
}

export default function Sidebar({ userRole, userName }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams();
  const roleParam = searchParams.get("role");

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    router.push("/login")
  }

  // Sidebar content based on role
  let sidebarContent = null;

  if (userRole === "teacher") {
    sidebarContent = (
      <>
        <SidebarGroup label="Main" color="from-blue-100 to-blue-50" fontColor="text-blue-900" noMargin={true}>
          <SidebarLink href="/dashboard" icon={Home} label="Dashboard" pathname={pathname} setIsOpen={setIsOpen} />
        </SidebarGroup>
        <SidebarGroup label="Students" color="from-green-100 to-green-50" fontColor="text-green-900">
          <SidebarLink href="/dashboard/students" icon={GraduationCap} label="Registered Students" pathname={pathname} setIsOpen={setIsOpen} />
          <SidebarLink href="/dashboard/employees" icon={Briefcase} label="Employed Students" pathname={pathname} setIsOpen={setIsOpen} />
        </SidebarGroup>
        <SidebarGroup label="Analysis" color="from-indigo-100 to-indigo-50" fontColor="text-indigo-900">
          <SidebarLink href="/dashboard/analytics/descriptive" icon={BarChart3} label="Post Analysis" pathname={pathname} setIsOpen={setIsOpen} />
        </SidebarGroup>
      </>
    );
  } else if (userRole === "admin") {
    sidebarContent = (
      <>
        <SidebarGroup label="Main" color="from-blue-100 to-blue-50" fontColor="text-blue-900" noMargin={true}>
          <SidebarLink href="/dashboard" icon={Home} label="Dashboard" pathname={pathname} setIsOpen={setIsOpen} />
        </SidebarGroup>
        <SidebarGroup label="Students" color="from-green-100 to-green-50" fontColor="text-green-900">
          <SidebarLink href="/dashboard/students" icon={GraduationCap} label="Registered Students" pathname={pathname} setIsOpen={setIsOpen} />
          <SidebarLink href="/dashboard/students/add" icon={UserPlus} label="Add Students" pathname={pathname} setIsOpen={setIsOpen} />
          <SidebarLink href="/dashboard/employees" icon={Briefcase} label="Employed Students" pathname={pathname} setIsOpen={setIsOpen} />
        </SidebarGroup>
        <SidebarGroup label="Teachers" color="from-yellow-100 to-yellow-50" fontColor="text-yellow-900">
          <SidebarLink href="/dashboard/users" icon={Users} label="Teachers" pathname={pathname} setIsOpen={setIsOpen} />
          <SidebarButton label="Add Teachers" icon={UserPlus} onClick={() => router.push("/dashboard/users/add")} />
        </SidebarGroup>
        <SidebarGroup label="Analysis" color="from-indigo-100 to-indigo-50" fontColor="text-indigo-900">
          <SidebarLink href="/dashboard/analytics/descriptive" icon={BarChart3} label="Post Analysis" pathname={pathname} setIsOpen={setIsOpen} />
        </SidebarGroup>
      </>
    );
  } else if (userRole === "owner" || userRole === "developer") {
    sidebarContent = (
      <>
        <SidebarGroup label="Main" color="from-blue-100 to-blue-50" fontColor="text-blue-900" noMargin={true}>
          <SidebarLink href="/dashboard" icon={Home} label="Dashboard" pathname={pathname} setIsOpen={setIsOpen} />
          <SidebarLink href="/dashboard/companies" icon={Building2} label="Companies" pathname={pathname} setIsOpen={setIsOpen} />
        </SidebarGroup>
        <SidebarGroup label="Students" color="from-green-100 to-green-50" fontColor="text-green-900">
          <SidebarLink href="/dashboard/students" icon={GraduationCap} label="Registered Students" pathname={pathname} setIsOpen={setIsOpen} />
          <SidebarLink href="/dashboard/students/add" icon={UserPlus} label="Add Students" pathname={pathname} setIsOpen={setIsOpen} />
          <SidebarLink href="/dashboard/employees" icon={Briefcase} label="Employed Students" pathname={pathname} setIsOpen={setIsOpen} />
        </SidebarGroup>
        <SidebarGroup label="System Users" color="from-purple-100 to-purple-50" fontColor="text-purple-900">
          {userRole === "developer" && (
            <SidebarLink href="/dashboard/users?role=owner" icon={Users} label="Owners" pathname={pathname} setIsOpen={setIsOpen} />
          )}
          <SidebarLink href="/dashboard/users?role=admin" icon={Users} label="Admins" pathname={pathname} setIsOpen={setIsOpen} />
          <SidebarLink href="/dashboard/users?role=teacher" icon={Users} label="Teachers" pathname={pathname} setIsOpen={setIsOpen} />
        </SidebarGroup>
        <SidebarGroup label="Analysis" color="from-indigo-100 to-indigo-50" fontColor="text-indigo-900">
          <SidebarLink href="/dashboard/analytics/descriptive" icon={BarChart3} label="Post Analysis" pathname={pathname} setIsOpen={setIsOpen} />
          <SidebarLink href="/dashboard/analytics/predictive" icon={BrainCircuit} label="Pre Analysis" pathname={pathname} setIsOpen={setIsOpen} />
        </SidebarGroup>
      </>
    );
  }

  // SidebarLink, SidebarGroup, SidebarButton components
  function SidebarLink({ href, icon: Icon, label, pathname, setIsOpen }: any) {
    let isActive = pathname === href;
    if (href.startsWith("/dashboard/users?role=")) {
      const base = "/dashboard/users";
      const role = href.split("=")[1];
      isActive = pathname.startsWith(base) && roleParam === role;
    } else if (href.includes("?") && pathname.startsWith(href.split("?")[0])) {
      isActive = true;
    }
    return (
      <Link
        href={href}
        className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 w-full
          hover:bg-opacity-80 hover:scale-[1.03] active:scale-100
          ${isActive ? "bg-gradient-to-r from-blue-400 to-indigo-500 text-white shadow-md" : "opacity-90"}
        `}
        onClick={() => setIsOpen(false)}
        style={{ transition: 'all 0.15s cubic-bezier(.4,0,.2,1)' }}
      >
        <Icon className={`h-5 w-5`} />
        <span className="truncate">{label}</span>
      </Link>
    );
  }

  function SidebarGroup({ label, children, color, fontColor, noMargin = false }: any) {
    return (
      <div className={`rounded-xl ${noMargin ? 'mb-0' : 'mb-4'} pb-2 pt-1 px-1 bg-gradient-to-br ${color} shadow-sm`}> 
        <div className={`px-4 py-2 text-xs font-bold uppercase tracking-wider ${fontColor} mb-1`}>{label}</div>
        <div className="space-y-1">{children}</div>
      </div>
    );
  }

  function SidebarButton({ label, icon: Icon, onClick }: any) {
    return (
      <button
        className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 w-full
          hover:bg-yellow-200 hover:text-yellow-900 active:scale-100 opacity-90"
        onClick={onClick}
        type="button"
        style={{ transition: 'all 0.15s cubic-bezier(.4,0,.2,1)' }}
      >
        <Icon className="h-5 w-5" />
        <span className="truncate">{label}</span>
      </button>
    );
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "owner":
        return "bg-purple-100 text-purple-800"
      case "admin":
        return "bg-blue-100 text-blue-800"
      case "teacher":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="sm"
        className="fixed top-4 left-4 z-50 md:hidden bg-white shadow-md"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Sidebar */}
      <div
        className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out shadow-lg
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0 md:static md:inset-0 md:shadow-none
      `}
      >
        <div className="flex flex-col h-full bg-white">
          {/* Header */}
          <div className="flex items-center gap-3 p-6 bg-white">
            <img src="/sun.jpg" alt="Logo" className="h-10 w-10 rounded-full object-cover border border-gray-300 bg-white" />
            <div className="flex-1 min-w-0">
              <h1 className="font-bold text-lg text-gray-900 truncate">Sun Lanka</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={`text-xs px-2 py-0.5 ${getRoleBadgeColor(userRole)}`}>
                  {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
                </Badge>
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="px-6 py-4 bg-white">
            <p className="text-sm font-medium text-gray-900 truncate">{userName}</p>
            <p className="text-xs text-gray-500">Welcome back!</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {sidebarContent}
          </nav>

          {/* Footer */}
          <div className="p-4 bg-white">
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5 mr-3" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden" onClick={() => setIsOpen(false)} />
      )}
    </>
  )
}
