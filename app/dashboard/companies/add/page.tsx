import CompanyForm from "@/components/companies/company-form"

export default function AddCompanyPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add New Company</h1>
        <p className="text-muted-foreground">Enter comprehensive company information</p>
      </div>
      <CompanyForm />
    </div>
  )
} 