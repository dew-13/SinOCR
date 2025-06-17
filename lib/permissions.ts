export const PERMISSIONS = {
  // User management
  CREATE_ADMIN: ["owner", "developer"],
  CREATE_TEACHER: ["owner", "admin", "developer"],
  VIEW_ALL_USERS: ["owner", "admin", "developer"],
  UPDATE_USER: ["owner", "admin", "developer"],
  DELETE_USER: ["owner", "developer"],

  // Student management
  CREATE_STUDENT: ["owner", "admin", "developer"],
  UPDATE_STUDENT: ["owner", "admin", "developer"],
  DELETE_STUDENT: ["owner", "admin", "developer"],
  VIEW_STUDENTS: ["owner", "admin", "teacher", "developer"],
  VIEW_STUDENT_DETAILS: ["owner", "admin", "teacher", "developer"],

  // Company management
  CREATE_COMPANY: ["owner", "developer"],
  UPDATE_COMPANY: ["owner", "developer"],
  DELETE_COMPANY: ["owner", "developer"],
  VIEW_COMPANIES: ["owner", "developer"],

  // Employee management
  CREATE_EMPLOYEE: ["owner", "admin", "developer"],
  VIEW_EMPLOYEES: ["owner", "admin", "teacher", "developer"],
  UPDATE_EMPLOYEE: ["owner", "admin", "developer"],

  // Analytics
  VIEW_BASIC_ANALYTICS: ["owner", "admin", "teacher", "developer"],
  VIEW_DESCRIPTIVE_ANALYTICS: ["owner", "admin", "teacher", "developer"],
  VIEW_PREDICTIVE_ANALYTICS: ["owner", "developer"],
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
