import UserForm from "@/components/users/user-form"

export default function AddUserPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add New User</h1>
        <p className="text-muted-foreground">Enter comprehensive user information</p>
      </div>
      <UserForm />
    </div>
  )
} 