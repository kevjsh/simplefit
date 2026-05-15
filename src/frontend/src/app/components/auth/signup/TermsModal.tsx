"use client";

import { useEffect, useRef } from "react";

interface TermsModalProps {
  open: boolean;
  onClose: () => void;
}

export default function TermsModal({ open, onClose }: TermsModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[600] bg-black/75 backdrop-blur-[4px] flex items-center justify-center p-4 animate-fade-in"
      onClick={(e) => e.target === overlayRef.current && onClose()}
    >
      <div
        className="w-full max-w-[660px] max-h-[88svh] bg-[#1a2228] border border-white/8 rounded-[14px] flex flex-col shadow-[0_24px_64px_rgba(0,0,0,0.6)] animate-slide-up overflow-hidden max-[480px]:max-h-[92svh] max-[480px]:rounded-xl"
        role="dialog" aria-modal="true" aria-label="Términos y condiciones"
      >

        {/* Header */}
        <div className="flex items-start justify-between gap-4 p-[1.5rem_1.5rem_1.25rem] border-b border-white/[0.07] shrink-0 max-[480px]:p-[1.25rem_1.1rem_1rem]">
          <div>
            <h2 className="text-[1.1rem] font-extrabold text-white tracking-[-0.01em] leading-[1.2]">Términos y Condiciones de Uso</h2>
            <p className="text-[0.78rem] text-white/35 mt-1">SimpleFit · Última actualización: 12 de mayo de 2026</p>
          </div>
          <button
            className="shrink-0 w-8 h-8 flex items-center justify-center bg-transparent border-none rounded-md text-white/40 cursor-pointer transition-[background,color] duration-150 hover:bg-white/[0.07] hover:text-white/85"
            onClick={onClose} aria-label="Cerrar"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 scrollbar-thin-dark max-[480px]:p-[1.1rem]">

          <p className="text-[0.9rem] text-white/60 leading-[1.7]">
            Bienvenido a SimpleFit. Al registrarse, acceder o utilizar la plataforma web y/o aplicación móvil de SimpleFit,
            el usuario acepta plenamente los presentes Términos y Condiciones de Uso, así como las políticas relacionadas
            con el tratamiento y protección de datos personales.
          </p>
          <p className="text-[0.9rem] text-white/60 leading-[1.7]">
            Si el usuario no está de acuerdo con cualquiera de las disposiciones aquí establecidas, deberá abstenerse
            de utilizar los servicios ofrecidos por SimpleFit.
          </p>

          <section className="flex flex-col gap-[0.65rem] [&>p]:text-[0.88rem] [&>p]:text-white/[0.62] [&>p]:leading-[1.7]">
            <h3 className="text-[0.82rem] font-bold uppercase tracking-[0.07em] text-white/55 pb-[0.4rem] border-b border-white/[0.06]">1. Identificación del Servicio</h3>
            <p>
              SimpleFit es una plataforma tecnológica orientada a la administración y gestión de gimnasios, control de rutinas,
              seguimiento de pagos, gestión de membresías y administración de información relacionada con usuarios y clientes
              de gimnasios afiliados.
            </p>
            <p>El acceso y utilización de la plataforma implica la aceptación expresa de estos términos y condiciones.</p>
          </section>

          <section className="flex flex-col gap-[0.65rem] [&>p]:text-[0.88rem] [&>p]:text-white/[0.62] [&>p]:leading-[1.7]">
            <h3 className="text-[0.82rem] font-bold uppercase tracking-[0.07em] text-white/55 pb-[0.4rem] border-b border-white/[0.06]">2. Definiciones</h3>
            <ul className="flex flex-col gap-[0.4rem] pl-0 [&_strong]:text-white/[0.82]">
              <li className="text-[0.88rem] text-white/[0.62] leading-[1.6] pl-[1.1rem] relative before:content-['·'] before:absolute before:left-[0.2rem] before:text-white/25"><strong>SimpleFit</strong> se refiere a la plataforma tecnológica disponible mediante sitio web, aplicación móvil y sistemas relacionados.</li>
              <li className="text-[0.88rem] text-white/[0.62] leading-[1.6] pl-[1.1rem] relative before:content-['·'] before:absolute before:left-[0.2rem] before:text-white/25"><strong>Usuario</strong> se refiere a cualquier persona física o jurídica que utilice los servicios de SimpleFit.</li>
              <li className="text-[0.88rem] text-white/[0.62] leading-[1.6] pl-[1.1rem] relative before:content-['·'] before:absolute before:left-[0.2rem] before:text-white/25"><strong>Gimnasio</strong> se refiere al establecimiento registrado dentro de la plataforma que utiliza los servicios administrativos de SimpleFit.</li>
              <li className="text-[0.88rem] text-white/[0.62] leading-[1.6] pl-[1.1rem] relative before:content-['·'] before:absolute before:left-[0.2rem] before:text-white/25"><strong>Datos personales</strong> incluye, entre otros: nombre completo, número de identificación, correo electrónico, número telefónico, historial de pagos, información de membresías y demás información suministrada por el usuario.</li>
            </ul>
          </section>

          <section className="flex flex-col gap-[0.65rem] [&>p]:text-[0.88rem] [&>p]:text-white/[0.62] [&>p]:leading-[1.7]">
            <h3 className="text-[0.82rem] font-bold uppercase tracking-[0.07em] text-white/55 pb-[0.4rem] border-b border-white/[0.06]">3. Aceptación del Usuario</h3>
            <p>Al crear una cuenta o utilizar la plataforma, el usuario declara:</p>
            <ul className="flex flex-col gap-[0.4rem] pl-0">
              <li className="text-[0.88rem] text-white/[0.62] leading-[1.6] pl-[1.1rem] relative before:content-['–'] before:absolute before:left-0 before:text-white/25">Que ha leído y comprendido estos términos y condiciones.</li>
              <li className="text-[0.88rem] text-white/[0.62] leading-[1.6] pl-[1.1rem] relative before:content-['–'] before:absolute before:left-0 before:text-white/25">Que acepta voluntariamente el tratamiento de sus datos conforme a lo aquí establecido.</li>
              <li className="text-[0.88rem] text-white/[0.62] leading-[1.6] pl-[1.1rem] relative before:content-['–'] before:absolute before:left-0 before:text-white/25">Que la información suministrada es veraz, actualizada y legítima.</li>
              <li className="text-[0.88rem] text-white/[0.62] leading-[1.6] pl-[1.1rem] relative before:content-['–'] before:absolute before:left-0 before:text-white/25">Que utilizará la plataforma de conformidad con la legislación costarricense vigente.</li>
            </ul>
          </section>

          <section className="flex flex-col gap-[0.65rem] [&>p]:text-[0.88rem] [&>p]:text-white/[0.62] [&>p]:leading-[1.7]">
            <h3 className="text-[0.82rem] font-bold uppercase tracking-[0.07em] text-white/55 pb-[0.4rem] border-b border-white/[0.06]">4. Tratamiento de Datos Personales</h3>
            <p>
              SimpleFit realiza el tratamiento de datos personales de conformidad con la legislación costarricense aplicable
              y bajo principios de confidencialidad, seguridad y uso legítimo de la información.
            </p>
            <p>Los datos recopilados podrán utilizarse para:</p>
            <ul className="flex flex-col gap-[0.4rem] pl-0">
              <li className="text-[0.88rem] text-white/[0.62] leading-[1.6] pl-[1.1rem] relative before:content-['–'] before:absolute before:left-0 before:text-white/25">Administración de cuentas y membresías.</li>
              <li className="text-[0.88rem] text-white/[0.62] leading-[1.6] pl-[1.1rem] relative before:content-['–'] before:absolute before:left-0 before:text-white/25">Gestión de pagos e historial financiero.</li>
              <li className="text-[0.88rem] text-white/[0.62] leading-[1.6] pl-[1.1rem] relative before:content-['–'] before:absolute before:left-0 before:text-white/25">Gestión de rutinas y seguimiento deportivo.</li>
              <li className="text-[0.88rem] text-white/[0.62] leading-[1.6] pl-[1.1rem] relative before:content-['–'] before:absolute before:left-0 before:text-white/25">Comunicación entre gimnasios y usuarios.</li>
              <li className="text-[0.88rem] text-white/[0.62] leading-[1.6] pl-[1.1rem] relative before:content-['–'] before:absolute before:left-0 before:text-white/25">Soporte técnico y mejora del servicio.</li>
              <li className="text-[0.88rem] text-white/[0.62] leading-[1.6] pl-[1.1rem] relative before:content-['–'] before:absolute before:left-0 before:text-white/25">Cumplimiento de obligaciones legales y regulatorias.</li>
            </ul>
            <p>
              El usuario reconoce y acepta que, al registrarse en un gimnasio dentro de la plataforma, determinada información
              básica podrá ser compartida con dicho gimnasio para efectos operativos y administrativos propios de la relación
              comercial entre ambas partes.
            </p>
          </section>

          <section className="flex flex-col gap-[0.65rem] [&>p]:text-[0.88rem] [&>p]:text-white/[0.62] [&>p]:leading-[1.7]">
            <h3 className="text-[0.82rem] font-bold uppercase tracking-[0.07em] text-white/55 pb-[0.4rem] border-b border-white/[0.06]">5. Confidencialidad y No Compartición con Terceros</h3>
            <p>SimpleFit no vende, alquila ni comparte información personal de los usuarios con terceros ajenos a la plataforma, salvo en los siguientes casos:</p>
            <ul className="flex flex-col gap-[0.4rem] pl-0">
              <li className="text-[0.88rem] text-white/[0.62] leading-[1.6] pl-[1.1rem] relative before:content-['–'] before:absolute before:left-0 before:text-white/25">Cuando exista autorización expresa del usuario.</li>
              <li className="text-[0.88rem] text-white/[0.62] leading-[1.6] pl-[1.1rem] relative before:content-['–'] before:absolute before:left-0 before:text-white/25">Cuando el usuario se registre o interactúe voluntariamente con un gimnasio dentro de la plataforma.</li>
              <li className="text-[0.88rem] text-white/[0.62] leading-[1.6] pl-[1.1rem] relative before:content-['–'] before:absolute before:left-0 before:text-white/25">Cuando exista obligación legal, judicial o requerimiento de autoridad competente.</li>
              <li className="text-[0.88rem] text-white/[0.62] leading-[1.6] pl-[1.1rem] relative before:content-['–'] before:absolute before:left-0 before:text-white/25">Cuando sea estrictamente necesario para la operación técnica y segura del servicio.</li>
            </ul>
            <p>SimpleFit se compromete a mantener estándares razonables y profesionales de protección de datos y confidencialidad.</p>
          </section>

          <section className="flex flex-col gap-[0.65rem] [&>p]:text-[0.88rem] [&>p]:text-white/[0.62] [&>p]:leading-[1.7]">
            <h3 className="text-[0.82rem] font-bold uppercase tracking-[0.07em] text-white/55 pb-[0.4rem] border-b border-white/[0.06]">6. Seguridad de la Información</h3>
            <p>SimpleFit implementa medidas técnicas, administrativas y organizativas orientadas a proteger la información de accesos no autorizados, alteraciones, pérdidas o usos indebidos. Entre dichas medidas pueden incluirse:</p>
            <ul className="flex flex-col gap-[0.4rem] pl-0">
              <li className="text-[0.88rem] text-white/[0.62] leading-[1.6] pl-[1.1rem] relative before:content-['–'] before:absolute before:left-0 before:text-white/25">Cifrado de contraseñas.</li>
              <li className="text-[0.88rem] text-white/[0.62] leading-[1.6] pl-[1.1rem] relative before:content-['–'] before:absolute before:left-0 before:text-white/25">Almacenamiento seguro de información.</li>
              <li className="text-[0.88rem] text-white/[0.62] leading-[1.6] pl-[1.1rem] relative before:content-['–'] before:absolute before:left-0 before:text-white/25">Protocolos de autenticación.</li>
              <li className="text-[0.88rem] text-white/[0.62] leading-[1.6] pl-[1.1rem] relative before:content-['–'] before:absolute before:left-0 before:text-white/25">Accesos restringidos.</li>
              <li className="text-[0.88rem] text-white/[0.62] leading-[1.6] pl-[1.1rem] relative before:content-['–'] before:absolute before:left-0 before:text-white/25">Monitoreo y protección de infraestructura tecnológica.</li>
            </ul>
            <p>
              No obstante, el usuario reconoce que ningún sistema informático o transmisión electrónica es absolutamente
              invulnerable, por lo que SimpleFit no puede garantizar seguridad absoluta frente a ataques externos, accesos
              ilícitos o eventos fuera de su control razonable.
            </p>
          </section>

          <section className="flex flex-col gap-[0.65rem] [&>p]:text-[0.88rem] [&>p]:text-white/[0.62] [&>p]:leading-[1.7]">
            <h3 className="text-[0.82rem] font-bold uppercase tracking-[0.07em] text-white/55 pb-[0.4rem] border-b border-white/[0.06]">7. Responsabilidad del Usuario</h3>
            <p>El usuario se compromete a:</p>
            <ul className="flex flex-col gap-[0.4rem] pl-0">
              <li className="text-[0.88rem] text-white/[0.62] leading-[1.6] pl-[1.1rem] relative before:content-['–'] before:absolute before:left-0 before:text-white/25">Mantener la confidencialidad de sus credenciales de acceso.</li>
              <li className="text-[0.88rem] text-white/[0.62] leading-[1.6] pl-[1.1rem] relative before:content-['–'] before:absolute before:left-0 before:text-white/25">No utilizar la plataforma para actividades ilícitas, fraudulentas o abusivas.</li>
              <li className="text-[0.88rem] text-white/[0.62] leading-[1.6] pl-[1.1rem] relative before:content-['–'] before:absolute before:left-0 before:text-white/25">No intentar vulnerar la seguridad de la plataforma.</li>
              <li className="text-[0.88rem] text-white/[0.62] leading-[1.6] pl-[1.1rem] relative before:content-['–'] before:absolute before:left-0 before:text-white/25">No utilizar información de terceros sin autorización.</li>
              <li className="text-[0.88rem] text-white/[0.62] leading-[1.6] pl-[1.1rem] relative before:content-['–'] before:absolute before:left-0 before:text-white/25">Utilizar el sistema conforme a la ley, la moral y el orden público.</li>
            </ul>
            <p>El usuario será responsable por cualquier actividad realizada desde su cuenta.</p>
          </section>

          <section className="flex flex-col gap-[0.65rem] [&>p]:text-[0.88rem] [&>p]:text-white/[0.62] [&>p]:leading-[1.7]">
            <h3 className="text-[0.82rem] font-bold uppercase tracking-[0.07em] text-white/55 pb-[0.4rem] border-b border-white/[0.06]">8. Limitación de Responsabilidad</h3>
            <p>SimpleFit actúa como proveedor tecnológico y administrativo. En consecuencia:</p>
            <ul className="flex flex-col gap-[0.4rem] pl-0">
              <li className="text-[0.88rem] text-white/[0.62] leading-[1.6] pl-[1.1rem] relative before:content-['–'] before:absolute before:left-0 before:text-white/25">No se hace responsable por conflictos internos entre gimnasios y sus clientes.</li>
              <li className="text-[0.88rem] text-white/[0.62] leading-[1.6] pl-[1.1rem] relative before:content-['–'] before:absolute before:left-0 before:text-white/25">No garantiza resultados deportivos, físicos o comerciales derivados del uso de la plataforma.</li>
              <li className="text-[0.88rem] text-white/[0.62] leading-[1.6] pl-[1.1rem] relative before:content-['–'] before:absolute before:left-0 before:text-white/25">No asume responsabilidad por errores ocasionados por información incorrecta suministrada por usuarios o gimnasios.</li>
              <li className="text-[0.88rem] text-white/[0.62] leading-[1.6] pl-[1.1rem] relative before:content-['–'] before:absolute before:left-0 before:text-white/25">No será responsable por interrupciones temporales del servicio derivadas de mantenimiento, fallas técnicas, fuerza mayor, ataques informáticos o causas ajenas a su control razonable.</li>
            </ul>
            <p>El usuario acepta utilizar la plataforma bajo su propio riesgo.</p>
          </section>

          <section className="flex flex-col gap-[0.65rem] [&>p]:text-[0.88rem] [&>p]:text-white/[0.62] [&>p]:leading-[1.7]">
            <h3 className="text-[0.82rem] font-bold uppercase tracking-[0.07em] text-white/55 pb-[0.4rem] border-b border-white/[0.06]">9. Suspensión o Cancelación de Cuentas</h3>
            <p>SimpleFit se reserva el derecho de suspender, restringir o cancelar cuentas de usuarios o gimnasios, temporal o permanentemente, sin previo aviso, cuando:</p>
            <ul className="flex flex-col gap-[0.4rem] pl-0">
              <li className="text-[0.88rem] text-white/[0.62] leading-[1.6] pl-[1.1rem] relative before:content-['–'] before:absolute before:left-0 before:text-white/25">Se incumplan estos términos y condiciones.</li>
              <li className="text-[0.88rem] text-white/[0.62] leading-[1.6] pl-[1.1rem] relative before:content-['–'] before:absolute before:left-0 before:text-white/25">Exista uso fraudulento o sospechoso de la plataforma.</li>
              <li className="text-[0.88rem] text-white/[0.62] leading-[1.6] pl-[1.1rem] relative before:content-['–'] before:absolute before:left-0 before:text-white/25">Se detecten actividades ilícitas o que comprometan la seguridad del sistema.</li>
              <li className="text-[0.88rem] text-white/[0.62] leading-[1.6] pl-[1.1rem] relative before:content-['–'] before:absolute before:left-0 before:text-white/25">Se realicen intentos de acceso no autorizado o manipulación de datos.</li>
              <li className="text-[0.88rem] text-white/[0.62] leading-[1.6] pl-[1.1rem] relative before:content-['–'] before:absolute before:left-0 before:text-white/25">Existan conductas abusivas hacia otros usuarios o hacia la plataforma.</li>
            </ul>
            <p>La cancelación de la cuenta no extingue obligaciones pendientes adquiridas previamente.</p>
          </section>

          <section className="flex flex-col gap-[0.65rem] [&>p]:text-[0.88rem] [&>p]:text-white/[0.62] [&>p]:leading-[1.7]">
            <h3 className="text-[0.82rem] font-bold uppercase tracking-[0.07em] text-white/55 pb-[0.4rem] border-b border-white/[0.06]">10. Modificaciones a los Términos y Condiciones</h3>
            <p>
              SimpleFit podrá modificar, actualizar o sustituir los presentes términos y condiciones en cualquier momento
              y sin previo aviso, cuando resulte necesario por razones legales, técnicas, operativas o comerciales.
              Las modificaciones entrarán en vigencia desde su publicación en la plataforma.
            </p>
            <p>
              El uso continuo del servicio después de cualquier modificación constituirá aceptación expresa de los nuevos
              términos. Es responsabilidad del usuario revisar periódicamente esta sección.
            </p>
          </section>

          <section className="flex flex-col gap-[0.65rem] [&>p]:text-[0.88rem] [&>p]:text-white/[0.62] [&>p]:leading-[1.7]">
            <h3 className="text-[0.82rem] font-bold uppercase tracking-[0.07em] text-white/55 pb-[0.4rem] border-b border-white/[0.06]">11. Propiedad Intelectual</h3>
            <p>
              Todos los elementos relacionados con SimpleFit, incluyendo software, diseño, logotipos, marcas, interfaces,
              textos y funcionalidades, son propiedad exclusiva de SimpleFit o de sus respectivos titulares y se encuentran
              protegidos por la legislación aplicable. Queda prohibida su reproducción, distribución o utilización no autorizada.
            </p>
          </section>

          <section className="flex flex-col gap-[0.65rem] [&>p]:text-[0.88rem] [&>p]:text-white/[0.62] [&>p]:leading-[1.7]">
            <h3 className="text-[0.82rem] font-bold uppercase tracking-[0.07em] text-white/55 pb-[0.4rem] border-b border-white/[0.06]">12. Disponibilidad del Servicio</h3>
            <p>
              SimpleFit procurará mantener la plataforma disponible de forma continua; sin embargo, no garantiza
              disponibilidad ininterrumpida del servicio. Podrán realizarse mantenimientos, actualizaciones o suspensiones
              temporales sin responsabilidad para SimpleFit.
            </p>
          </section>

          <section className="flex flex-col gap-[0.65rem] [&>p]:text-[0.88rem] [&>p]:text-white/[0.62] [&>p]:leading-[1.7]">
            <h3 className="text-[0.82rem] font-bold uppercase tracking-[0.07em] text-white/55 pb-[0.4rem] border-b border-white/[0.06]">13. Legislación Aplicable</h3>
            <p>
              Los presentes términos y condiciones se regirán e interpretarán de conformidad con las leyes de la República
              de Costa Rica. Cualquier controversia relacionada con el uso de la plataforma será sometida a la jurisdicción
              de los tribunales competentes de Costa Rica.
            </p>
          </section>

          <section className="flex flex-col gap-[0.65rem] [&>p]:text-[0.88rem] [&>p]:text-white/[0.62] [&>p]:leading-[1.7]">
            <h3 className="text-[0.82rem] font-bold uppercase tracking-[0.07em] text-white/55 pb-[0.4rem] border-b border-white/[0.06]">14. Contacto</h3>
            <p>
              Para consultas relacionadas con estos términos y condiciones o con el tratamiento de datos personales,
              el usuario podrá comunicarse mediante los canales oficiales publicados en:{" "}
              <a href="https://simplefitcr.com" target="_blank" rel="noopener noreferrer" className="text-white/65 underline underline-offset-2 transition-colors duration-150 hover:text-white">
                simplefitcr.com
              </a>
            </p>
          </section>

          <div className="bg-white/[0.04] border border-white/8 rounded-lg p-[1rem_1.1rem] [&_p]:text-[0.86rem] [&_p]:text-white/60 [&_p]:leading-[1.65] [&_strong]:text-white/85">
            <p>
              <strong>Declaración de Aceptación:</strong> Al crear una cuenta y utilizar SimpleFit, el usuario declara
              haber leído, comprendido y aceptado íntegramente los presentes Términos y Condiciones de Uso y el tratamiento
              de datos personales aquí descrito.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="p-[1rem_1.5rem] border-t border-white/[0.07] flex justify-end shrink-0 max-[480px]:p-[0.85rem_1.1rem]">
          <button
            className="h-10 px-6 bg-white/90 text-[#1a2228] text-[0.88rem] font-bold font-[inherit] border-none rounded-[7px] cursor-pointer transition-colors duration-150 hover:bg-white"
            onClick={onClose}
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
}
