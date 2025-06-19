"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check, ChevronsUpDown, User, Calendar, Building2, MapPin, Phone, FileText, Languages, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

interface Student {
  id: number
  full_name: string
  national_id: string
}

interface Company {
  id: number
  company_name: string
  country: string
}

interface EmploymentFormProps {
  placement?: any
  isEdit?: boolean
}

export default function EmploymentForm({ placement, isEdit = false }: EmploymentFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [students, setStudents] = useState<Student[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [searchValue, setSearchValue] = useState("")
  const [open, setOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)

  const [formData, setFormData] = useState({
    studentId: "",
    startDate: "",
    endDate: "",
    visaType: "",
    companyName: "",
    companyAddress: "",
    industry: "",
    residentAddress: "",
    emergencyContact: "",
    languageProficiency: "",
    photo: ""
  })

  useEffect(() => {
    fetchStudents()
    fetchCompanies()
  }, [])

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/students", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setStudents(data)
      }
    } catch (error) {
      console.error("Failed to fetch students:", error)
    }
  }

  const fetchCompanies = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/companies", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setCompanies(data)
      }
    } catch (error) {
      console.error("Failed to fetch companies:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (!selectedStudent) {
      setError("Please select a student")
      setLoading(false)
      return
    }

    if (!formData.companyName) {
      setError("Please select a company")
      setLoading(false)
      return
    }

    try {
      const token = localStorage.getItem("token")
      const url = isEdit ? `/api/placements/${placement.placement_id}` : "/api/placements"
      const method = isEdit ? "PUT" : "POST"

      const requestData = {
        ...formData,
        studentId: selectedStudent.id
      }

      console.log("Sending placement data:", requestData)

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestData),
      })

      const data = await response.json()

      if (response.ok) {
        router.push("/dashboard/employees")
      } else {
        const errorData = await response.json()
        console.error("API Error Response:", errorData)
        setError(errorData.error || errorData.details || `HTTP ${response.status}: ${response.statusText}`)
      }
    } catch (error) {
      console.error("Network error:", error)
      setError(`Network error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const filteredStudents = students.filter(student =>
    student.full_name.toLowerCase().includes(searchValue.toLowerCase()) ||
    student.national_id.includes(searchValue)
  )

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          {isEdit ? "Edit Employment" : "New Employment"}
        </CardTitle>
        <CardDescription>
          {isEdit ? "Update employment details" : "Add a new employment record for a student"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Student Selection */}
          <div className="space-y-2">
            <Label htmlFor="student">Student Name *</Label>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between"
                >
                  {selectedStudent ? selectedStudent.full_name : "Select student..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput 
                    placeholder="Search students..." 
                    value={searchValue}
                    onValueChange={setSearchValue}
                  />
                  <CommandList>
                    <CommandEmpty>No student found.</CommandEmpty>
                    <CommandGroup>
                      {filteredStudents.map((student) => (
                        <CommandItem
                          key={student.id}
                          value={student.full_name}
                          onSelect={() => {
                            setSelectedStudent(student)
                            setOpen(false)
                            setSearchValue("")
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedStudent?.id === student.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <div className="flex flex-col">
                            <span>{student.full_name}</span>
                            <span className="text-sm text-muted-foreground">ID: {student.national_id}</span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date *</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange("startDate", e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date *</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange("endDate", e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
          </div>

          {/* Visa Type */}
          <div className="space-y-2">
            <Label htmlFor="visaType">Visa Type *</Label>
            <Select value={formData.visaType} onValueChange={(value) => handleInputChange("visaType", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select visa type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Specified Skilled Worker System (SSW)">Specified Skilled Worker System (SSW)</SelectItem>
                <SelectItem value="Technical Intern Training System (TITP)">Technical Intern Training System (TITP)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Company Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Company Information
            </h3>
            
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name *</Label>
              <Select value={formData.companyName} onValueChange={(value) => handleInputChange("companyName", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select company" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.company_name}>
                      {company.company_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyAddress">Company Address *</Label>
              <Textarea
                id="companyAddress"
                value={formData.companyAddress}
                onChange={(e) => handleInputChange("companyAddress", e.target.value)}
                placeholder="Enter company address"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="industry">Industry *</Label>
              <Select value={formData.industry} onValueChange={(value) => handleInputChange("industry", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Nursing care">Nursing care</SelectItem>
                  <SelectItem value="Building Cleaning">Building Cleaning</SelectItem>
                  <SelectItem value="Industrial manufacturing">Industrial manufacturing</SelectItem>
                  <SelectItem value="Construction">Construction</SelectItem>
                  <SelectItem value="Shipbuilding and Marine Industry">Shipbuilding and Marine Industry</SelectItem>
                  <SelectItem value="Automobile Maintenance">Automobile Maintenance</SelectItem>
                  <SelectItem value="Aviation">Aviation</SelectItem>
                  <SelectItem value="Accommodation">Accommodation</SelectItem>
                  <SelectItem value="Automobile transport industry">Automobile transport industry</SelectItem>
                  <SelectItem value="Railway">Railway</SelectItem>
                  <SelectItem value="Agriculture">Agriculture</SelectItem>
                  <SelectItem value="Fisheries">Fisheries</SelectItem>
                  <SelectItem value="Food and beverage manufacturing">Food and beverage manufacturing</SelectItem>
                  <SelectItem value="Food service">Food service</SelectItem>
                  <SelectItem value="Forestry">Forestry</SelectItem>
                  <SelectItem value="Timber Industry">Timber Industry</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Resident Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Resident Information
            </h3>
            
            <div className="space-y-2">
              <Label htmlFor="residentAddress">Resident Address *</Label>
              <Textarea
                id="residentAddress"
                value={formData.residentAddress}
                onChange={(e) => handleInputChange("residentAddress", e.target.value)}
                placeholder="Enter resident address"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergencyContact">Emergency Contact *</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={(e) => handleInputChange("emergencyContact", e.target.value)}
                  placeholder="Enter emergency contact number"
                  className="pl-10"
                  required
                />
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Additional Information
            </h3>
            
            <div className="space-y-2">
              <Label htmlFor="languageProficiency">Language Proficiency *</Label>
              <Select value={formData.languageProficiency} onValueChange={(value) => handleInputChange("languageProficiency", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select language proficiency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="N5">N5</SelectItem>
                  <SelectItem value="N4">N4</SelectItem>
                  <SelectItem value="N3">N3</SelectItem>
                  <SelectItem value="JLPT">JLPT</SelectItem>
                  <SelectItem value="JFT">JFT</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="photo">Photo URL</Label>
              <Input
                id="photo"
                type="url"
                value={formData.photo}
                onChange={(e) => handleInputChange("photo", e.target.value)}
                placeholder="Enter photo URL (optional)"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Saving..." : isEdit ? "Update Employment" : "Save New Employee"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/dashboard/employees")}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
} 