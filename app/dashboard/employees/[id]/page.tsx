"use client"

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Building2, 
  Phone, 
  User, 
  FileText, 
  Languages, 
  Calendar, 
  MapPin, 
  ArrowLeft,
  Mail,
  GraduationCap,
  Heart,
  Users,
  MessageSquare,
  Shield,
  Car,
  Briefcase
} from "lucide-react";

function formatDate(date: string) {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}

function calculateAge(dateOfBirth: string) {
  if (!dateOfBirth) return "Unknown";
  const birth = new Date(dateOfBirth);
  const today = new Date();
  const age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    return age - 1;
  }
  return age;
}

function getStatusColor(status: string) {
  switch (status?.toLowerCase()) {
    case "employed": return "default";
    case "active": return "secondary";
    case "pending": return "outline";
    default: return "secondary";
  }
}

export default function EmploymentDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const employmentId = params?.id;
  const [employment, setEmployment] = useState<any>(null);
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!employmentId) return;
    fetchEmploymentAndStudent();
  }, [employmentId]);

  const fetchEmploymentAndStudent = async () => {
    try {
      const token = localStorage.getItem("token");
      
      // Fetch employment details
      const employmentResponse = await fetch(`/api/placements/${employmentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!employmentResponse.ok) {
        setError("Failed to load employment details.");
        setLoading(false);
        return;
      }
      
      const employmentData = await employmentResponse.json();
      setEmployment(employmentData);
      
      // Fetch complete student details using student_id from employment
      if (employmentData.student_id) {
        const studentResponse = await fetch(`/api/students/${employmentData.student_id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (studentResponse.ok) {
          const studentData = await studentResponse.json();
          setStudent(studentData);
        }
      }
    } catch (err) {
      setError("Network error occurred.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (error || !employment) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
            <CardDescription>
              {error || "Employment record not found"}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header with Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Employment Details</h1>
            <p className="text-sm text-gray-600">Complete student and employment information</p>
          </div>
        </div>
      </div>

      {/* Main Student Info Card */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 border-b">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-xl text-gray-900">{employment.student_name}</CardTitle>
                <CardDescription className="text-base">
                  Student ID: {student?.student_id || "N/A"}
                </CardDescription>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="default" className="capitalize">
                    Employed
                  </Badge>
                  <Badge variant="outline">
                    {student?.sex || "N/A"}
                  </Badge>
                  {student?.date_of_birth && (
                    <Badge variant="outline">
                      {calculateAge(student.date_of_birth)} years old
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Information Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Employment Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-green-600" />
              Employment Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Company</p>
                <p className="text-sm text-gray-900 flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-gray-400" />
                  {employment.company_name}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Industry</p>
                <p className="text-sm text-gray-900">{employment.industry || "General"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Visa Type</p>
                <p className="text-sm text-gray-900 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-400" />
                  {employment.visa_type || "-"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Language Proficiency</p>
                <p className="text-sm text-gray-900 flex items-center gap-2">
                  <Languages className="h-4 w-4 text-gray-400" />
                  {employment.language_proficiency || "Not specified"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Employment Duration</p>
                <p className="text-sm text-gray-900 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  {formatDate(employment.start_date)} — {formatDate(employment.end_date)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Company Address</p>
                <p className="text-sm text-gray-900 flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                  {employment.company_address || "-"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Resident Address</p>
                <p className="text-sm text-gray-900 flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                  {employment.resident_address || "-"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Emergency Contact</p>
                <p className="text-sm text-gray-900 flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  {employment.emergency_contact || "-"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Information */}
        {student && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">National ID</p>
                  <p className="text-sm text-gray-900">{student.national_id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Date of Birth</p>
                  <p className="text-sm text-gray-900">{formatDate(student.date_of_birth)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Marital Status</p>
                  <p className="text-sm text-gray-900 capitalize">{student.marital_status}</p>
                </div>
                {student.spouse_name && (
                  <div>
                    <p className="text-sm font-medium text-gray-600">Spouse Name</p>
                    <p className="text-sm text-gray-900">{student.spouse_name}</p>
                  </div>
                )}
                {student.number_of_children !== undefined && student.number_of_children > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-600">Children</p>
                    <p className="text-sm text-gray-900">{student.number_of_children}</p>
                  </div>
                )}
              </div>
              
              {student.passport_id && (
                <>
                  <Separator />
                  <div>
                    <h4 className="text-sm font-medium text-gray-600 mb-2 flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Passport Information
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Passport ID</p>
                        <p className="text-sm text-gray-900">{student.passport_id}</p>
                      </div>
                      {student.passport_expired_date && (
                        <div>
                          <p className="text-xs text-gray-500">Expiry Date</p>
                          <p className="text-sm text-gray-900">{formatDate(student.passport_expired_date)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Contact Information */}
        {student && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-green-600" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Mobile Phone</p>
                    <p className="text-sm text-gray-900">{student.mobile_phone}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">WhatsApp</p>
                    <p className="text-sm text-gray-900">{student.whatsapp_number}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Email</p>
                    <p className="text-sm text-gray-900">{student.email_address}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Address</p>
                    <p className="text-sm text-gray-900">{student.permanent_address}</p>
                    <p className="text-xs text-gray-500">{student.district}, {student.province}</p>
                  </div>
                </div>
              </div>

              {student.guardian_name && (
                <>
                  <Separator />
                  <div>
                    <h4 className="text-sm font-medium text-gray-600 mb-2 flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Guardian Information
                    </h4>
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs text-gray-500">Guardian Name</p>
                        <p className="text-sm text-gray-900">{student.guardian_name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Guardian Contact</p>
                        <p className="text-sm text-gray-900">{student.guardian_contact}</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Education & Experience */}
        {student && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-purple-600" />
                Education & Experience
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${student.education_ol ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <span className="text-sm">O/L Certificate</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${student.education_al ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <span className="text-sm">A/L Certificate</span>
                </div>
              </div>
              
              {student.other_qualifications && (
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Other Qualifications</p>
                  <p className="text-sm text-gray-900">{student.other_qualifications}</p>
                </div>
              )}
              
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Expected Job Category</p>
                <Badge variant="outline" className="text-sm">
                  {student.expected_job_category}
                </Badge>
              </div>

              {student.work_experience && (
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Local Work Experience</p>
                  <p className="text-sm text-gray-900">{student.work_experience}</p>
                </div>
              )}
              
              {student.work_experience_abroad && (
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">International Experience</p>
                  <p className="text-sm text-gray-900">{student.work_experience_abroad}</p>
                </div>
              )}

              <Separator />
              
              <div>
                <h4 className="text-sm font-medium text-gray-600 mb-2 flex items-center gap-2">
                  <Car className="h-4 w-4" />
                  Driving License
                </h4>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${student.has_driving_license ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <span className="text-sm">
                    {student.has_driving_license ? `Licensed` : 'No License'}
                    {student.vehicle_type && ` - ${student.vehicle_type}`}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

      </div>

      {/* System Information */}
      {student && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-gray-600" />
              System Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="font-medium text-gray-600">Admission Date</p>
                <p className="text-gray-900">{formatDate(student.admission_date || student.created_at)}</p>
              </div>
              <div>
                <p className="font-medium text-gray-600">Registration Date</p>
                <p className="text-gray-900">{formatDate(student.created_at)}</p>
              </div>
              <div>
                <p className="font-medium text-gray-600">Last Updated</p>
                <p className="text-gray-900">{formatDate(student.updated_at)}</p>
              </div>
              <div>
                <p className="font-medium text-gray-600">Current Status</p>
                <Badge variant={getStatusColor(student.status)} className="capitalize">
                  {student.status}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
