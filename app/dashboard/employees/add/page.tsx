import EmploymentForm from "@/components/employment-form"

export default function AddEmploymentPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">New Selected Employee</h1>
        <p className="text-muted-foreground">Add a new employment record for a student</p>
      </div>
      <EmploymentForm />
    </div>
  )
} 