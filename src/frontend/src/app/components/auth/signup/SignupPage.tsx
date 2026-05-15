"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../navbar/Navbar";
import Footer from "../../footer/Footer";
import LoginModal from "../login/LoginModal";
import DateInput from "../../utils/DateInput";
import SelectInput from "../../utils/SelectInput";
import TermsModal from "./TermsModal";
import styles from "./SignupPage.module.css";
import { signupCustomer } from "../../../../services/auth.service";
import { useNotifications } from "../../utils/NotificationSystem";

/* ── Types ─────────────────────────────────────────────── */
interface FormData {
  idType: "nacional" | "otro";
  personId: string;
  firstName: string;
  firstLastName: string;
  secondLastName: string;
  birthday: string;
  gender: string;
  phone: string;
  phoneSecondary: string;
  address: string;
  email: string;
  terms: boolean;
}

type FieldKey = keyof FormData;

const STEPS = [
  { label: "Identificación" },
  { label: "Datos personales" },
  { label: "Contacto" },
  { label: "Confirmación" },
];

const GENDER_OPTIONS = [
  { value: "Femenino",  label: "Femenino" },
  { value: "Masculino", label: "Masculino" },
  { value: "Otro",      label: "Otro" },
];

/* ── Name parser ────────────────────────────────────────── */
function toTitleCase(str: string): string {
  return str.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

function parseName(raw: string): { firstName: string; firstLastName: string; secondLastName: string } {
  const words = toTitleCase(raw.trim()).split(/\s+/);
  if (words.length >= 4) {
    return {
      firstName:      words.slice(0, words.length - 2).join(" "),
      firstLastName:  words[words.length - 2],
      secondLastName: words[words.length - 1],
    };
  }
  if (words.length === 3) {
    return { firstName: words[0], firstLastName: words[1], secondLastName: words[2] };
  }
  return { firstName: words.join(" "), firstLastName: "", secondLastName: "" };
}

/* ── Component ─────────────────────────────────────────── */
export default function SignupPage() {
  const router = useRouter();
  const notify = useNotifications();
  const [step, setStep] = useState(0);
  const [touched, setTouched] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [idLoading, setIdLoading] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [form, setForm] = useState<FormData>({
    idType: "nacional",
    personId: "",
    firstName: "",
    firstLastName: "",
    secondLastName: "",
    birthday: "",
    gender: "",
    phone: "",
    phoneSecondary: "",
    address: "",
    email: "",
    terms: false,
  });

  /* Scroll to top on every step change */
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  /* Unlock scroll on this page */
  useEffect(() => {
    document.documentElement.style.height = "auto";
    document.documentElement.style.overflow = "auto";
    document.body.style.height = "auto";
    document.body.style.overflow = "auto";
    return () => {
      document.documentElement.style.height = "";
      document.documentElement.style.overflow = "";
      document.body.style.height = "";
      document.body.style.overflow = "";
    };
  }, []);

  const set = (field: FieldKey) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const isEmpty = (v: string) => v.trim() === "";

  /* Per-step validation */
  const idError = (() => {
    if (isEmpty(form.personId)) return "Este campo es requerido";
    if (form.idType === "nacional" && !/^\d{9}$/.test(form.personId))
      return "La cédula nacional debe tener exactamente 9 dígitos";
    return null;
  })();

  const phoneError = (() => {
    if (isEmpty(form.phone)) return "Este campo es requerido";
    if (!/^\d{8}$/.test(form.phone)) return "El teléfono debe tener exactamente 8 dígitos";
    return null;
  })();

  const emailError = (() => {
    if (isEmpty(form.email)) return "Este campo es requerido";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return "Correo electrónico no válido";
    return null;
  })();

  const stepErrors: Record<number, boolean> = {
    0: idError !== null,
    1:
      isEmpty(form.firstName) ||
      isEmpty(form.firstLastName) ||
      isEmpty(form.secondLastName) ||
      isEmpty(form.birthday) ||
      isEmpty(form.gender),
    2:
      phoneError !== null ||
      isEmpty(form.address) ||
      emailError !== null,
    3: !form.terms,
  };

  const next = async () => {
    setTouched(true);
    if (stepErrors[step]) return;

    /* Step 0 — cédula nacional: consultar Hacienda */
    if (step === 0 && form.idType === "nacional") {
      setIdLoading(true);
      try {
        const res = await fetch(
          `https://api.hacienda.go.cr/fe/ae?identificacion=${form.personId}`
        );
        if (res.ok) {
          const data = await res.json();
          if (data?.nombre) {
            const parsed = parseName(data.nombre);
            setForm((p) => ({ ...p, ...parsed }));
          }
        }
      } catch {
        // Silently continue — user fills fields manually
      } finally {
        setIdLoading(false);
      }
    }

    setTouched(false);
    setStep((s) => s + 1);
  };

  const back = () => {
    setTouched(false);
    setStep((s) => s - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (stepErrors[3]) return;

    setSubmitLoading(true);
    setSubmitError(null);

    try {
      await signupCustomer({
        NID:            form.personId,
        Name:           form.firstName,
        FirstLastName:  form.firstLastName,
        SecondLastName: form.secondLastName,
        Birthday:       form.birthday,
        Gender:         form.gender,
        FirstTelephone: form.phone,
        SecondTelephone: form.phoneSecondary || undefined,
        Address:        form.address,
        Email:          form.email,
      });

      notify.success("¡Registro exitoso! Bienvenido a SimpleFit.");
      router.push("/");
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? "Ocurrió un error al registrarse. Verifica los datos e intenta de nuevo.";
      setSubmitError(message);
      notify.error(message);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== "Enter") return;
    const tag = (e.target as HTMLElement).tagName.toLowerCase();
    if (tag === "textarea") return;
    e.preventDefault();
    if (step < 3) next();
    else handleSubmit(e as unknown as React.FormEvent);
  };

  /* ── Field helper ─────────────────────────────────────── */
  const err = (field: FieldKey, msg = "Este campo es requerido") =>
    touched && isEmpty(String(form[field])) ? (
      <span className={styles.errorMsg}>{msg}</span>
    ) : null;

  const inputClass = (field: FieldKey) =>
    `${styles.input} ${touched && isEmpty(String(form[field])) ? styles.inputError : ""}`;

  return (
    <>
      <Navbar />
      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
      <TermsModal open={termsOpen} onClose={() => setTermsOpen(false)} />

      <main className={styles.main}>
        <div className={styles.container}>

          {/* ── Page header ─────────────────────────────── */}
          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>Crear cuenta</h1>
            <p className={styles.pageSubtitle}>
              Completa los pasos para registrarte en SimpleFit
            </p>
          </div>

          {/* ── Stepper indicator ───────────────────────── */}
          <div className={styles.stepper}>
            {/* Top row: circles + lines */}
            <div className={styles.stepTrack}>
              {STEPS.map((s, i) => (
                <React.Fragment key={i}>
                  <div
                    className={`${styles.stepCircle} ${i < step ? styles.stepDone : i === step ? styles.stepActive : ""}`}
                  >
                    {i < step ? (
                      <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="2 7 5.5 10.5 12 3.5" />
                      </svg>
                    ) : (
                      <span>{i + 1}</span>
                    )}
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`${styles.line} ${i < step ? styles.lineActive : ""}`} />
                  )}
                </React.Fragment>
              ))}
            </div>
            {/* Bottom row: labels aligned under each circle */}
            <div className={styles.stepLabels}>
              {STEPS.map((s, i) => (
                <span key={i} className={`${styles.stepLabel} ${i === step ? styles.stepLabelActive : ""}`}>
                  {s.label}
                </span>
              ))}
            </div>
          </div>

          {/* ── Form card ───────────────────────────────── */}
          <div className={styles.card} onKeyDown={handleKeyDown}>

            {/* Step 0 — Identificación */}
            {step === 0 && (
              <div className={styles.stepContent}>
                <div className={styles.stepHeader}>
                  <p className={styles.stepNumber}>Paso 1 de 4</p>
                  <h2 className={styles.stepTitle}>Número de identificación</h2>
                  <p className={styles.stepDesc}>Selecciona el tipo de documento e ingresa tu número.</p>
                </div>
                <div className={styles.fields}>

                  {/* Radio — tipo de documento */}
                  <div className={styles.radioGroup}>
                    <label className={styles.radioLabel}>
                      <input
                        type="radio"
                        name="idType"
                        value="nacional"
                        checked={form.idType === "nacional"}
                        onChange={() => setForm((p) => ({ ...p, idType: "nacional", personId: "" }))}
                        className={styles.radioInput}
                      />
                      <span className={`${styles.radioCustom} ${form.idType === "nacional" ? styles.radioChecked : ""}`} />
                      <span className={styles.radioText}>Nacional</span>
                    </label>
                    <label className={styles.radioLabel}>
                      <input
                        type="radio"
                        name="idType"
                        value="otro"
                        checked={form.idType === "otro"}
                        onChange={() => setForm((p) => ({ ...p, idType: "otro", personId: "" }))}
                        className={styles.radioInput}
                      />
                      <span className={`${styles.radioCustom} ${form.idType === "otro" ? styles.radioChecked : ""}`} />
                      <span className={styles.radioText}>Otro</span>
                    </label>
                  </div>

                  {/* Input de identificación */}
                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="sf-personId">
                      {form.idType === "nacional" ? "Cédula nacional" : "Número de documento"}{" "}
                      <span className={styles.required}>*</span>
                    </label>
                    <input
                      id="sf-personId"
                      type="text"
                      inputMode="numeric"
                      className={`${styles.input} ${touched && idError ? styles.inputError : ""}`}
                      placeholder={form.idType === "nacional" ? "123456789" : "Pasaporte, DIMEX, etc."}
                      value={form.personId}
                      maxLength={form.idType === "nacional" ? 9 : 30}
                      onChange={(e) => {
                        const raw = e.target.value;
                        const filtered = form.idType === "nacional"
                          ? raw.replace(/[^0-9]/g, "")
                          : raw.replace(/[^a-zA-Z0-9]/g, "");
                        setForm((p) => ({ ...p, personId: filtered }));
                      }}
                      autoComplete="off"
                    />
                    {form.idType === "nacional" && (
                      <span className={styles.hint}>
                        Incluye todos los ceros — son exactamente 9 dígitos sin guiones ni espacios
                      </span>
                    )}
                    {touched && idError && (
                      <span className={styles.errorMsg}>{idError}</span>
                    )}
                  </div>

                </div>
              </div>
            )}

            {/* Step 1 — Datos personales */}
            {step === 1 && (
              <div className={styles.stepContent}>
                <div className={styles.stepHeader}>
                  <p className={styles.stepNumber}>Paso 2 de 4</p>
                  <h2 className={styles.stepTitle}>Información personal</h2>
                  <p className={styles.stepDesc}>Cuéntanos un poco sobre ti.</p>
                </div>
                <div className={styles.fields}>
                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="sf-firstName">
                      Nombre <span className={styles.required}>*</span>
                    </label>
                    <input
                      id="sf-firstName"
                      type="text"
                      className={inputClass("firstName")}
                      placeholder="Juan"
                      value={form.firstName}
                      onChange={set("firstName")}
                      autoComplete="given-name"
                    />
                    {err("firstName")}
                  </div>

                  <div className={styles.fieldRow}>
                    <div className={styles.field}>
                      <label className={styles.label} htmlFor="sf-firstLastName">
                        Primer apellido <span className={styles.required}>*</span>
                      </label>
                      <input
                        id="sf-firstLastName"
                        type="text"
                        className={inputClass("firstLastName")}
                        placeholder="Pérez"
                        value={form.firstLastName}
                        onChange={set("firstLastName")}
                        autoComplete="family-name"
                      />
                      {err("firstLastName")}
                    </div>
                    <div className={styles.field}>
                      <label className={styles.label} htmlFor="sf-secondLastName">
                        Segundo apellido <span className={styles.required}>*</span>
                      </label>
                      <input
                        id="sf-secondLastName"
                        type="text"
                        className={inputClass("secondLastName")}
                        placeholder="Mora"
                        value={form.secondLastName}
                        onChange={set("secondLastName")}
                        autoComplete="additional-name"
                      />
                      {err("secondLastName")}
                    </div>
                  </div>

                  <div className={styles.fieldRow}>
                    <div className={styles.field}>
                      <label className={styles.label} htmlFor="sf-birthday">
                        Fecha de nacimiento <span className={styles.required}>*</span>
                      </label>
                      <DateInput
                        id="sf-birthday"
                        value={form.birthday}
                        onChange={(val) => setForm((p) => ({ ...p, birthday: val }))}
                        hasError={touched && isEmpty(form.birthday)}
                      />
                      {err("birthday")}
                    </div>
                    <div className={styles.field}>
                      <label className={styles.label} htmlFor="sf-gender">
                        Género <span className={styles.required}>*</span>
                      </label>
                      <SelectInput
                        id="sf-gender"
                        value={form.gender}
                        onChange={(val) => setForm((p) => ({ ...p, gender: val }))}
                        options={GENDER_OPTIONS}
                        placeholder="Seleccionar..."
                        hasError={touched && isEmpty(form.gender)}
                      />
                      {touched && isEmpty(form.gender) && <span className={styles.errorMsg}>Este campo es requerido</span>}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2 — Contacto */}
            {step === 2 && (
              <div className={styles.stepContent}>
                <div className={styles.stepHeader}>
                  <p className={styles.stepNumber}>Paso 3 de 4</p>
                  <h2 className={styles.stepTitle}>Información de contacto</h2>
                  <p className={styles.stepDesc}>¿Cómo podemos contactarte?</p>
                </div>
                <div className={styles.fields}>
                  <div className={styles.fieldRow}>
                    <div className={styles.field}>
                      <label className={styles.label} htmlFor="sf-phone">
                        Teléfono <span className={styles.required}>*</span>
                      </label>
                      <input
                        id="sf-phone"
                        type="text"
                        inputMode="numeric"
                        className={`${styles.input} ${touched && phoneError ? styles.inputError : ""}`}
                        placeholder="88776655"
                        value={form.phone}
                        maxLength={8}
                        onChange={(e) => {
                          const digits = e.target.value.replace(/\D/g, "");
                          setForm((p) => ({ ...p, phone: digits }));
                        }}
                        autoComplete="tel"
                      />
                      {touched && phoneError && (
                        <span className={styles.errorMsg}>{phoneError}</span>
                      )}
                    </div>
                    <div className={styles.field}>
                      <label className={styles.label} htmlFor="sf-phoneSecondary">
                        Teléfono secundario
                      </label>
                      <input
                        id="sf-phoneSecondary"
                        type="tel"
                        className={styles.input}
                        placeholder="Opcional"
                        value={form.phoneSecondary}
                        onChange={set("phoneSecondary")}
                        autoComplete="tel"
                      />
                    </div>
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="sf-address">
                      Dirección exacta <span className={styles.required}>*</span>
                    </label>
                    <textarea
                      id="sf-address"
                      className={`${styles.textarea} ${touched && isEmpty(form.address) ? styles.inputError : ""}`}
                      value={form.address}
                      onChange={set("address")}
                      rows={3}
                    />
                    {touched && isEmpty(form.address) && <span className={styles.errorMsg}>Este campo es requerido</span>}
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="sf-email">
                      Correo electrónico <span className={styles.required}>*</span>
                    </label>
                    <input
                      id="sf-email"
                      type="email"
                      className={`${styles.input} ${touched && emailError ? styles.inputError : ""}`}
                      placeholder="correo@ejemplo.com"
                      value={form.email}
                      onChange={set("email")}
                      autoComplete="email"
                    />
                    {touched && emailError && (
                      <span className={styles.errorMsg}>{emailError}</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3 — Confirmación */}
            {step === 3 && (
              <div className={styles.stepContent}>
                <div className={styles.stepHeader}>
                  <p className={styles.stepNumber}>Paso 4 de 4</p>
                  <h2 className={styles.stepTitle}>Finaliza tu registro</h2>
                  <p className={styles.stepDesc}>Revisa y acepta los términos para completar tu cuenta.</p>
                </div>
                <div className={styles.fields}>
                  <div className={styles.summary}>
                    <div className={styles.summaryRow}><span>Identificación</span><strong>{form.personId}</strong></div>
                    <div className={styles.summaryRow}><span>Nombre completo</span><strong>{form.firstName} {form.firstLastName} {form.secondLastName}</strong></div>
                    <div className={styles.summaryRow}><span>Fecha de nacimiento</span><strong>{form.birthday ? form.birthday.split("-").reverse().join("-") : ""}</strong></div>
                    <div className={styles.summaryRow}><span>Género</span><strong>{form.gender}</strong></div>
                    <div className={styles.summaryRow}><span>Teléfono</span><strong>{form.phone}</strong></div>
                    <div className={styles.summaryRow}><span>Dirección</span><strong>{form.address}</strong></div>
                    <div className={styles.summaryRow}><span>Correo</span><strong>{form.email}</strong></div>
                  </div>

                  <label className={styles.termsLabel}>
                    <span
                      className={`${styles.checkbox} ${form.terms ? styles.checked : ""} ${touched && !form.terms ? styles.checkboxError : ""}`}
                      onClick={() => setForm((p) => ({ ...p, terms: !p.terms }))}
                    >
                      {form.terms && (
                        <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="1.5 6 4.5 9 10.5 3" />
                        </svg>
                      )}
                    </span>
                    <span onClick={() => setForm((p) => ({ ...p, terms: !p.terms }))}>
                      Acepto los{" "}
                      <button
                        type="button"
                        className={styles.termsLink}
                        onClick={(e) => { e.stopPropagation(); setTermsOpen(true); }}
                      >
                        términos y condiciones
                      </button>{" "}
                      de SimpleFit
                    </span>
                  </label>
                  {touched && !form.terms && (
                    <span className={styles.errorMsg}>Debes aceptar los términos y condiciones</span>
                  )}

                  {submitError && (
                    <span className={styles.errorMsg}>{submitError}</span>
                  )}
                </div>
              </div>
            )}

            {/* ── Navigation ──────────────────────────────── */}
            <div className={styles.nav}>
              {step > 0 ? (
                <button type="button" className={styles.backBtn} onClick={back}>
                  ← Atrás
                </button>
              ) : (
                <div />
              )}
              {step < 3 ? (
                <button type="button" className={styles.nextBtn} onClick={next} disabled={idLoading}>
                  {idLoading ? (
                    <span className={styles.btnSpinner}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                      </svg>
                      Consultando...
                    </span>
                  ) : "Continuar →"}
                </button>
              ) : (
                <button type="submit" className={styles.nextBtn} onClick={handleSubmit} disabled={submitLoading}>
                  {submitLoading ? "Registrando..." : "Registrarme"}
                </button>
              )}
            </div>
          </div>

          {/* ── Footer link ─────────────────────────────── */}
          <p className={styles.loginText}>
            ¿Ya tienes cuenta?{" "}
            <button type="button" className={styles.loginLink} onClick={() => setLoginOpen(true)}>
              Inicia sesión
            </button>
          </p>

        </div>
      </main>

      <Footer />
    </>
  );
}
