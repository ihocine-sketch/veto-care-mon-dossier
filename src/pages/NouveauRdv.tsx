import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Sparkles, FileCheck, PawPrint } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

interface Vet { id: string; nom: string; prenom: string; specialite: string; }
interface AnimalOpt { id: string; nom: string; espece: string; }

const NouveauRdv = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [vets, setVets] = useState<Vet[]>([]);
  const [animaux, setAnimaux] = useState<AnimalOpt[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const [animalId, setAnimalId] = useState<string>(params.get("animal") || "manual");
  const [nomAnimal, setNomAnimal] = useState("");
  const [espece, setEspece] = useState("");
  const [dateRdv, setDateRdv] = useState("");
  const [vetId, setVetId] = useState("");
  const [motif, setMotif] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const rdvSchema = z.object({
    nom_animal: z.string().trim().min(1, t("appointmentsPage.validation.animalNameRequired")).max(80),
    espece: z.string().trim().min(1, t("appointmentsPage.validation.speciesRequired")).max(50),
    date_rdv: z.string().min(1, t("appointmentsPage.validation.dateRequired")),
    veterinaire_id: z.string().uuid(t("appointmentsPage.validation.vetRequired")),
    motif: z.string().trim().min(3, t("appointmentsPage.validation.reasonTooShort")).max(500),
  });

  useEffect(() => {
    supabase.from("veterinaires").select("*").order("nom").then(({ data }) => setVets(data || []));
    if (user) {
      supabase.from("animaux").select("id, nom, espece").eq("maitre_id", user.id).order("nom")
        .then(({ data }) => setAnimaux((data as AnimalOpt[]) || []));
    }
  }, [user]);

  useEffect(() => {
    if (animalId && animalId !== "manual") {
      const a = animaux.find((x) => x.id === animalId);
      if (a) { setNomAnimal(a.nom); setEspece(a.espece); }
    }
  }, [animalId, animaux]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const parsed = rdvSchema.safeParse({ nom_animal: nomAnimal, espece, date_rdv: dateRdv, veterinaire_id: vetId, motif });
    if (!parsed.success) { toast.error(parsed.error.errors[0].message); return; }

    setSubmitting(true);
    try {
      let carnetUrl: string | null = null;

      if (file) {
        if (file.size > 10 * 1024 * 1024) throw new Error(t("appointmentsPage.errors.fileTooLarge"));
        const ext = file.name.split(".").pop();
        const path = `${user.id}/${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage.from("carnets-sante").upload(path, file);
        if (upErr) throw upErr;
        const { data: pub } = supabase.storage.from("carnets-sante").getPublicUrl(path);
        carnetUrl = pub.publicUrl;
      }

      const { data: insertedRdv, error } = await supabase.from("rendez_vous").insert({
        maitre_id: user.id,
        veterinaire_id: parsed.data.veterinaire_id,
        animal_id: animalId && animalId !== "manual" ? animalId : null,
        nom_animal: parsed.data.nom_animal,
        espece: parsed.data.espece,
        date_rdv: new Date(parsed.data.date_rdv).toISOString(),
        motif: parsed.data.motif,
        carnet_sante_url: carnetUrl,
      }).select("id").single();
      if (error) throw error;

      const vet = vets.find((v) => v.id === parsed.data.veterinaire_id);
      if (user.email) {
        await supabase.functions.invoke("confirm-appointment", {
          body: JSON.stringify({
            email: user.email,
            nom_animal: parsed.data.nom_animal,
            espece: parsed.data.espece,
            date_rdv: new Date(parsed.data.date_rdv).toISOString(),
            motif: parsed.data.motif,
            veterinaire: vet ? `Dr. ${vet.prenom} ${vet.nom}` : t("appointmentsPage.vetNotSet"),
          }),
        });
      }

      toast.success(t("appointmentsPage.success.created"));
      navigate(`/payment?appointment=${insertedRdv.id}`);
    } catch (e: any) {
      toast.error(e.message || t("appointmentsPage.errors.create"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-soft">
      <Navbar />
      <PageTransition>
        <main className="container mx-auto max-w-2xl px-4 py-12">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-8">
            <p className="mb-2 inline-flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wider text-primary">
              <Sparkles className="h-3.5 w-3.5" /> {t("appointmentsPage.badge")}
            </p>
            <h1 className="font-display text-5xl font-semibold tracking-tight">{t("appointmentsPage.title")}</h1>
            <p className="mt-2 text-muted-foreground">{t("appointmentsPage.subtitle")}</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
            <Card className="border-border/60 bg-card/80 shadow-elegant backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="font-display text-2xl">{t("appointmentsPage.form.title")}</CardTitle>
                <CardDescription>{t("appointmentsPage.form.description")}</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-5">
                  {animaux.length > 0 && (
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1.5"><PawPrint className="h-3.5 w-3.5" /> {t("appointmentsPage.form.animal")}</Label>
                      <Select value={animalId} onValueChange={setAnimalId}>
                        <SelectTrigger className="h-11"><SelectValue placeholder={t("appointmentsPage.form.selectAnimal")} /></SelectTrigger>
                        <SelectContent>
                          {animaux.map((a) => (
                            <SelectItem key={a.id} value={a.id}>{a.nom} — {a.espece}</SelectItem>
                          ))}
                          <SelectItem value="manual">+ {t("appointmentsPage.form.manualEntry")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="nom_animal">{t("appointmentsPage.form.animalName")}</Label>
                      <Input id="nom_animal" value={nomAnimal} onChange={(e) => setNomAnimal(e.target.value)} placeholder={t("appointmentsPage.form.animalNamePlaceholder")} className="h-11" disabled={animalId !== "manual" && animalId !== ""} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="espece">{t("appointmentsPage.form.species")}</Label>
                      <Input id="espece" value={espece} onChange={(e) => setEspece(e.target.value)} placeholder={t("appointmentsPage.form.speciesPlaceholder")} className="h-11" disabled={animalId !== "manual" && animalId !== ""} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date_rdv">{t("appointmentsPage.form.datetime")}</Label>
                    <Input id="date_rdv" type="datetime-local" value={dateRdv} onChange={(e) => setDateRdv(e.target.value)} className="h-11" />
                  </div>

                  <div className="space-y-2">
                    <Label>{t("appointmentsPage.form.vet")}</Label>
                    <Select value={vetId} onValueChange={setVetId}>
                      <SelectTrigger className="h-11"><SelectValue placeholder={t("appointmentsPage.form.selectVet")} /></SelectTrigger>
                      <SelectContent>
                        {vets.map((v) => (
                          <SelectItem key={v.id} value={v.id}>Dr. {v.prenom} {v.nom} — {v.specialite}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="motif">{t("appointmentsPage.form.reason")}</Label>
                    <Textarea id="motif" value={motif} onChange={(e) => setMotif(e.target.value)} placeholder={t("appointmentsPage.form.reasonPlaceholder")} rows={4} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="carnet">{t("appointmentsPage.form.healthRecord")}</Label>
                    <label htmlFor="carnet" className="group flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed border-border bg-secondary/30 p-5 transition-all hover:border-primary hover:bg-accent/40">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-card shadow-soft transition-transform group-hover:scale-110">
                        {file ? <FileCheck className="h-5 w-5 text-success" /> : <Upload className="h-5 w-5 text-primary" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{file ? file.name : t("appointmentsPage.form.uploadClick")}</p>
                        <p className="text-xs text-muted-foreground">{t("appointmentsPage.form.uploadHint")}</p>
                      </div>
                      <Input id="carnet" type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="hidden" />
                    </label>
                  </div>

                  <Button type="submit" disabled={submitting} className="w-full shadow-soft transition-all hover:shadow-glow" size="lg">
                    {submitting ? t("appointmentsPage.form.submitting") : t("appointmentsPage.form.submit")}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </main>
        <Footer />
      </PageTransition>
    </div>
  );
};

export default NouveauRdv;
