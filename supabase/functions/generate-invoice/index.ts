// @ts-ignore: Deno runtime imports
import { serve } from "https://deno.land/std@0.201.0/http/server.ts";

declare const Deno: any;

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.");
}

serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { "Content-Type": "application/json" } });
  }

  const data = await req.json().catch(() => null);
  if (!data) {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), { status: 400, headers: { "Content-Type": "application/json" } });
  }

  const { appointmentId } = data as { appointmentId?: string };

  if (!appointmentId) {
    return new Response(JSON.stringify({ error: "Missing appointmentId" }), { status: 400, headers: { "Content-Type": "application/json" } });
  }

  const rdvResponse = await fetch(`${SUPABASE_URL}/rest/v1/rendez_vous?id=eq.${appointmentId}&select=*,veterinaires(nom,prenom,consultation_fee)`, {
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
    },
  });

  if (!rdvResponse.ok) {
    return new Response(JSON.stringify({ error: "Unable to fetch appointment" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }

  const appointments = await rdvResponse.json();
  const appointment = Array.isArray(appointments) ? appointments[0] : null;

  if (!appointment || appointment.payment_status !== "paid") {
    return new Response(JSON.stringify({ error: "Appointment not found or not paid" }), { status: 404, headers: { "Content-Type": "application/json" } });
  }

  const vet = appointment.veterinaires || {};
  const invoiceDate = new Date(appointment.payment_date);
  const formattedDate = invoiceDate.toLocaleString("fr-FR", { dateStyle: "long" });
  const appointmentDate = new Date(appointment.date_rdv).toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short" });

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Facture - Veto Care</title>
    <style>
        body { font-family: Arial, sans-serif; color: #1f2937; margin: 0; padding: 40px; background: #f8fafc; }
        .invoice-container { max-width: 900px; margin: 0 auto; background: #ffffff; padding: 40px; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
        .invoice-header { display: flex; justify-content: space-between; align-items: start; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 2px solid #e5e7eb; }
        .company-info h1 { margin: 0; font-size: 28px; color: #2563eb; }
        .company-info p { margin: 5px 0; color: #6b7280; font-size: 14px; }
        .invoice-title { text-align: right; }
        .invoice-title h2 { margin: 0 0 10px 0; font-size: 24px; }
        .invoice-title p { margin: 5px 0; color: #6b7280; font-size: 14px; }
        .invoice-details { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
        .details-section h3 { margin: 0 0 15px 0; font-size: 14px; font-weight: 600; text-transform: uppercase; color: #6b7280; letter-spacing: 0.5px; }
        .details-section p { margin: 8px 0; color: #1f2937; }
        .details-section .label { color: #6b7280; font-weight: 600; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
        table th { background: #f3f4f6; padding: 12px; text-align: left; font-weight: 600; color: #1f2937; border-bottom: 2px solid #e5e7eb; }
        table td { padding: 12px; border-bottom: 1px solid #e5e7eb; }
        table tr:last-child td { border-bottom: 2px solid #e5e7eb; }
        .totals { display: flex; justify-content: flex-end; margin-bottom: 40px; }
        .totals-table { width: 300px; }
        .totals-table .total-row { display: flex; justify-content: space-between; padding: 10px 0; font-weight: 600; font-size: 18px; color: #2563eb; border-top: 2px solid #2563eb; }
        .footer { text-align: center; color: #6b7280; font-size: 12px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
    </style>
</head>
<body>
    <div class="invoice-container">
        <div class="invoice-header">
            <div class="company-info">
                <h1>Veto Care</h1>
                <p>Plateforme de suivi vétérinaire</p>
                <p>contact@veto-care.com</p>
            </div>
            <div class="invoice-title">
                <h2>FACTURE</h2>
                <p><strong>Numéro:</strong> ${appointment.id.substring(0, 8).toUpperCase()}</p>
                <p><strong>Date:</strong> ${formattedDate}</p>
            </div>
        </div>

        <div class="invoice-details">
            <div class="details-section">
                <h3>Prestataire</h3>
                <p><strong>Dr. ${vet.prenom} ${vet.nom}</strong></p>
                <p>${vet.specialite || "Vétérinaire"}</p>
            </div>
            <div class="details-section">
                <h3>Animal suivi</h3>
                <p><strong>${appointment.nom_animal}</strong></p>
                <p>${appointment.espece}</p>
            </div>
        </div>

        <table>
            <thead>
                <tr>
                    <th>Description</th>
                    <th>Date du rendez-vous</th>
                    <th>Prix unitaire</th>
                    <th>Montant</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Consultation vétérinaire - ${appointment.motif}</td>
                    <td>${appointmentDate}</td>
                    <td>${vet.consultation_fee ? vet.consultation_fee.toFixed(2) : "50.00"}€</td>
                    <td>${vet.consultation_fee ? vet.consultation_fee.toFixed(2) : "50.00"}€</td>
                </tr>
            </tbody>
        </table>

        <div class="totals">
            <div class="totals-table">
                <div style="display: flex; justify-content: space-between; padding: 10px 0;">
                    <span>Sous-total</span>
                    <span>${vet.consultation_fee ? vet.consultation_fee.toFixed(2) : "50.00"}€</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 10px 0; color: #6b7280;">
                    <span>TVA</span>
                    <span>0.00€</span>
                </div>
                <div class="total-row">
                    <span>TOTAL</span>
                    <span>${vet.consultation_fee ? vet.consultation_fee.toFixed(2) : "50.00"}€</span>
                </div>
            </div>
        </div>

        <div class="footer">
            <p>Facture générée automatiquement par Veto Care. Merci de votre confiance.</p>
            <p>© 2026 Veto Care. Tous droits réservés.</p>
        </div>
    </div>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": `attachment; filename="facture_${appointment.id.substring(0, 8)}.html"`,
    },
  });
});
