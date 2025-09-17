"use client"

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Mail, Phone } from "lucide-react";

export default function CompanyDetailsPage() {
  const params = useParams();
  const companyId = params?.id;
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!companyId) return;
    const fetchCompany = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`/api/companies/${companyId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setCompany(data);
        } else {
          setError("Failed to load company information.");
        }
      } catch (err) {
        setError("Network error occurred.");
      } finally {
        setLoading(false);
      }
    };
    fetchCompany();
  }, [companyId]);

  if (loading) {
    return <div className="p-8 text-center">Loading company information...</div>;
  }
  if (error || !company) {
    return <div className="p-8 text-center text-red-600">{error || "Company not found."}</div>;
  }

  return (
    <div className="max-w-3xl mx-auto mt-10 px-4">
      <Card className="shadow-lg border-0 rounded-2xl bg-white">
        <CardHeader className="pb-0">
          <div className="flex items-center gap-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-r from-green-500 to-blue-600 shadow-md">
              <Building2 className="h-8 w-8 text-white" />
            </div>
            <div>
              <CardTitle className="text-3xl font-bold text-gray-900 mb-1">{company.company_name}</CardTitle>
              <CardDescription className="text-base text-blue-600 font-semibold">{company.industry || "General"}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4 pb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-50 rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Contact Information</h2>
              <div className="mb-3">
                <span className="block text-gray-500 text-xs mb-1">Contact Person</span>
                <span className="font-medium text-gray-900">{company.contact_person || "Not specified"}</span>
              </div>
              <div className="mb-3 flex items-center gap-2">
                <Phone className="h-5 w-5 text-blue-500" />
                <span className="font-medium text-gray-900">{company.contact_phone || "Not provided"}</span>
              </div>
              <div className="mb-3 flex items-center gap-2">
                <Mail className="h-5 w-5 text-blue-500" />
                <span className="font-medium text-gray-900">{company.contact_email || "Not provided"}</span>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Company Details</h2>
              <div className="mb-3">
                <span className="block text-gray-500 text-xs mb-1">Address</span>
                <span className="font-medium text-gray-900">{company.address || "Not provided"}</span>
              </div>
              <div>
                <span className="block text-gray-500 text-xs mb-1">Description</span>
                <span className="font-medium text-gray-900">{company.description || "No description available."}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
