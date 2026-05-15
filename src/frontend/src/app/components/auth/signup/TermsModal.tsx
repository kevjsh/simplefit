"use client";

import { useEffect, useRef } from "react";
import styles from "./TermsModal.module.css";

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
      className={styles.overlay}
      onClick={(e) => e.target === overlayRef.current && onClose()}
    >
      <div className={styles.panel} role="dialog" aria-modal="true" aria-label="Términos y condiciones">

        {/* Header */}
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>Términos y Condiciones de Uso</h2>
            <p className={styles.meta}>SimpleFit · Última actualización: 12 de mayo de 2026</p>
          </div>
          <button className={styles.close} onClick={onClose} aria-label="Cerrar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className={styles.body}>

          <p className={styles.intro}>
            Bienvenido a SimpleFit. Al registrarse, acceder o utilizar la plataforma web y/o aplicación móvil de SimpleFit,
            el usuario acepta plenamente los presentes Términos y Condiciones de Uso, así como las políticas relacionadas
            con el tratamiento y protección de datos personales.
          </p>
          <p className={styles.intro}>
            Si el usuario no está de acuerdo con cualquiera de las disposiciones aquí establecidas, deberá abstenerse
            de utilizar los servicios ofrecidos por SimpleFit.
          </p>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>1. Identificación del Servicio</h3>
            <p>
              SimpleFit es una plataforma tecnológica orientada a la administración y gestión de gimnasios, control de rutinas,
              seguimiento de pagos, gestión de membresías y administración de información relacionada con usuarios y clientes
              de gimnasios afiliados.
            </p>
            <p>El acceso y utilización de la plataforma implica la aceptación expresa de estos términos y condiciones.</p>
          </section>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>2. Definiciones</h3>
            <ul className={styles.defList}>
              <li><strong>SimpleFit</strong> se refiere a la plataforma tecnológica disponible mediante sitio web, aplicación móvil y sistemas relacionados.</li>
              <li><strong>Usuario</strong> se refiere a cualquier persona física o jurídica que utilice los servicios de SimpleFit.</li>
              <li><strong>Gimnasio</strong> se refiere al establecimiento registrado dentro de la plataforma que utiliza los servicios administrativos de SimpleFit.</li>
              <li><strong>Datos personales</strong> incluye, entre otros: nombre completo, número de identificación, correo electrónico, número telefónico, historial de pagos, información de membresías y demás información suministrada por el usuario.</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>3. Aceptación del Usuario</h3>
            <p>Al crear una cuenta o utilizar la plataforma, el usuario declara:</p>
            <ul className={styles.list}>
              <li>Que ha leído y comprendido estos términos y condiciones.</li>
              <li>Que acepta voluntariamente el tratamiento de sus datos conforme a lo aquí establecido.</li>
              <li>Que la información suministrada es veraz, actualizada y legítima.</li>
              <li>Que utilizará la plataforma de conformidad con la legislación costarricense vigente.</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>4. Tratamiento de Datos Personales</h3>
            <p>
              SimpleFit realiza el tratamiento de datos personales de conformidad con la legislación costarricense aplicable
              y bajo principios de confidencialidad, seguridad y uso legítimo de la información.
            </p>
            <p>Los datos recopilados podrán utilizarse para:</p>
            <ul className={styles.list}>
              <li>Administración de cuentas y membresías.</li>
              <li>Gestión de pagos e historial financiero.</li>
              <li>Gestión de rutinas y seguimiento deportivo.</li>
              <li>Comunicación entre gimnasios y usuarios.</li>
              <li>Soporte técnico y mejora del servicio.</li>
              <li>Cumplimiento de obligaciones legales y regulatorias.</li>
            </ul>
            <p>
              El usuario reconoce y acepta que, al registrarse en un gimnasio dentro de la plataforma, determinada información
              básica podrá ser compartida con dicho gimnasio para efectos operativos y administrativos propios de la relación
              comercial entre ambas partes.
            </p>
          </section>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>5. Confidencialidad y No Compartición con Terceros</h3>
            <p>SimpleFit no vende, alquila ni comparte información personal de los usuarios con terceros ajenos a la plataforma, salvo en los siguientes casos:</p>
            <ul className={styles.list}>
              <li>Cuando exista autorización expresa del usuario.</li>
              <li>Cuando el usuario se registre o interactúe voluntariamente con un gimnasio dentro de la plataforma.</li>
              <li>Cuando exista obligación legal, judicial o requerimiento de autoridad competente.</li>
              <li>Cuando sea estrictamente necesario para la operación técnica y segura del servicio.</li>
            </ul>
            <p>SimpleFit se compromete a mantener estándares razonables y profesionales de protección de datos y confidencialidad.</p>
          </section>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>6. Seguridad de la Información</h3>
            <p>SimpleFit implementa medidas técnicas, administrativas y organizativas orientadas a proteger la información de accesos no autorizados, alteraciones, pérdidas o usos indebidos. Entre dichas medidas pueden incluirse:</p>
            <ul className={styles.list}>
              <li>Cifrado de contraseñas.</li>
              <li>Almacenamiento seguro de información.</li>
              <li>Protocolos de autenticación.</li>
              <li>Accesos restringidos.</li>
              <li>Monitoreo y protección de infraestructura tecnológica.</li>
            </ul>
            <p>
              No obstante, el usuario reconoce que ningún sistema informático o transmisión electrónica es absolutamente
              invulnerable, por lo que SimpleFit no puede garantizar seguridad absoluta frente a ataques externos, accesos
              ilícitos o eventos fuera de su control razonable.
            </p>
          </section>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>7. Responsabilidad del Usuario</h3>
            <p>El usuario se compromete a:</p>
            <ul className={styles.list}>
              <li>Mantener la confidencialidad de sus credenciales de acceso.</li>
              <li>No utilizar la plataforma para actividades ilícitas, fraudulentas o abusivas.</li>
              <li>No intentar vulnerar la seguridad de la plataforma.</li>
              <li>No utilizar información de terceros sin autorización.</li>
              <li>Utilizar el sistema conforme a la ley, la moral y el orden público.</li>
            </ul>
            <p>El usuario será responsable por cualquier actividad realizada desde su cuenta.</p>
          </section>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>8. Limitación de Responsabilidad</h3>
            <p>SimpleFit actúa como proveedor tecnológico y administrativo. En consecuencia:</p>
            <ul className={styles.list}>
              <li>No se hace responsable por conflictos internos entre gimnasios y sus clientes.</li>
              <li>No garantiza resultados deportivos, físicos o comerciales derivados del uso de la plataforma.</li>
              <li>No asume responsabilidad por errores ocasionados por información incorrecta suministrada por usuarios o gimnasios.</li>
              <li>No será responsable por interrupciones temporales del servicio derivadas de mantenimiento, fallas técnicas, fuerza mayor, ataques informáticos o causas ajenas a su control razonable.</li>
            </ul>
            <p>El usuario acepta utilizar la plataforma bajo su propio riesgo.</p>
          </section>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>9. Suspensión o Cancelación de Cuentas</h3>
            <p>SimpleFit se reserva el derecho de suspender, restringir o cancelar cuentas de usuarios o gimnasios, temporal o permanentemente, sin previo aviso, cuando:</p>
            <ul className={styles.list}>
              <li>Se incumplan estos términos y condiciones.</li>
              <li>Exista uso fraudulento o sospechoso de la plataforma.</li>
              <li>Se detecten actividades ilícitas o que comprometan la seguridad del sistema.</li>
              <li>Se realicen intentos de acceso no autorizado o manipulación de datos.</li>
              <li>Existan conductas abusivas hacia otros usuarios o hacia la plataforma.</li>
            </ul>
            <p>La cancelación de la cuenta no extingue obligaciones pendientes adquiridas previamente.</p>
          </section>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>10. Modificaciones a los Términos y Condiciones</h3>
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

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>11. Propiedad Intelectual</h3>
            <p>
              Todos los elementos relacionados con SimpleFit, incluyendo software, diseño, logotipos, marcas, interfaces,
              textos y funcionalidades, son propiedad exclusiva de SimpleFit o de sus respectivos titulares y se encuentran
              protegidos por la legislación aplicable. Queda prohibida su reproducción, distribución o utilización no autorizada.
            </p>
          </section>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>12. Disponibilidad del Servicio</h3>
            <p>
              SimpleFit procurará mantener la plataforma disponible de forma continua; sin embargo, no garantiza
              disponibilidad ininterrumpida del servicio. Podrán realizarse mantenimientos, actualizaciones o suspensiones
              temporales sin responsabilidad para SimpleFit.
            </p>
          </section>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>13. Legislación Aplicable</h3>
            <p>
              Los presentes términos y condiciones se regirán e interpretarán de conformidad con las leyes de la República
              de Costa Rica. Cualquier controversia relacionada con el uso de la plataforma será sometida a la jurisdicción
              de los tribunales competentes de Costa Rica.
            </p>
          </section>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>14. Contacto</h3>
            <p>
              Para consultas relacionadas con estos términos y condiciones o con el tratamiento de datos personales,
              el usuario podrá comunicarse mediante los canales oficiales publicados en:{" "}
              <a href="https://simplefitcr.com" target="_blank" rel="noopener noreferrer" className={styles.link}>
                simplefitcr.com
              </a>
            </p>
          </section>

          <div className={styles.declaration}>
            <p>
              <strong>Declaración de Aceptación:</strong> Al crear una cuenta y utilizar SimpleFit, el usuario declara
              haber leído, comprendido y aceptado íntegramente los presentes Términos y Condiciones de Uso y el tratamiento
              de datos personales aquí descrito.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <button className={styles.closeBtn} onClick={onClose}>
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
}
