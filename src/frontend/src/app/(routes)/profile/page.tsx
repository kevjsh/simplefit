import type { Metadata } from "next";
import ProfilePage from "../../components/customer/profile";

export const metadata: Metadata = {
  title: "Mi perfil — SimpleFit",
};

export default function Profile() {
  return <ProfilePage />;
}
