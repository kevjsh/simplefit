import type { Metadata } from "next";
import AdminSecurity from "../../../../components/dashboard/admin/AdminSecurity";

export const metadata: Metadata = {
  title: "Administración seguridad — SimpleFit",
};

export default function AdminSecurityRoute() {
  return <AdminSecurity />;
}
