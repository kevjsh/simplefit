import type { Metadata } from "next";
import AdminGyms from "../../../../components/dashboard/admin/AdminGyms";

export const metadata: Metadata = {
  title: "Administración gimnasios — SimpleFit",
};

export default function AdminGymsRoute() {
  return <AdminGyms />;
}
