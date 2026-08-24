import { ProvisionUserForm } from "@/features/auth/components/ProvisionUserForm";

export default function AdminUsersPage() {
  return (
    <div className="flex flex-col gap-8 w-full max-w-5xl">
      <div>
        <h1 className="text-3xl font-display font-bold text-white">User Management</h1>
        <p className="text-white/60 mt-2">Provision new administrative and faculty accounts.</p>
      </div>

      <ProvisionUserForm />
    </div>
  );
}
