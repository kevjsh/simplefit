import type { Metadata } from "next";
import AdminOverview from "../../../components/dashboard/admin/AdminOverview";

export const metadata: Metadata = {
  title: "Administración — SimpleFit",
};

export default function AdminOverviewRoute() {
  return <AdminOverview />;
}
