import SignupPage from "../../components/auth/signup/SignupPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Registro — SimpleFit",
};

export default function SignupRoute() {
  return <SignupPage />;
}
