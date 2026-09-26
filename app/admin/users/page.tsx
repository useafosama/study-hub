import * as React from "react";
import { getUsersList } from "@/actions/users";
import { getAdminSubjects } from "@/actions/subjects";
import { UsersManager } from "@/components/admin/users-manager";

export default async function AdminUsersPage() {
  const [users, subjects] = await Promise.all([
    getUsersList(),
    getAdminSubjects(),
  ]);

  return <UsersManager initialUsers={users as any} allSubjects={subjects} />;
}
