"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../navbar/Navbar";
import Footer from "../../footer/Footer";
import LoginModal from "../login/LoginModal";
import DateInput from "../../utils/DateInput";
import SelectInput from "../../utils/SelectInput";
import TermsModal from "./TermsModal";
import { signupCustomer } from "../../../../services/auth.service";
import { lookupCustomerByNID } from "../../../../services/customer.service";
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

/* ── Shared Tailwind class strings ────────────────────── */
const inputBase = "w-full h-[46px] bg-[#111820] border border-white/9 rounded-[7px] text-white text-[0.92rem] font-[inherit] px-4 outline-none transition-[border-color,background,box-shadow] duration-150 placeholder:text-white/20 focus:bg-[#0e1520] focus:border-white/[0.28] focus:shadow-[0_0_0_3px_rgba(255,255,255,0.05)]";
const inputErrorCls = "!border-[rgba(255,100,100,0.55)] focus:!shadow-[0_0_0_3px_rgba(255,100,100,0.08)]";
const labelCls = "text-[0.78rem] font-semibold text-white/60 tracking-[0.03em]";
const requiredCls = "text-white/30 ml-0.5";
const fieldCls = "flex flex-col gap-[0.4rem]";
const errorMsgCls = "text-[0.76rem] text-[rgba(255,110,110,0.9)]";

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

    /* Step 0 — verificar cédula en DB y enriquecer con Hacienda */
    if (step === 0) {
      setIdLoading(true);
      try {
        const data = await lookupCustomerByNID(form.personId);
        if (data.name) {
          const parsed = parseName(data.name);
          setForm((p) => ({ ...p, ...parsed }));
        }
      } catch (err: unknown) {
        const status = (err as { response?: { status?: number } })?.response?.status;
        if (status === 409) {
          notify.error("Esta cédula ya se encuentra registrada.");
          setIdLoading(false);
          return;
        }
        // Otros errores (red, timeout): continuar sin auto-completar nombre
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
      <span className={errorMsgCls}>{msg}</span>
    ) : null;

  const inputClass = (field: FieldKey) =>
    `${inputBase} ${touched && isEmpty(String(form[field])) ? inputErrorCls : ""}`;

  return (
    <>
      <Navbar />
      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
      <TermsModal open={termsOpen} onClose={() => setTermsOpen(false)} />

      <main className="flex-1 flex justify-center pt-[calc(var(--spacing-nav-h)+2.5rem)] px-4 pb-12 max-[560px]:pt-[calc(var(--spacing-nav-h)+1.5rem)] max-[560px]:px-3 max-[560px]:pb-10">
        <div className="w-full max-w-[680px] flex flex-col gap-8">

          {/* ── Page header ─────────────────────────────── */}
          <div className="flex flex-col gap-[0.35rem]">
            <h1 className="text-[clamp(1.75rem,4vw,2.4rem)] font-extrabold text-white tracking-[-0.02em] leading-[1.1]">Crear cuenta</h1>
            <p className="text-[0.95rem] text-white/50">
              Completa los pasos para registrarte en SimpleFit
            </p>
          </div>

          {/* ── Stepper indicator ───────────────────────── */}
          <div className="flex flex-col gap-[0.6rem]">
            {/* Top row: circles + lines */}
            <div className="flex items-center">
              {STEPS.map((s, i) => (
                <React.Fragment key={i}>
                  <div
                    className={`shrink-0 w-8 h-8 rounded-full border-2 border-white/[0.18] bg-[#1a2228] text-white/30 flex items-center justify-center text-[0.8rem] font-bold transition-all duration-[250ms] relative z-[1] max-[560px]:w-7 max-[560px]:h-7 max-[560px]:text-[0.75rem] ${i < step ? "!border-white/60 !bg-white/12 !text-white" : i === step ? "!border-white !bg-white !text-[#1e272e]" : ""}`}
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
                    <div className={`flex-1 h-0.5 bg-white/12 transition-[background] duration-300 ${i < step ? "!bg-white/70" : ""}`} />
                  )}
                </React.Fragment>
              ))}
            </div>
            {/* Bottom row: labels aligned under each circle */}
            <div className="grid grid-cols-4 max-[560px]:hidden">
              {STEPS.map((s, i) => (
                <span key={i} className={`text-[0.72rem] text-white/30 text-center transition-colors duration-[250ms] leading-[1.3] ${i === step ? "!text-white/85 font-semibold" : ""}`}>
                  {s.label}
                </span>
              ))}
            </div>
          </div>

          {/* ── Form card ───────────────────────────────── */}
          <div className="bg-[#1a2228] border border-white/8 rounded-xl p-8 flex flex-col gap-8 shadow-[0_8px_40px_rgba(0,0,0,0.35)] max-[560px]:p-[1.5rem_1.1rem]" onKeyDown={handleKeyDown}>

            {/* Step 0 — Identificación */}
            {step === 0 && (
              <div className="flex flex-col gap-7">
                <div className="flex flex-col gap-[0.3rem]">
                  <p className="text-[0.75rem] font-semibold text-white/35 uppercase tracking-[0.08em]">Paso 1 de 4</p>
                  <h2 className="text-[1.25rem] font-bold text-white tracking-[-0.01em]">Número de identificación</h2>
                  <p className="text-[0.88rem] text-white/45">Selecciona el tipo de documento e ingresa tu número.</p>
                </div>
                <div className="flex flex-col gap-[1.1rem]">

                  {/* Radio — tipo de documento */}
                  <div className="flex gap-6 flex-wrap">
                    <label className="flex items-center gap-[0.55rem] cursor-pointer select-none text-[0.92rem] text-white/70">
                      <input
                        type="radio"
                        name="idType"
                        value="nacional"
                        checked={form.idType === "nacional"}
                        onChange={() => setForm((p) => ({ ...p, idType: "nacional", personId: "" }))}
                        className="hidden"
                      />
                      <span className={`w-[18px] h-[18px] shrink-0 rounded-full border-2 border-white/[0.22] bg-[#111820] transition-[border-color,background] duration-150 flex items-center justify-center after:content-[''] after:w-2 after:h-2 after:rounded-full after:bg-transparent after:transition-[background] after:duration-150 ${form.idType === "nacional" ? "!border-white after:!bg-white" : ""}`} />
                      <span className={`transition-colors duration-150 ${form.idType === "nacional" ? "text-white" : ""}`}>Nacional</span>
                    </label>
                    <label className="flex items-center gap-[0.55rem] cursor-pointer select-none text-[0.92rem] text-white/70">
                      <input
                        type="radio"
                        name="idType"
                        value="otro"
                        checked={form.idType === "otro"}
                        onChange={() => setForm((p) => ({ ...p, idType: "otro", personId: "" }))}
                        className="hidden"
                      />
                      <span className={`w-[18px] h-[18px] shrink-0 rounded-full border-2 border-white/[0.22] bg-[#111820] transition-[border-color,background] duration-150 flex items-center justify-center after:content-[''] after:w-2 after:h-2 after:rounded-full after:bg-transparent after:transition-[background] after:duration-150 ${form.idType === "otro" ? "!border-white after:!bg-white" : ""}`} />
                      <span className={`transition-colors duration-150 ${form.idType === "otro" ? "text-white" : ""}`}>Otro</span>
                    </label>
                  </div>

                  {/* Input de identificación */}
                  <div className={fieldCls}>
                    <label className={labelCls} htmlFor="sf-personId">
                      {form.idType === "nacional" ? "Cédula nacional" : "Número de documento"}{" "}
                      <span className={requiredCls}>*</span>
                    </label>
                    <input
                      id="sf-personId"
                      type="text"
                      inputMode="numeric"
                      className={`${inputBase} ${touched && idError ? inputErrorCls : ""}`}
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
                      <span className="text-[0.76rem] text-white/[0.38] leading-[1.4]">
                        Incluye todos los ceros — son exactamente 9 dígitos sin guiones ni espacios
                      </span>
                    )}
                    {touched && idError && (
                      <span className={errorMsgCls}>{idError}</span>
                    )}
                  </div>

                </div>
              </div>
            )}

            {/* Step 1 — Datos personales */}
            {step === 1 && (
              <div className="flex flex-col gap-7">
                <div className="flex flex-col gap-[0.3rem]">
                  <p className="text-[0.75rem] font-semibold text-white/35 uppercase tracking-[0.08em]">Paso 2 de 4</p>
                  <h2 className="text-[1.25rem] font-bold text-white tracking-[-0.01em]">Información personal</h2>
                  <p className="text-[0.88rem] text-white/45">Cuéntanos un poco sobre ti.</p>
                </div>
                <div className="flex flex-col gap-[1.1rem]">
                  <div className={fieldCls}>
                    <label className={labelCls} htmlFor="sf-firstName">
                      Nombre <span className={requiredCls}>*</span>
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

                  <div className="grid grid-cols-2 gap-4 max-[560px]:grid-cols-1">
                    <div className={fieldCls}>
                      <label className={labelCls} htmlFor="sf-firstLastName">
                        Primer apellido <span className={requiredCls}>*</span>
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
                    <div className={fieldCls}>
                      <label className={labelCls} htmlFor="sf-secondLastName">
                        Segundo apellido <span className={requiredCls}>*</span>
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

                  <div className="grid grid-cols-2 gap-4 max-[560px]:grid-cols-1">
                    <div className={fieldCls}>
                      <label className={labelCls} htmlFor="sf-birthday">
                        Fecha de nacimiento <span className={requiredCls}>*</span>
                      </label>
                      <DateInput
                        id="sf-birthday"
                        value={form.birthday}
                        onChange={(val) => setForm((p) => ({ ...p, birthday: val }))}
                        hasError={touched && isEmpty(form.birthday)}
                      />
                      {err("birthday")}
                    </div>
                    <div className={fieldCls}>
                      <label className={labelCls} htmlFor="sf-gender">
                        Género <span className={requiredCls}>*</span>
                      </label>
                      <SelectInput
                        id="sf-gender"
                        value={form.gender}
                        onChange={(val) => setForm((p) => ({ ...p, gender: val }))}
                        options={GENDER_OPTIONS}
                        placeholder="Seleccionar..."
                        hasError={touched && isEmpty(form.gender)}
                      />
                      {touched && isEmpty(form.gender) && <span className={errorMsgCls}>Este campo es requerido</span>}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2 — Contacto */}
            {step === 2 && (
              <div className="flex flex-col gap-7">
                <div className="flex flex-col gap-[0.3rem]">
                  <p className="text-[0.75rem] font-semibold text-white/35 uppercase tracking-[0.08em]">Paso 3 de 4</p>
                  <h2 className="text-[1.25rem] font-bold text-white tracking-[-0.01em]">Información de contacto</h2>
                  <p className="text-[0.88rem] text-white/45">¿Cómo podemos contactarte?</p>
                </div>
                <div className="flex flex-col gap-[1.1rem]">
                  <div className="grid grid-cols-2 gap-4 max-[560px]:grid-cols-1">
                    <div className={fieldCls}>
                      <label className={labelCls} htmlFor="sf-phone">
                        Teléfono <span className={requiredCls}>*</span>
                      </label>
                      <input
                        id="sf-phone"
                        type="text"
                        inputMode="numeric"
                        className={`${inputBase} ${touched && phoneError ? inputErrorCls : ""}`}
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
                        <span className={errorMsgCls}>{phoneError}</span>
                      )}
                    </div>
                    <div className={fieldCls}>
                      <label className={labelCls} htmlFor="sf-phoneSecondary">
                        Teléfono secundario
                      </label>
                      <input
                        id="sf-phoneSecondary"
                        type="tel"
                        className={inputBase}
                        placeholder="Opcional"
                        value={form.phoneSecondary}
                        onChange={set("phoneSecondary")}
                        autoComplete="tel"
                      />
                    </div>
                  </div>

                  <div className={fieldCls}>
                    <label className={labelCls} htmlFor="sf-address">
                      Dirección exacta <span className={requiredCls}>*</span>
                    </label>
                    <textarea
                      id="sf-address"
                      className={`w-full bg-[#111820] border border-white/9 rounded-[7px] text-white text-[0.92rem] font-[inherit] p-[0.75rem_1rem] outline-none transition-[border-color,background,box-shadow] duration-150 resize-y min-h-[80px] placeholder:text-white/20 focus:bg-[#0e1520] focus:border-white/[0.28] focus:shadow-[0_0_0_3px_rgba(255,255,255,0.05)] ${touched && isEmpty(form.address) ? inputErrorCls : ""}`}
                      value={form.address}
                      onChange={set("address")}
                      rows={3}
                    />
                    {touched && isEmpty(form.address) && <span className={errorMsgCls}>Este campo es requerido</span>}
                  </div>

                  <div className={fieldCls}>
                    <label className={labelCls} htmlFor="sf-email">
                      Correo electrónico <span className={requiredCls}>*</span>
                    </label>
                    <input
                      id="sf-email"
                      type="email"
                      className={`${inputBase} ${touched && emailError ? inputErrorCls : ""}`}
                      placeholder="correo@ejemplo.com"
                      value={form.email}
                      onChange={set("email")}
                      autoComplete="email"
                    />
                    {touched && emailError && (
                      <span className={errorMsgCls}>{emailError}</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3 — Confirmación */}
            {step === 3 && (
              <div className="flex flex-col gap-7">
                <div className="flex flex-col gap-[0.3rem]">
                  <p className="text-[0.75rem] font-semibold text-white/35 uppercase tracking-[0.08em]">Paso 4 de 4</p>
                  <h2 className="text-[1.25rem] font-bold text-white tracking-[-0.01em]">Finaliza tu registro</h2>
                  <p className="text-[0.88rem] text-white/45">Revisa y acepta los términos para completar tu cuenta.</p>
                </div>
                <div className="flex flex-col gap-[1.1rem]">
                  <div className="flex flex-col bg-[#111820] border border-white/8 rounded-lg overflow-hidden">
                    <div className="flex justify-between items-baseline gap-4 p-[0.7rem_1rem] border-b border-white/[0.06] text-[0.86rem] [&>span]:text-white/45 [&>span]:shrink-0 [&>strong]:text-white/85 [&>strong]:font-medium [&>strong]:text-right"><span>Identificación</span><strong>{form.personId}</strong></div>
                    <div className="flex justify-between items-baseline gap-4 p-[0.7rem_1rem] border-b border-white/[0.06] text-[0.86rem] [&>span]:text-white/45 [&>span]:shrink-0 [&>strong]:text-white/85 [&>strong]:font-medium [&>strong]:text-right"><span>Nombre completo</span><strong>{form.firstName} {form.firstLastName} {form.secondLastName}</strong></div>
                    <div className="flex justify-between items-baseline gap-4 p-[0.7rem_1rem] border-b border-white/[0.06] text-[0.86rem] [&>span]:text-white/45 [&>span]:shrink-0 [&>strong]:text-white/85 [&>strong]:font-medium [&>strong]:text-right"><span>Fecha de nacimiento</span><strong>{form.birthday ? form.birthday.split("-").reverse().join("-") : ""}</strong></div>
                    <div className="flex justify-between items-baseline gap-4 p-[0.7rem_1rem] border-b border-white/[0.06] text-[0.86rem] [&>span]:text-white/45 [&>span]:shrink-0 [&>strong]:text-white/85 [&>strong]:font-medium [&>strong]:text-right"><span>Género</span><strong>{form.gender}</strong></div>
                    <div className="flex justify-between items-baseline gap-4 p-[0.7rem_1rem] border-b border-white/[0.06] text-[0.86rem] [&>span]:text-white/45 [&>span]:shrink-0 [&>strong]:text-white/85 [&>strong]:font-medium [&>strong]:text-right"><span>Teléfono</span><strong>{form.phone}</strong></div>
                    <div className="flex justify-between items-baseline gap-4 p-[0.7rem_1rem] border-b border-white/[0.06] text-[0.86rem] [&>span]:text-white/45 [&>span]:shrink-0 [&>strong]:text-white/85 [&>strong]:font-medium [&>strong]:text-right"><span>Dirección</span><strong>{form.address}</strong></div>
                    <div className="flex justify-between items-baseline gap-4 p-[0.7rem_1rem] text-[0.86rem] [&>span]:text-white/45 [&>span]:shrink-0 [&>strong]:text-white/85 [&>strong]:font-medium [&>strong]:text-right"><span>Correo</span><strong>{form.email}</strong></div>
                  </div>

                  <label className="flex items-start gap-[0.65rem] cursor-pointer text-[0.88rem] text-white/60 select-none leading-[1.5]">
                    <span
                      className={`w-5 h-5 shrink-0 mt-px border-[1.5px] border-white/[0.22] rounded-[4px] bg-black/20 flex items-center justify-center transition-all duration-150 cursor-pointer ${form.terms ? "!bg-white/90 !border-white/90 text-[#1e272e]" : ""} ${touched && !form.terms ? "!border-[rgba(255,100,100,0.6)]" : ""}`}
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
                        className="text-white/75 underline underline-offset-2 bg-transparent border-none cursor-pointer font-[inherit] text-[inherit] p-0 transition-colors duration-150 hover:text-white"
                        onClick={(e) => { e.stopPropagation(); setTermsOpen(true); }}
                      >
                        términos y condiciones
                      </button>{" "}
                      de SimpleFit
                    </span>
                  </label>
                  {touched && !form.terms && (
                    <span className={errorMsgCls}>Debes aceptar los términos y condiciones</span>
                  )}

                  {submitError && (
                    <span className={errorMsgCls}>{submitError}</span>
                  )}
                </div>
              </div>
            )}

            {/* ── Navigation ──────────────────────────────── */}
            <div className="flex justify-between items-center pt-2 border-t border-white/[0.07]">
              {step > 0 ? (
                <button
                  type="button"
                  className="bg-transparent border border-white/15 rounded-[7px] text-white/60 text-[0.9rem] font-[inherit] py-[0.6rem] px-5 cursor-pointer transition-[border-color,color] duration-150 hover:border-white/35 hover:text-white"
                  onClick={back}
                >
                  ← Atrás
                </button>
              ) : (
                <div />
              )}
              {step < 3 ? (
                <button
                  type="button"
                  className="bg-white border-none rounded-[7px] text-[#1e272e] text-[0.92rem] font-bold font-[inherit] py-[0.65rem] px-7 cursor-pointer transition-[background,transform] duration-150 tracking-[0.01em] hover:bg-white/90 hover:-translate-y-px active:translate-y-0 disabled:opacity-65 disabled:cursor-not-allowed disabled:!transform-none"
                  onClick={next}
                  disabled={idLoading}
                >
                  {idLoading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                      </svg>
                      Consultando...
                    </span>
                  ) : "Continuar →"}
                </button>
              ) : (
                <button
                  type="submit"
                  className="bg-white border-none rounded-[7px] text-[#1e272e] text-[0.92rem] font-bold font-[inherit] py-[0.65rem] px-7 cursor-pointer transition-[background,transform] duration-150 tracking-[0.01em] hover:bg-white/90 hover:-translate-y-px active:translate-y-0 disabled:opacity-65 disabled:cursor-not-allowed disabled:!transform-none"
                  onClick={handleSubmit}
                  disabled={submitLoading}
                >
                  {submitLoading ? "Registrando..." : "Registrarme"}
                </button>
              )}
            </div>
          </div>

          {/* ── Footer link ─────────────────────────────── */}
          <p className="text-center text-[0.85rem] text-white/35">
            ¿Ya tienes cuenta?{" "}
            <button
              type="button"
              className="text-white/65 bg-transparent border-none cursor-pointer font-[inherit] text-[inherit] p-0 transition-colors duration-150 hover:text-white"
              onClick={() => setLoginOpen(true)}
            >
              Inicia sesión
            </button>
          </p>

        </div>
      </main>

      <Footer />
    </>
  );
}
