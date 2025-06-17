import StudentForm from "@/components/students/student-form"

export default function AddStudentPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add New Student</h1>
        <p className="text-muted-foreground">Enter comprehensive student information</p>
      </div>
      <StudentForm />
    </div>
  )
}
