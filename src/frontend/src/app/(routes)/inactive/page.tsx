import type { Metadata } from "next";
import AccountInactivePage from "../../components/auth/AccountInactivePage";

export const metadata: Metadata = {
  title: "Inactive account — SimpleFit",
};

export default function AccountInactiveRoute() {
  return <AccountInactivePage />;
}
