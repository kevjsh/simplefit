import Image from "next/image";
import styles from "./Footer.module.css";

const CONTACT_ITEMS = [
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.97a16 16 0 0 0 5.55 5.55l.38-.38a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
      </svg>
    ),
    label: "Teléfono",
    value: "4033-8754",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>
      </svg>
    ),
    label: "Ubicación",
    value: "Heredia Centro, Costa Rica",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
      </svg>
    ),
    label: "Facebook",
    value: "facebook.com/gimesalud",
    href: "https://facebook.com/gimesalud",
  },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.main}>
        {/* Brand */}
        <div className={styles.brand}>
          <Image
            src="https://firebasestorage.googleapis.com/v0/b/simplefit-6c181.firebasestorage.app/o/logos%2Fsimplefit.png?alt=media&token=64cccbb6-387b-4399-94d3-77b6c960ad34"
            alt="SimpleFit"
            width={140}
            height={70}
            className={styles.brandLogo}
          />
          <p className={styles.brandDesc}>
          Un gimnasio completo, espacioso, donde podrás realizar tus rutinas de una manera más cómoda.
          </p>
        </div>

        {/* Contact */}
        <div className={styles.contact}>
          <h4 className={styles.colTitle}>Contacto</h4>
          <ul className={styles.contactList}>
            {CONTACT_ITEMS.map(({ icon, label, value, href }) => (
              <li key={label} className={styles.contactItem}>
                <span className={styles.contactIcon}>{icon}</span>
                <span className={styles.contactText}>
                  {href ? (
                    <a href={href} target="_blank" rel="noopener noreferrer">
                      {value}
                    </a>
                  ) : (
                    value
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className={styles.bottom}>
        <p>© {year} SimpleFit. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}
