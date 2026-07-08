import { ReactNode } from "react";
import AdminLayout from "../../../components/dashboard/admin/AdminLayout";

export default function AdminRoutesLayout({ children }: { children: ReactNode }) {
  return <AdminLayout>{children}</AdminLayout>;
}
