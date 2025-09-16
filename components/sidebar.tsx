"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
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

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    router.push("/login")
  }

  const menuItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: Home,
      permission: "VIEW_DESCRIPTIVE_ANALYTICS",
    },
    {
      title: "Students",
      href: "/dashboard/students",
      icon: GraduationCap,
      permission: "VIEW_STUDENTS",
    },
    {
      title: "Add Student",
      href: "/dashboard/students/add",
      icon: UserPlus,
      permission: "CREATE_STUDENT",
    },
    {
      title: "Employees",
      href: "/dashboard/employees",
      icon: Briefcase,
      permission: "VIEW_EMPLOYEES",
    },
    {
      title: "Users",
      href: "/dashboard/users",
      icon: Users,
      permission: "VIEW_ALL_USERS",
    },
    {
      title: "Companies",
      href: "/dashboard/companies",
      icon: Building2,
      permission: "VIEW_COMPANIES",
    },
    {
      title: "Add Company",
      href: "/dashboard/companies/add",
      icon: Plus,
      permission: "CREATE_COMPANY",
    },
    {
      title: "Post Analysis",
      href: "/dashboard/analytics/descriptive",
      icon: BarChart3,
      permission: "VIEW_DESCRIPTIVE_ANALYTICS",
    },
    {
      title: "Pre Analysis",
      href: "/dashboard/analytics/predictive",
      icon: BrainCircuit,
      permission: "VIEW_PREDICTIVE_ANALYTICS",
    },
  ]

  const visibleItems = menuItems.filter((item) => hasPermission(userRole, item.permission as any))

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
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center gap-3 p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-600">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="font-bold text-lg text-gray-900 truncate">SMS</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={`text-xs px-2 py-0.5 ${getRoleBadgeColor(userRole)}`}>
                  {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
                </Badge>
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <p className="text-sm font-medium text-gray-900 truncate">{userName}</p>
            <p className="text-xs text-gray-500">Welcome back!</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {visibleItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200
                    ${
                      isActive
                        ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    }
                  `}
                  onClick={() => setIsOpen(false)}
                >
                  <Icon className={`h-5 w-5 ${isActive ? "text-white" : "text-gray-500"}`} />
                  <span className="truncate">{item.title}</span>
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
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
