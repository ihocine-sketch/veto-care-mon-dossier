// This edge function is intended to be scheduled in Supabase.
// Example: supabase functions deploy send-appointment-reminders --schedule "0 * * * *"

// @ts-ignore: Deno runtime imports
import { serve } from "https://deno.land/std@0.201.0/http/server.ts";

declare const Deno: any;

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const SENDGRID_API_KEY = Deno.env.get("SENDGRID_API_KEY");
const SENDGRID_FROM_EMAIL = Deno.env.get("SENDGRID_FROM_EMAIL") || "no-reply@veto-care.com";
const SENDGRID_FROM_NAME = Deno.env.get("SENDGRID_FROM_NAME") || "Veto Care";

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.");
}

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
      personalizations: [{ to: [{ email: to }], subject }],
      from: { email: SENDGRID_FROM_EMAIL, name: SENDGRID_FROM_NAME },
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

const buildEmail = (animal: string, date: string, veterinaire: string, motif: string) => {
  const appointmentDate = new Date(date);
  const formattedDate = appointmentDate.toLocaleString("fr-FR", { dateStyle: "full", timeStyle: "short" });
  const subject = `Rappel de rendez-vous pour ${animal}`;
  const text = `Bonjour,\n\nCeci est un rappel pour votre rendez-vous prévu dans 24 heures.\n\nAnimal: ${animal}\nDate: ${formattedDate}\nVétérinaire: ${veterinaire}\nMotif: ${motif}\n\nNous vous recommandons d'arriver quelques minutes en avance.\n\nCordialement,\nL'équipe Veto Care`;
  const html = `<!DOCTYPE html>
<html lang="fr">
  <body style="font-family: Arial, sans-serif; background: #f8fafc; margin: 0; padding: 0; color: #1f2937;">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 680px; margin: 0 auto;">
      <tr>
        <td style="padding: 32px; background: linear-gradient(135deg, #2563eb 0%, #0ea5e9 100%); text-align: center; color: #ffffff; border-radius: 24px 24px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">Rappel de rendez-vous</h1>
        </td>
      </tr>
      <tr>
        <td style="background: #ffffff; padding: 32px; border-radius: 0 0 24px 24px; box-shadow: 0 20px 60px rgba(15, 23, 42, 0.08);">
          <p style="margin: 0 0 24px; font-size: 16px;">Bonjour,</p>
          <p style="margin: 0 0 24px; color: #475569;">Ceci est un rappel pour votre rendez-vous dans les prochaines 24 heures. Voici les détails :</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
            <tr><td style="padding: 10px 0; font-weight: 600;">Animal</td><td style="padding: 10px 0;">${animal}</td></tr>
            <tr><td style="padding: 10px 0; font-weight: 600;">Date</td><td style="padding: 10px 0;">${formattedDate}</td></tr>
            <tr><td style="padding: 10px 0; font-weight: 600;">Vétérinaire</td><td style="padding: 10px 0;">${veterinaire}</td></tr>
            <tr><td style="padding: 10px 0; font-weight: 600;">Motif</td><td style="padding: 10px 0;">${motif}</td></tr>
          </table>
          <p style="margin: 24px 0 0; color: #475569;">Nous vous conseillons d'arriver un peu en avance et de préparer les éléments nécessaires.</p>
          <p style="margin: 24px 0 0; color: #475569;">Cordialement,<br/>L'équipe Veto Care</p>
        </td>
      </tr>
    </table>
  </body>
</html>`;
  return { subject, text, html };
};

serve(async (req: Request) => {
  if (req.method !== "GET" && req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { "Content-Type": "application/json" } });
  }

  const now = new Date();
  const start = new Date(now.getTime() + 23.5 * 60 * 60 * 1000).toISOString();
  const end = new Date(now.getTime() + 24.5 * 60 * 60 * 1000).toISOString();

  const query = new URLSearchParams();
  query.append("select", "*");
  query.append("date_rdv", `gte.${start}`);
  query.append("date_rdv", `lt.${end}`);
  query.append("reminder_sent_at", "is.null");
  query.append("statut", "neq.annule");
  query.append("order", "date_rdv.asc");

  const listResponse = await fetch(`${SUPABASE_URL}/rest/v1/rendez_vous?${query.toString()}`, {
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
    },
  });

  if (!listResponse.ok) {
    const errorText = await listResponse.text();
    console.error("Failed to fetch upcoming appointments:", errorText);
    return new Response(JSON.stringify({ error: "Unable to query appointments" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }

  const appointments = await listResponse.json();
  const results: Array<{ id: string; sent: boolean; error?: string }> = [];

  for (const appointment of appointments) {
    try {
      const maitreId = appointment.maitre_id;
      const usersResponse = await fetch(`${SUPABASE_URL}/rest/v1/auth.users?select=email&id=eq.${maitreId}`, {
        headers: {
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          "Content-Type": "application/json",
        },
      });

      if (!usersResponse.ok) {
        const errorText = await usersResponse.text();
        throw new Error(`Unable to fetch user email: ${errorText}`);
      }

      const users = await usersResponse.json();
      const user = Array.isArray(users) ? users[0] : null;
      if (!user?.email) {
        throw new Error("No email found for appointment owner.");
      }

      let veterinaireLabel = "Vétérinaire non défini";
      if (appointment.veterinaire_id) {
        const vetResponse = await fetch(`${SUPABASE_URL}/rest/v1/veterinaires?select=nom,prenom&id=eq.${appointment.veterinaire_id}`, {
          headers: {
            apikey: SUPABASE_SERVICE_ROLE_KEY,
            Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            "Content-Type": "application/json",
          },
        });
        if (vetResponse.ok) {
          const vetData = await vetResponse.json();
          const vet = Array.isArray(vetData) ? vetData[0] : null;
          if (vet?.nom && vet?.prenom) {
            veterinaireLabel = `Dr. ${vet.prenom} ${vet.nom}`;
          }
        }
      }

      const { subject, text, html } = buildEmail(appointment.nom_animal, appointment.date_rdv, veterinaireLabel, appointment.motif);
      await sendEmail(user.email, subject, html, text);

      const updateResponse = await fetch(`${SUPABASE_URL}/rest/v1/rendez_vous?id=eq.${appointment.id}`, {
        method: "PATCH",
        headers: {
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify({ reminder_sent_at: new Date().toISOString() }),
      });

      if (!updateResponse.ok) {
        const errorText = await updateResponse.text();
        throw new Error(`Unable to update appointment reminder state: ${errorText}`);
      }

      results.push({ id: appointment.id, sent: true });
    } catch (error) {
      console.error("Reminder error for appointment", appointment.id, error);
      results.push({ id: appointment.id, sent: false, error: String(error) });
    }
  }

  return new Response(JSON.stringify({ results, count: results.length }), { status: 200, headers: { "Content-Type": "application/json" } });
});
