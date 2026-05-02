// @ts-ignore: Deno runtime imports
import { serve } from "https://deno.land/std@0.201.0/http/server.ts";

declare const Deno: any;

const SENDGRID_API_KEY = Deno.env.get("SENDGRID_API_KEY");
const SENDGRID_FROM_EMAIL = Deno.env.get("SENDGRID_FROM_EMAIL") || "contact@veto-care.com";
const SENDGRID_FROM_NAME = Deno.env.get("SENDGRID_FROM_NAME") || "Veto-Care";

if (!SENDGRID_API_KEY) {
  throw new Error("Missing SENDGRID_API_KEY environment variable.");
}

serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  const data = await req.json().catch(() => null);
  if (!data) {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { name, email, message } = data as {
    name?: string;
    email?: string;
    message?: string;
  };

  if (!name || !email || !message) {
    return new Response(JSON.stringify({ error: "Missing required fields" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Email to clinic
  const clinicEmailHtml = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; background: #f8fafc; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; padding: 30px 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { padding: 30px 20px; }
        .field { margin-bottom: 20px; }
        .field label { display: block; font-weight: 600; color: #1f2937; margin-bottom: 8px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; }
        .field value { display: block; color: #4b5563; padding: 12px; background: #f3f4f6; border-radius: 8px; border-left: 3px solid #2563eb; }
        .message-box { background: #f0f9ff; border-left: 4px solid #2563eb; padding: 15px; border-radius: 6px; margin-top: 20px; }
        .footer { background: #f8fafc; padding: 20px; text-align: center; color: #6b7280; font-size: 12px; border-top: 1px solid #e5e7eb; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✉️ Nouveau message de contact</h1>
        </div>
        <div class="content">
          <div class="field">
            <label>Nom du visiteur</label>
            <value>${name}</value>
          </div>
          <div class="field">
            <label>Adresse email</label>
            <value><a href="mailto:${email}" style="color: #2563eb; text-decoration: none;">${email}</a></value>
          </div>
          <div class="message-box">
            <label style="font-weight: 700; color: #1f2937; margin-bottom: 10px; display: block;">Message:</label>
            <p style="margin: 0; color: #1f2937; line-height: 1.6; white-space: pre-wrap;">${escapeHtml(message)}</p>
          </div>
        </div>
        <div class="footer">
          <p>Message reçu via le formulaire de contact de Veto-Care - ${new Date().toLocaleString("fr-FR")}</p>
        </div>
      </div>
    </body>
    </html>
  `;

  // Confirmation email to visitor
  const visitorEmailHtml = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; background: #f8fafc; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; padding: 30px 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; }
        .header p { margin: 10px 0 0 0; opacity: 0.9; }
        .content { padding: 30px 20px; }
        .content p { line-height: 1.6; color: #1f2937; margin-bottom: 15px; }
        .info-box { background: #f0f9ff; border-left: 4px solid #2563eb; padding: 15px; border-radius: 6px; margin: 20px 0; }
        .info-box strong { color: #2563eb; }
        .footer { background: #f8fafc; padding: 20px; text-align: center; color: #6b7280; font-size: 12px; border-top: 1px solid #e5e7eb; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Veto-Care</h1>
          <p>Clinique Vétérinaire</p>
        </div>
        <div class="content">
          <p>Bonjour <strong>${name}</strong>,</p>
          <p>Nous vous remercions de nous avoir contacté. Nous avons bien reçu votre message et nos équipes le traiteront dans les meilleurs délais.</p>
          <div class="info-box">
            <strong>⏱️ Délai de réponse</strong>
            <p style="margin: 8px 0 0 0; font-size: 14px;">Nous vous répondrons généralement dans les 24 heures ouvrables.</p>
          </div>
          <p>Si votre demande est urgente, n'hésitez pas à nous appeler directement :</p>
          <p style="text-align: center; font-size: 16px;"><strong>📞 +33 (1) 23 45 67 89</strong></p>
          <div class="info-box">
            <strong>📍 Notre adresse</strong>
            <p style="margin: 8px 0 0 0; font-size: 14px;">123 Rue de la Santé<br>75000 Paris, France</p>
          </div>
          <p>À bientôt chez Veto-Care ! 🐾</p>
        </div>
        <div class="footer">
          <p>© 2026 Veto-Care. Tous droits réservés.</p>
          <p>Cet email a été envoyé automatiquement. Veuillez ne pas répondre directement à cet email.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    // Send email to clinic
    const clinicResponse = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SENDGRID_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: SENDGRID_FROM_EMAIL, name: SENDGRID_FROM_NAME }],
            subject: `Nouveau message de contact - ${name}`,
          },
        ],
        from: {
          email: SENDGRID_FROM_EMAIL,
          name: SENDGRID_FROM_NAME,
        },
        content: [
          {
            type: "text/html",
            value: clinicEmailHtml,
          },
        ],
        replyTo: {
          email: email,
          name: name,
        },
      }),
    });

    // Send confirmation email to visitor
    const visitorResponse = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SENDGRID_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: email, name: name }],
            subject: "Nous avons reçu votre message - Veto-Care",
          },
        ],
        from: {
          email: SENDGRID_FROM_EMAIL,
          name: SENDGRID_FROM_NAME,
        },
        content: [
          {
            type: "text/html",
            value: visitorEmailHtml,
          },
        ],
      }),
    });

    if (!clinicResponse.ok || !visitorResponse.ok) {
      throw new Error("Failed to send emails");
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Emails sent successfully",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error sending emails:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to send email",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});

function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m: string) => map[m]);
}
