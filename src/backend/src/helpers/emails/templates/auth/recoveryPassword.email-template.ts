export default function recoveryPasswordTemplate(
  name: string,
  email: string,
  password: string
): string {
  const currentYear: number = new Date().getFullYear();

  return `
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
  <meta name="viewport" content="width=device-width">
  <title>Recuperación de contraseña — SimpleFit</title>
  <style type="text/css">
    table, td, div, h1, p { font-family: Arial, sans-serif; }
  </style>
</head>

<body style="margin:0;padding:0;background:#f4f4f4;">
  <table role="presentation" style="width:100%;border-collapse:collapse;border:0;border-spacing:0;background:#f4f4f4;">
    <tr>
      <td align="center" style="padding:30px 0;">

        <!-- Card -->
        <table role="presentation" style="width:600px;max-width:100%;border-collapse:collapse;border-spacing:0;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td align="center" style="padding:36px 30px;background:#1a2228;">
              <img
                src="https://firebasestorage.googleapis.com/v0/b/simplefit-6c181.firebasestorage.app/o/logos%2Fsimplefit.png?alt=media&token=64cccbb6-387b-4399-94d3-77b6c960ad34"
                alt="SimpleFit"
                width="180"
                style="height:auto;display:block;filter:brightness(0) invert(1);"
              />
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px 40px;">

              <h1 style="font-size:22px;margin:0 0 16px 0;color:#1a2228;font-family:Arial,sans-serif;">
                Hola ${name}, recibimos tu solicitud.
              </h1>

              <p style="margin:0 0 12px 0;font-size:15px;line-height:24px;color:#444444;font-family:Arial,sans-serif;">
                Hemos generado una contraseña temporal para que puedas acceder a tu cuenta. Utiliza las siguientes credenciales:
              </p>

              <!-- Credentials box -->
              <table role="presentation" style="width:100%;border-collapse:collapse;border-spacing:0;margin:24px 0;background:#f8f9fa;border-radius:8px;border:1px solid #e9ecef;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 10px 0;font-size:14px;color:#666666;font-family:Arial,sans-serif;">
                      <span style="font-weight:700;color:#1a2228;">Correo electrónico:</span><br>
                      <span style="font-size:15px;color:#333333;">${email}</span>
                    </p>
                    <p style="margin:0;font-size:14px;color:#666666;font-family:Arial,sans-serif;">
                      <span style="font-weight:700;color:#1a2228;">Contraseña temporal:</span><br>
                      <span style="font-size:22px;font-weight:700;letter-spacing:4px;color:#1a2228;font-family:monospace;">${password}</span>
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 8px 0;font-size:13px;line-height:20px;color:#888888;font-family:Arial,sans-serif;font-style:italic;">
                Esta contraseña es temporal. Deberás establecer una nueva contraseña después de iniciar sesión.
              </p>

              <!-- Alert box -->
              <table role="presentation" style="width:100%;border-collapse:collapse;border-spacing:0;margin:16px 0 0 0;background:#fff8f0;border-radius:8px;border-left:4px solid #fb8c00;">
                <tr>
                  <td style="padding:14px 20px;">
                    <p style="margin:0;font-size:13px;line-height:20px;color:#7a5230;font-family:Arial,sans-serif;font-style:italic;">
                      Si no solicitaste este cambio de contraseña, por favor contáctanos de inmediato.
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin:16px 0 0 0;font-size:12px;line-height:18px;color:#aaaaaa;font-family:Arial,sans-serif;font-style:italic;">
                Por favor no respondas este correo ya que es generado automáticamente.
              </p>

            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 40px;">
              <hr style="border:none;border-top:1px solid #eeeeee;margin:0;">
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;background:#ffffff;">
              <table role="presentation" style="width:100%;border-collapse:collapse;border-spacing:0;">
                <tr>
                  <td style="padding:0;vertical-align:middle;">
                    <p style="margin:0;font-size:12px;line-height:18px;color:#aaaaaa;font-family:Arial,sans-serif;">
                      &copy; SimpleFit Costa Rica ${currentYear}<br>
                      Heredia Centro, Costa Rica
                    </p>
                  </td>
                  <td style="padding:0;text-align:right;vertical-align:middle;">
                    <table role="presentation" style="border-collapse:collapse;border-spacing:0;display:inline-table;">
                      <tr>
                        <td style="padding:0 0 0 8px;">
                          <span style="display:inline-block;width:34px;height:34px;border-radius:50%;background:#25D366;text-align:center;line-height:34px;">
                            <img src="https://img.icons8.com/fluency/48/ffffff/whatsapp.png" alt="WhatsApp" width="20" style="vertical-align:middle;display:inline-block;margin-top:7px;" />
                          </span>
                        </td>
                        <td style="padding:0 0 0 8px;">
                          <span style="display:inline-block;width:34px;height:34px;border-radius:50%;background:#E1306C;text-align:center;line-height:34px;">
                            <img src="https://img.icons8.com/fluency/48/ffffff/instagram-new--v1.png" alt="Instagram" width="20" style="vertical-align:middle;display:inline-block;margin-top:7px;" />
                          </span>
                        </td>
                        <td style="padding:0 0 0 8px;">
                          <span style="display:inline-block;width:34px;height:34px;border-radius:50%;background:#1877F2;text-align:center;line-height:34px;">
                            <img src="https://img.icons8.com/fluency/48/ffffff/facebook-new.png" alt="Facebook" width="20" style="vertical-align:middle;display:inline-block;margin-top:7px;" />
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
        <!-- /Card -->

      </td>
    </tr>
  </table>
</body>
</html>
`;
}
