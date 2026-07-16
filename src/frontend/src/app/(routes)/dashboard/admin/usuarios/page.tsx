import type { Metadata } from "next";
import AdminUsers from "../../../../components/dashboard/admin/users/AdminUsers";

export const metadata: Metadata = {
  title: "Administración usuarios — SimpleFit",
};

export default function AdminUsersRoute() {
  return <AdminUsers />;
}
