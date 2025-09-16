"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Eye, Edit, Download, Search, Filter } from "lucide-react"
import { hasPermission } from "@/lib/permissions"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent } from "@/components/ui/dropdown-menu"
import { Select, SelectItem, SelectTrigger, SelectContent } from "@/components/ui/select"

export default function StudentsPage() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchLoading, setSearchLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [search, setSearch] = useState("")
  const [filters, setFilters] = useState({
    marital_status: [] as string[],
    sex: [] as string[],
    district: "",
    has_driving_license: [] as string[],
  })
    const [editingStatusId, setEditingStatusId] = useState<string | null>(null);
    const [newStatus, setNewStatus] = useState<string>("");
    const [confirmOpen, setConfirmOpen] = useState(false);
    const statusOptions = ["pending", "active", "employed"];

    // Confirmation dialog for status change
    const handleConfirmStatusChange = async () => {
      if (!editingStatusId || !newStatus) return;
      setConfirmOpen(false);
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`/api/students/${editingStatusId}/status`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        });
        if (response.ok) {
          setMessage("Status updated successfully.");
          setMessageType("success");
          fetchStudents();
        } else {
          setMessage("Failed to update status.");
          setMessageType("error");
        }
      } catch (error) {
        setMessage("Error updating status.");
        setMessageType("error");
      } finally {
        setEditingStatusId(null);
        setNewStatus("");
        setLoading(false);
        setTimeout(() => {
          setMessage("");
          setMessageType("");
        }, 3000);
      }
    };

    // Simple confirmation dialog
    function ConfirmDialog({ open, onConfirm, onCancel }: { open: boolean; onConfirm: () => void; onCancel: () => void }) {
      if (!open) return null;
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded shadow-lg p-6 w-80">
            <h2 className="text-lg font-bold mb-2">Confirm Status Change</h2>
            <p className="mb-4">Are you sure you want to change the status?</p>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={onConfirm}>Yes</Button>
              <Button variant="outline" onClick={onCancel}>No</Button>
            </div>
          </div>
        </div>
      );
    }
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<"success" | "error" | "">("")
  const [filterOpen, setFilterOpen] = useState(false)
  const searchTimeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      setUser(JSON.parse(userData))
    }
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    setLoading(true)
    setSearchLoading(true)
    try {
      const token = localStorage.getItem("token")
      const url = new URL(window.location.origin + "/api/students")
      if (search) url.searchParams.append("q", search)
      if (filters.marital_status.length > 0) url.searchParams.append("marital_status", filters.marital_status.join(","))
      if (filters.sex.length > 0) url.searchParams.append("sex", filters.sex.join(","))
      if (filters.has_driving_license.length > 0) url.searchParams.append("has_driving_license", filters.has_driving_license.join(","))
      if (filters.district && filters.district !== "all") url.searchParams.append("district", filters.district)
      const response = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        // Sort students by full_name in ascending order
        const sortedStudents = data.sort((a: any, b: any) => {
          const nameA = (a.full_name || '').toLowerCase()
          const nameB = (b.full_name || '').toLowerCase()
          return nameA.localeCompare(nameB)
        })
        setStudents(sortedStudents)
      }
    } catch (error) {
      console.error("Failed to fetch students:", error)
    } finally {
      setLoading(false)
      setSearchLoading(false)
    }
  }

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Filter to allow only alphanumeric characters and spaces
    const filteredValue = value.replace(/[^a-zA-Z0-9\s]/g, '')
    setSearch(filteredValue)
    setSearchLoading(true)
    
    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }
    
    // Set new timeout for smooth search
    searchTimeoutRef.current = setTimeout(() => {
      fetchStudents()
    }, 300) // 300ms delay for smooth search
  }

  const handleClearSearch = () => {
    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }
    
    setSearch("")
    setSearchLoading(true)
    
    // Fetch all students immediately after clearing search
    const token = localStorage.getItem("token")
    const url = new URL(window.location.origin + "/api/students")
    if (filters.marital_status.length > 0) url.searchParams.append("marital_status", filters.marital_status.join(","))
    if (filters.sex.length > 0) url.searchParams.append("sex", filters.sex.join(","))
    if (filters.has_driving_license.length > 0) url.searchParams.append("has_driving_license", filters.has_driving_license.join(","))
    if (filters.district && filters.district !== "all") url.searchParams.append("district", filters.district)
    
    fetch(url.toString(), {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then(response => {
      if (response.ok) {
        return response.json()
      }
      throw new Error('Failed to fetch students')
    })
    .then(data => {
      // Sort students by full_name in ascending order
      const sortedStudents = data.sort((a: any, b: any) => {
        const nameA = (a.full_name || '').toLowerCase()
        const nameB = (b.full_name || '').toLowerCase()
        return nameA.localeCompare(nameB)
      })
      setStudents(sortedStudents)
    })
    .catch(error => {
      console.error("Failed to fetch students:", error)
    })
    .finally(() => {
      setLoading(false)
      setSearchLoading(false)
    })
  }

  useEffect(() => {
    fetchStudents()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [])

  const handleCheckboxChange = (filterKey: "marital_status" | "sex" | "has_driving_license", value: string) => {
    setFilters(prev => {
      const arr = prev[filterKey]
      let newArr
      if (arr.includes(value)) {
        newArr = arr.filter(v => v !== value)
      } else {
        newArr = [...arr, value]
      }
      return { ...prev, [filterKey]: newArr }
    })
  }

  const handleFilterInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleDistrictChange = (value: string) => {
    setFilters(prev => ({ ...prev, district: value }))
  }

  const handleApplyFilters = () => {
    setFilterOpen(false)
  }

  const handleClearFilters = () => {
    setFilters({
      marital_status: [],
      sex: [],
      district: "",
      has_driving_license: [],
    })
    setFilterOpen(false)
    setTimeout(() => {
      fetchStudents()
    }, 0)
  }

  const handleExportCSV = async () => {
    try {
      const token = localStorage.getItem("token")
      const url = new URL(window.location.origin + "/api/students")
      if (search) url.searchParams.append("q", search)
      if (filters.marital_status.length > 0) url.searchParams.append("marital_status", filters.marital_status.join(","))
      if (filters.sex.length > 0) url.searchParams.append("sex", filters.sex.join(","))
      if (filters.has_driving_license.length > 0) url.searchParams.append("has_driving_license", filters.has_driving_license.join(","))
      if (filters.district && filters.district !== "all") url.searchParams.append("district", filters.district)
      url.searchParams.append("format", "csv")
      const response = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const blob = await response.blob()
        const link = document.createElement("a")
        link.href = window.URL.createObjectURL(blob)
        link.download = "students.csv"
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        setMessage("Student data exported successfully.")
        setMessageType("success")
      } else {
        setMessage("Could not export student data.")
        setMessageType("error")
      }
    } catch (error) {
      setMessage("An error occurred while exporting.")
      setMessageType("error")
    } finally {
      setTimeout(() => {
        setMessage("")
        setMessageType("")
      }, 3000)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="text-blue-600">Student Management</span>
          </h1>
          <p className="text-muted-foreground">Manage student information and records</p>
        </div>
        <div className="flex gap-2 items-center w-full md:w-auto">
          <Button variant="outline" onClick={handleExportCSV}><Download className="h-4 w-4 mr-2" />Export CSV</Button>
          {message && (
            <span className={`ml-4 px-3 py-1 rounded text-sm whitespace-nowrap ${messageType === "success" ? "bg-green-100 text-green-800 border border-green-300" : "bg-red-100 text-red-800 border border-red-300"}`}>
              {message}
            </span>
          )}
          {user && hasPermission(user.role, "CREATE_STUDENT") && (
            <Link href="/dashboard/students/add">
              <Button><Plus className="h-4 w-4 mr-2" />Add Student</Button>
            </Link>
          )}
        </div>
      </div>

      {/* Search Bar and Filters */}
      <div className="flex gap-3 items-center">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            type="text"
            placeholder="Search students by name, national ID, passport ID, or phone number..."
            value={search}
            onChange={handleSearchInput}
            className="pl-10 pr-4 py-3 text-base"
          />
          {searchLoading && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
            </div>
          )}
          {search && !searchLoading && (
            <button
              onClick={handleClearSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        
        <DropdownMenu open={filterOpen} onOpenChange={setFilterOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary"><Filter className="h-4 w-4 mr-2" />Filters</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64">
            <div className="px-2 py-1 text-xs font-semibold text-gray-500">Marital Status</div>
            {["single", "married", "divorced", "widowed"].map(option => (
              <label key={option} className="flex items-center px-2 py-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.marital_status.includes(option)}
                  onChange={() => handleCheckboxChange("marital_status", option)}
                  className="mr-2"
                />
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </label>
            ))}
            <div className="px-2 py-1 text-xs font-semibold text-gray-500">Gender</div>
            {["male", "female"].map(option => (
              <label key={option} className="flex items-center px-2 py-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.sex.includes(option)}
                  onChange={() => handleCheckboxChange("sex", option)}
                  className="mr-2"
                />
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </label>
            ))}
            <div className="px-2 py-1 text-xs font-semibold text-gray-500">Has Driving License</div>
            {["true", "false"].map(option => (
              <label key={option} className="flex items-center px-2 py-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.has_driving_license.includes(option)}
                  onChange={() => handleCheckboxChange("has_driving_license", option)}
                  className="mr-2"
                />
                {option === "true" ? "Yes" : "No"}
              </label>
            ))}
            <div className="px-2 py-1 text-xs font-semibold text-gray-500">District</div>
            <Select value={filters.district} onValueChange={handleDistrictChange}>
              <SelectTrigger className="w-full mb-2">
                {filters.district || "Select District"}
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Districts</SelectItem>
                <SelectItem value="Ampara">Ampara</SelectItem>
                <SelectItem value="Anuradhapura">Anuradhapura</SelectItem>
                <SelectItem value="Badulla">Badulla</SelectItem>
                <SelectItem value="Batticaloa">Batticaloa</SelectItem>
                <SelectItem value="Colombo">Colombo</SelectItem>
                <SelectItem value="Galle">Galle</SelectItem>
                <SelectItem value="Gampaha">Gampaha</SelectItem>
                <SelectItem value="Hambantota">Hambantota</SelectItem>
                <SelectItem value="Jaffna">Jaffna</SelectItem>
                <SelectItem value="Kalutara">Kalutara</SelectItem>
                <SelectItem value="Kandy">Kandy</SelectItem>
                <SelectItem value="Kegalle">Kegalle</SelectItem>
                <SelectItem value="Kilinochchi">Kilinochchi</SelectItem>
                <SelectItem value="Kurunegala">Kurunegala</SelectItem>
                <SelectItem value="Mannar">Mannar</SelectItem>
                <SelectItem value="Matale">Matale</SelectItem>
                <SelectItem value="Matara">Matara</SelectItem>
                <SelectItem value="Monaragala">Monaragala</SelectItem>
                <SelectItem value="Mullaitivu">Mullaitivu</SelectItem>
                <SelectItem value="Nuwara Eliya">Nuwara Eliya</SelectItem>
                <SelectItem value="Polonnaruwa">Polonnaruwa</SelectItem>
                <SelectItem value="Puttalam">Puttalam</SelectItem>
                <SelectItem value="Ratnapura">Ratnapura</SelectItem>
                <SelectItem value="Trincomalee">Trincomalee</SelectItem>
                <SelectItem value="Vavuniya">Vavuniya</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="secondary" className="w-full mt-2" onClick={handleApplyFilters}>Apply Filters</Button>
            <Button variant="outline" className="w-full mt-2" onClick={handleClearFilters}>Clear Filters</Button>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Search Results Info */}
      {search && (
        <div className="text-sm text-muted-foreground">
          {searchLoading ? (
            <span>Searching...</span>
          ) : (
            <span>
              Found {students.length} student{students.length !== 1 ? 's' : ''} 
              {search && ` for "${search}"`}
            </span>
          )}
        </div>
      )}

      <div className="grid gap-4">
        {students.map((student: any) => (
            <Card key={student.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{student.full_name}</CardTitle>
                    <CardDescription>
                      {student.district}, {student.province} • {student.mobile_phone}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {editingStatusId === student.id ? (
                      <>
                        <select
                          className="border rounded px-2 py-1 text-sm"
                          value={newStatus || student.status}
                          onChange={e => setNewStatus(e.target.value)}
                        >
                          {statusOptions.map(opt => (
                            <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>
                          ))}
                        </select>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setConfirmOpen(true)}
                          disabled={!newStatus || newStatus === student.status}
                        >
                          Save
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => { setEditingStatusId(null); setNewStatus(""); }}>
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        <Badge variant={student.status === "employed" ? "default" : "secondary"}>{student.status}</Badge>
                        {user && hasPermission(user.role, "UPDATE_STUDENT") && (
                          <Button variant="outline" size="sm" onClick={() => { setEditingStatusId(student.id); setNewStatus(student.status); }}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="font-medium">Education</p>
                    <p className="text-muted-foreground">{student.education_qualification}</p>
                  </div>
                  <div>
                    <p className="font-medium">Age</p>
                    <p className="text-muted-foreground">
                      {new Date().getFullYear() - new Date(student.date_of_birth).getFullYear()} years
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">Marital Status</p>
                    <p className="text-muted-foreground capitalize">{student.marital_status}</p>
                  </div>
                  <div>
                    <p className="font-medium">Driving License</p>
                    <p className="text-muted-foreground">
                      {student.has_driving_license ? `Yes (${student.vehicle_type})` : "No"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>

      {students.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>No Students Found</CardTitle>
            <CardDescription>
              {user && hasPermission(user.role, "CREATE_STUDENT")
                ? "Get started by adding your first student."
                : "No students have been registered yet."}
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  )
}
