import CustomerDashboard from "../../../components/dashboard/customer/CustomerDashboard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mi cuenta — SimpleFit",
};

export default function CustomerDashboardRoute() {
  return <CustomerDashboard />;
}
