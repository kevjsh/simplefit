"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Navbar from "./components/navbar/Navbar";
import Footer from "./components/footer/Footer";
import LoginModal from "./components/auth/login/LoginModal";
import styles from "./page.module.css";

export default function Home() {
  const [loginOpen, setLoginOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (localStorage.getItem("authToken")) {
      router.replace("/dashboard/customer");
    }
  }, [router]);

  return (
    <>
      <Navbar />

      <main className={styles.main}>
        {/* ── Hero ── */}
        <section className={styles.hero}>
          <div className={styles.heroLogo}>
            <Image
              src="https://firebasestorage.googleapis.com/v0/b/simplefit-6c181.firebasestorage.app/o/logos%2Fsimplefit.png?alt=media&token=64cccbb6-387b-4399-94d3-77b6c960ad34"
              alt="Simplefit"
              width={140}
              height={140}
              priority
              className={styles.logoImg}
            />
          </div>
          <h1 className={styles.heroTitle}>Bienvenido a Simplefit</h1>
          <p className={styles.heroSub}>
          Un gimnasio completo, espacioso, donde podrás realizar tus rutinas de una manera más cómoda.
          </p>
          <div className={styles.heroCta}>
            <button
              className={styles.btnPrimary}
              onClick={() => setLoginOpen(true)}
            >
              Iniciar sesión
            </button>
            <button
              className={styles.btnSecondary}
              onClick={() => router.push("/signup")}
            >
              Regístrese
            </button>
          </div>
        </section>
      </main>

      <Footer />

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
}
