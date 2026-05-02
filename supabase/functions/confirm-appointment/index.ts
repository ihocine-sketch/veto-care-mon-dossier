// @ts-ignore: Deno runtime imports
import { serve } from "https://deno.land/std@0.201.0/http/server.ts";

declare const Deno: any;

const SENDGRID_API_KEY = Deno.env.get("SENDGRID_API_KEY");
const SENDGRID_FROM_EMAIL = Deno.env.get("SENDGRID_FROM_EMAIL") || "no-reply@veto-care.com";
const SENDGRID_FROM_NAME = Deno.env.get("SENDGRID_FROM_NAME") || "Veto Care";

if (!SENDGRID_API_KEY) {
  throw new Error("Missing SENDGRID_API_KEY environment variable.");
}

const sendEmail = async (to: string, subject: string, html: string, text: string) => {
  const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SENDGRID_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      personalizations: [
        {
          to: [{ email: to }],
          subject,
        },
      ],
      from: {
        email: SENDGRID_FROM_EMAIL,
        name: SENDGRID_FROM_NAME,
      },
      content: [
        { type: "text/plain", value: text },
        { type: "text/html", value: html },
      ],
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`SendGrid error: ${response.status} ${errorBody}`);
  }
};

serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { "Content-Type": "application/json" } });
  }

  const data = await req.json().catch(() => null);
  if (!data) {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), { status: 400, headers: { "Content-Type": "application/json" } });
  }

  const { email, nom_animal, espece, date_rdv, motif, veterinaire } = data as {
    email?: string;
    nom_animal?: string;
    espece?: string;
    date_rdv?: string;
    motif?: string;
    veterinaire?: string;
  };

  if (!email || !nom_animal || !espece || !date_rdv || !motif || !veterinaire) {
    return new Response(JSON.stringify({ error: "Missing required appointment data" }), { status: 400, headers: { "Content-Type": "application/json" } });
  }

  const appointmentDate = new Date(date_rdv);
  const formattedDate = appointmentDate.toLocaleString("fr-FR", { dateStyle: "full", timeStyle: "short" });

  const subject = `Confirmation de rendez-vous pour ${nom_animal}`;
  const text = `Bonjour,

Votre rendez-vous a bien été pris en compte.

Animal: ${nom_animal} (${espece})
Date: ${formattedDate}
Vétérinaire: ${veterinaire}
Motif: ${motif}

Nous vous enverrons un rappel 24 heures avant la consultation.

Cordialement,
L'équipe Veto Care`;
  const html = `<!DOCTYPE html>
<html lang="fr">
  <body style="font-family: Arial, sans-serif; color: #1f2937; margin: 0; padding: 0; background: #f8fafc;">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 680px; margin: 0 auto; background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 60px rgba(15, 23, 42, 0.08);">
      <tr>
        <td style="padding: 32px; text-align: center; background: linear-gradient(135deg, #2563eb 0%, #0ea5e9 100%); color: #ffffff;">
          <h1 style="margin: 0; font-size: 24px;">Confirmation de rendez-vous</h1>
        </td>
      </tr>
      <tr>
        <td style="padding: 32px;">
          <p style="margin: 0 0 16px; font-size: 16px;">Bonjour,</p>
          <p style="margin: 0 0 24px; font-size: 16px; color: #475569;">Votre rendez-vous a bien été confirmé. Retrouvez ci-dessous les détails :</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
            <tr>
              <td style="padding: 12px 0; font-weight: 600; color: #0f172a;">Animal</td>
              <td style="padding: 12px 0; color: #475569;">${nom_animal} (${espece})</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; font-weight: 600; color: #0f172a;">Date</td>
              <td style="padding: 12px 0; color: #475569;">${formattedDate}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; font-weight: 600; color: #0f172a;">Vétérinaire</td>
              <td style="padding: 12px 0; color: #475569;">${veterinaire}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; font-weight: 600; color: #0f172a;">Motif</td>
              <td style="padding: 12px 0; color: #475569;">${motif}</td>
            </tr>
          </table>
          <p style="margin: 24px 0 0; font-size: 16px; color: #475569;">Nous vous enverrons un rappel 24 heures avant le rendez-vous.</p>
          <p style="margin: 24px 0 0; font-size: 16px; color: #475569;">Cordialement,<br />L'équipe Veto Care</p>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  try {
    await sendEmail(email, subject, html, text);
    return new Response(JSON.stringify({ status: "sent" }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Email send error:", error);
    return new Response(JSON.stringify({ error: "Unable to send confirmation email" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
});
