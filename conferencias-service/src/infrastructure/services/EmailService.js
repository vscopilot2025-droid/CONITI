import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const logoBase64 = readFileSync(join(__dirname, 'Logos-Emailing.png')).toString('base64')
import nodemailer from 'nodemailer'

export class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: Number(process.env.EMAIL_PORT),
            secure: true,
            connectionTimeout: 5000,
            greetingTimeout: 5000,
            socketTimeout: 5000,
            auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASS
            },
            tls: {
              rejectUnauthorized: false
            }
          })
      }
        async sendWelcomeEmail({ fullName, email }) {
          console.log(`Intentando enviar correo a ${email}...`)
          await this.transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: email,
            subject: '¡Bienvenido/a a CONITI!',
            html: `
      <!DOCTYPE html>
      <html>
      <body style="margin:0;padding:0;background-color:#f4f4f4;font-family:Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td align="center" style="padding:20px 0;">
              <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
                
                <!-- HEADER CON LOGO -->
                <tr>
                  <td align="center" style="background:#ffffff;padding:24px 40px;border-bottom:3px solid #1a3a6b;">
                <img src="https://www.ucatolica.edu.co/portal/wp-content/uploads/2025/10/Logos-Emailing.png" alt="Universidad Católica de Colombia" style="max-width:500px;width:100%;" />
                </tr>
      
                <!-- BANNER AZUL -->
                <tr>
                  <td style="background:#1a3a6b;padding:30px 40px;text-align:center;">
                    <h1 style="color:#ffffff;margin:0;font-size:26px;letter-spacing:1px;">¡Bienvenido/a a CONIITI!</h1>
                    <p style="color:#f0c040;margin:8px 0 0;font-size:14px;letter-spacing:2px;">Congreso Internacional de Innovación y Tendencias en Ingeniería</p>
                  </td>
                </tr>
      
                <!-- CONTENIDO -->
                    <tr>
                    <td style="padding:40px;">
                        <p style="font-size:16px;color:#333;margin:0 0 16px;">Estimado/a <strong>${fullName}</strong>,</p>
                        <p style="font-size:15px;color:#555;line-height:1.7;margin:0 0 16px;">
                        Nos complace darte la bienvenida al <strong>Congreso Internacional de Innovación y Tendencias en Ingeniería — CONIITI</strong>, 
                        organizado por la <strong>Universidad Católica de Colombia</strong>. Tu registro ha sido completado exitosamente.
                        </p>
                        <p style="font-size:15px;color:#555;line-height:1.7;margin:0 0 16px;">
                        CONIITI es un espacio abierto de interacción entre investigadores, estudiantes y empresarios, 
                        enfocado en conectar actores del ecosistema innovador para compartir nuevas aproximaciones 
                        en la transformación creativa de Colombia a través de soluciones con visión de ingeniería.
                        </p>
                        <p style="font-size:15px;color:#555;line-height:1.7;margin:0 0 0;">
                        Pronto recibirás más información sobre la programación, conferencias y talleres del congreso. 
                        ¡Te esperamos!
                        </p>
                        <p style="font-size:13px;color:#999;text-align:center;margin:24px 0 0;">
                        Si no realizaste este registro, puedes ignorar este correo.
                        </p>
                    </td>
                    </tr>
      
                <!-- FOOTER -->
                <tr>
                  <td style="background:#1a3a6b;padding:24px 40px;text-align:center;">
                    <p style="color:#ffffff;margin:0 0 6px;font-size:13px;font-weight:bold;">Universidad Católica de Colombia</p>
                    <p style="color:#aac4e0;margin:0 0 6px;font-size:12px;">Av. Caracas # 46 - 72 / Sede Las-Torres</p>
                    <p style="color:#aac4e0;margin:0 0 6px;font-size:12px;">Línea de servicio: +57 (601) 443 3700</p>
                    <p style="color:#aac4e0;margin:0;font-size:11px;">Vigilada Mineducación | © todos los derechos reservados 2018</p>
                  </td>
                </tr>
      
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
            `
          })
        }
      }