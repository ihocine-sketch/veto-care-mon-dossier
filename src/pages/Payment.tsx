import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, AlertCircle, CheckCircle2, Clock, CreditCard, Lock } from "lucide-react";
import { toast } from "sonner";

interface PaymentDetails {
  appointmentId: string;
  animalName: string;
  vetName: string;
  appointmentDate: string;
  consultationFee: number;
  status: string;
}

const Payment = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [cardName, setCardName] = useState("");
  const [processing, setProcessing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "processing" | "success" | "error">("pending");

  const appointmentId = params.get("appointment");

  useEffect(() => {
    if (!appointmentId || !user) {
      navigate("/dashboard");
      return;
    }

    const fetchPaymentDetails = async () => {
      const { data: rdv, error: rdvError } = await supabase
        .from("rendez_vous")
        .select("*, veterinaires(nom, prenom, consultation_fee)")
        .eq("id", appointmentId)
        .single();

      if (rdvError || !rdv) {
        toast.error("Rendez-vous introuvable");
        navigate("/dashboard");
        return;
      }

      const vet = (rdv as any).veterinaires;
      const fee = vet?.consultation_fee || 50;

      setPaymentDetails({
        appointmentId: rdv.id,
        animalName: rdv.nom_animal,
        vetName: vet ? `Dr. ${vet.prenom} ${vet.nom}` : "Vétérinaire",
        appointmentDate: new Date(rdv.date_rdv).toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short" }),
        consultationFee: fee,
        status: rdv.payment_status,
      });

      if (rdv.payment_status === "paid") {
        setPaymentStatus("success");
      }

      setLoading(false);
    };

    fetchPaymentDetails();
  }, [appointmentId, user, navigate]);

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const parts = [];
    for (let i = 0; i < v.length; i += 4) {
      parts.push(v.substring(i, i + 4));
    }
    return parts.join(" ");
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\D/g, "");
    if (v.length >= 2) {
      return v.slice(0, 2) + "/" + v.slice(2, 4);
    }
    return v;
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentDetails || !user) return;

    if (cardNumber.replace(/\s/g, "").length !== 16) {
      toast.error("Numéro de carte invalide");
      return;
    }
    if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) {
      toast.error("Date d'expiration invalide (MM/YY)");
      return;
    }
    if (cardCvc.length !== 3) {
      toast.error("CVC invalide");
      return;
    }
    if (!cardName.trim()) {
      toast.error("Nom du titulaire requis");
      return;
    }

    setProcessing(true);
    setPaymentStatus("processing");

    try {
      // Simulate payment processing (in production, use Stripe API)
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Update appointment payment status
      const { error: updateError } = await supabase
        .from("rendez_vous")
        .update({
          payment_status: "paid",
          payment_amount: paymentDetails.consultationFee,
          payment_date: new Date().toISOString(),
          payment_method: "card",
          stripe_payment_id: `sim_${Date.now()}`,
        })
        .eq("id", paymentDetails.appointmentId);

      if (updateError) throw updateError;

      // Create payment record
      await supabase.from("payments").insert({
        appointment_id: paymentDetails.appointmentId,
        maitre_id: user.id,
        amount: paymentDetails.consultationFee,
        status: "completed",
        payment_method: "card",
        stripe_payment_intent_id: `sim_${Date.now()}`,
      });

      setPaymentStatus("success");
      toast.success("Paiement effectué avec succès !");

      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (error: any) {
      console.error("Payment error:", error);
      setPaymentStatus("error");
      toast.error("Erreur lors du paiement: " + (error.message || "Veuillez réessayer"));
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-soft">
        <Navbar />
        <main className="container mx-auto px-4 py-12">
          <div className="h-96 animate-pulse rounded-3xl bg-card/60" />
        </main>
      </div>
    );
  }

  if (!paymentDetails) {
    return (
      <div className="min-h-screen bg-gradient-soft">
        <Navbar />
        <main className="container mx-auto px-4 py-20 text-center">
          <h1 className="font-display text-3xl">Paiement introuvable</h1>
          <Button asChild className="mt-6">
            <a href="/dashboard">Retour</a>
          </Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-soft">
      <Navbar />
      <PageTransition>
        <main className="container mx-auto max-w-2xl px-4 py-12">
          <Button variant="ghost" className="mb-6 gap-2" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-4 w-4" /> Retour
          </Button>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-8">
            <h1 className="font-display text-4xl font-semibold tracking-tight">Paiement de la consultation</h1>
            <p className="mt-2 text-muted-foreground">Finalisez votre rendez-vous en effectuant le paiement</p>
          </motion.div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Payment Form */}
            <div className="lg:col-span-2">
              <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
                <Card className="border-border/60 shadow-elegant">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" /> Informations de paiement
                    </CardTitle>
                    <CardDescription>Entrez vos informations de carte bancaire</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {paymentStatus === "success" ? (
                      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center gap-4 rounded-2xl bg-success/10 p-8 text-center">
                        <CheckCircle2 className="h-16 w-16 text-success" />
                        <div>
                          <h3 className="font-display text-2xl font-semibold text-success">Paiement réussi !</h3>
                          <p className="mt-2 text-sm text-muted-foreground">Vous serez redirigé vers votre tableau de bord dans quelques secondes.</p>
                        </div>
                      </motion.div>
                    ) : paymentStatus === "error" ? (
                      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col gap-4 rounded-2xl bg-destructive/10 p-6">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="mt-1 h-5 w-5 text-destructive" />
                          <div>
                            <h3 className="font-semibold text-destructive">Le paiement a échoué</h3>
                            <p className="mt-1 text-sm text-muted-foreground">Veuillez vérifier vos informations et réessayer.</p>
                          </div>
                        </div>
                        <Button onClick={() => setPaymentStatus("pending")} variant="outline" className="w-full">
                          Réessayer
                        </Button>
                      </motion.div>
                    ) : (
                      <form onSubmit={handlePayment} className="space-y-5">
                        <div className="space-y-2">
                          <Label htmlFor="cardName">Nom du titulaire</Label>
                          <Input
                            id="cardName"
                            value={cardName}
                            onChange={(e) => setCardName(e.target.value)}
                            placeholder="Jean Dupont"
                            className="h-11"
                            disabled={processing}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="cardNumber">Numéro de carte</Label>
                          <Input
                            id="cardNumber"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                            placeholder="1234 5678 9012 3456"
                            className="h-11 font-mono"
                            disabled={processing}
                            maxLength="19"
                          />
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="cardExpiry">Date d'expiration</Label>
                            <Input
                              id="cardExpiry"
                              value={cardExpiry}
                              onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                              placeholder="MM/YY"
                              className="h-11 font-mono"
                              disabled={processing}
                              maxLength="5"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="cardCvc">CVC</Label>
                            <Input
                              id="cardCvc"
                              value={cardCvc}
                              onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, ""))}
                              placeholder="123"
                              className="h-11 font-mono"
                              disabled={processing}
                              maxLength="3"
                            />
                          </div>
                        </div>

                        <div className="rounded-2xl border border-border/60 bg-background/80 p-4 text-xs text-muted-foreground">
                          <div className="flex items-start gap-2">
                            <Lock className="mt-0.5 h-4 w-4 shrink-0" />
                            <p>Votre paiement est sécurisé. Cette démonstration simule un paiement. En production, utilisez Stripe.</p>
                          </div>
                        </div>

                        <Button type="submit" disabled={processing} className="w-full shadow-soft transition-all hover:shadow-glow" size="lg">
                          {processing ? "Traitement..." : `Payer ${paymentDetails.consultationFee.toFixed(2)}€`}
                        </Button>
                      </form>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Order Summary */}
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
              <Card className="sticky top-4 border-border/60 shadow-soft">
                <CardHeader>
                  <CardTitle className="text-lg">Résumé</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3 rounded-2xl bg-background/80 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium">{paymentDetails.animalName}</p>
                        <p className="text-xs text-muted-foreground">{paymentDetails.vetName}</p>
                      </div>
                      <Badge variant="secondary" className="shrink-0">
                        Consultation
                      </Badge>
                    </div>
                    <div className="border-t border-border pt-3 text-xs text-muted-foreground">
                      <p>{paymentDetails.appointmentDate}</p>
                    </div>
                  </div>

                  <div className="space-y-2 border-t border-border pt-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Montant</span>
                      <span className="font-medium">{paymentDetails.consultationFee.toFixed(2)}€</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Taxe</span>
                      <span className="font-medium">0.00€</span>
                    </div>
                  </div>

                  <div className="flex justify-between rounded-2xl bg-primary/10 p-4 text-lg font-semibold">
                    <span>Total</span>
                    <span className="text-primary">{paymentDetails.consultationFee.toFixed(2)}€</span>
                  </div>

                  <div className="flex items-center gap-2 rounded-2xl bg-info/10 p-3 text-xs text-info">
                    <Clock className="h-4 w-4" />
                    <span>Paiement requis avant la consultation</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </main>
        <Footer />
      </PageTransition>
    </div>
  );
};

export default Payment;
