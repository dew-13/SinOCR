export const PERMISSIONS = {
  // User management
  CREATE_ADMIN: ["owner"],
  CREATE_TEACHER: ["owner", "admin"],
  VIEW_ALL_USERS: ["owner", "admin"],
  UPDATE_USER: ["owner", "admin"],
  DELETE_USER: ["owner"],

  // Student management
  CREATE_STUDENT: ["owner", "admin"],
  UPDATE_STUDENT: ["owner", "admin"],
  DELETE_STUDENT: ["owner", "admin"],
  VIEW_STUDENTS: ["owner", "admin", "teacher"],
  VIEW_STUDENT_DETAILS: ["owner", "admin", "teacher"],

  // Company management
  CREATE_COMPANY: ["owner"],
  UPDATE_COMPANY: ["owner"],
  DELETE_COMPANY: ["owner"],
  VIEW_COMPANIES: ["owner"],

  // Employee management
  CREATE_EMPLOYEE: ["owner", "admin"],
  VIEW_EMPLOYEES: ["owner", "admin"],
  UPDATE_EMPLOYEE: ["owner", "admin"],

  // Analytics
  VIEW_DESCRIPTIVE_ANALYTICS: ["owner", "admin", "teacher"],
  VIEW_PREDICTIVE_ANALYTICS: ["owner"],
} as const

export function hasPermission(userRole: string, permission: keyof typeof PERMISSIONS): boolean {
  return PERMISSIONS[permission].includes(userRole as any)
}

export function checkPermission(userRole: string, permission: keyof typeof PERMISSIONS) {
  if (!hasPermission(userRole, permission)) {
    throw new Error("Insufficient permissions")
  }
}

export function getUserPermissions(role: string) {
  const permissions = []

  for (const [permission, roles] of Object.entries(PERMISSIONS)) {
    if (roles.includes(role as any)) {
      permissions.push(permission)
    }
  }

  return permissions
}
