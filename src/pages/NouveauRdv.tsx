import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { Upload, Sparkles, FileCheck } from "lucide-react";
import { toast } from "sonner";

const rdvSchema = z.object({
  nom_animal: z.string().trim().min(1, "Nom de l'animal requis").max(80),
  espece: z.string().trim().min(1, "Espèce requise").max(50),
  date_rdv: z.string().min(1, "Date requise"),
  veterinaire_id: z.string().uuid("Vétérinaire requis"),
  motif: z.string().trim().min(3, "Motif trop court").max(500),
});

interface Vet { id: string; nom: string; prenom: string; specialite: string; }

const NouveauRdv = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [vets, setVets] = useState<Vet[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const [nomAnimal, setNomAnimal] = useState("");
  const [espece, setEspece] = useState("");
  const [dateRdv, setDateRdv] = useState("");
  const [vetId, setVetId] = useState("");
  const [motif, setMotif] = useState("");
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    supabase.from("veterinaires").select("*").order("nom").then(({ data }) => setVets(data || []));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const parsed = rdvSchema.safeParse({ nom_animal: nomAnimal, espece, date_rdv: dateRdv, veterinaire_id: vetId, motif });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }

    setSubmitting(true);
    try {
      let carnetUrl: string | null = null;

      if (file) {
        if (file.size > 10 * 1024 * 1024) throw new Error("Fichier trop volumineux (max 10 Mo)");
        const ext = file.name.split(".").pop();
        const path = `${user.id}/${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage.from("carnets-sante").upload(path, file);
        if (upErr) throw upErr;
        const { data: pub } = supabase.storage.from("carnets-sante").getPublicUrl(path);
        carnetUrl = pub.publicUrl;
      }

      const { error } = await supabase.from("rendez_vous").insert({
        maitre_id: user.id,
        veterinaire_id: parsed.data.veterinaire_id,
        nom_animal: parsed.data.nom_animal,
        espece: parsed.data.espece,
        date_rdv: new Date(parsed.data.date_rdv).toISOString(),
        motif: parsed.data.motif,
        carnet_sante_url: carnetUrl,
      });
      if (error) throw error;

      toast.success("Rendez-vous créé avec succès !");
      navigate("/dashboard");
    } catch (e: any) {
      toast.error(e.message || "Erreur lors de la création");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-soft">
      <Navbar />
      <PageTransition>
        <main className="container mx-auto max-w-2xl px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <p className="mb-2 inline-flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wider text-primary">
              <Sparkles className="h-3.5 w-3.5" /> Prendre rendez-vous
            </p>
            <h1 className="font-display text-5xl font-semibold tracking-tight">Nouveau rendez-vous</h1>
            <p className="mt-2 text-muted-foreground">Renseignez les informations de votre animal.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="border-border/60 bg-card/80 shadow-elegant backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="font-display text-2xl">Informations du rendez-vous</CardTitle>
                <CardDescription>Tous les champs sont obligatoires sauf le carnet de santé.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="nom_animal">Nom de l'animal</Label>
                      <Input id="nom_animal" value={nomAnimal} onChange={(e) => setNomAnimal(e.target.value)} placeholder="Médor" className="h-11 transition-all focus:scale-[1.01]" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="espece">Espèce</Label>
                      <Input id="espece" value={espece} onChange={(e) => setEspece(e.target.value)} placeholder="Chien, chat..." className="h-11 transition-all focus:scale-[1.01]" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date_rdv">Date et heure du rendez-vous</Label>
                    <Input id="date_rdv" type="datetime-local" value={dateRdv} onChange={(e) => setDateRdv(e.target.value)} className="h-11" />
                  </div>

                  <div className="space-y-2">
                    <Label>Vétérinaire</Label>
                    <Select value={vetId} onValueChange={setVetId}>
                      <SelectTrigger className="h-11"><SelectValue placeholder="Choisir un vétérinaire" /></SelectTrigger>
                      <SelectContent>
                        {vets.map((v) => (
                          <SelectItem key={v.id} value={v.id}>
                            Dr. {v.prenom} {v.nom} — {v.specialite}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="motif">Motif</Label>
                    <Textarea id="motif" value={motif} onChange={(e) => setMotif(e.target.value)} placeholder="Décrivez la raison du rendez-vous..." rows={4} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="carnet">Carnet de santé (optionnel)</Label>
                    <label
                      htmlFor="carnet"
                      className="group flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed border-border bg-secondary/30 p-5 transition-all hover:border-primary hover:bg-accent/40"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-card shadow-soft transition-transform group-hover:scale-110">
                        {file ? <FileCheck className="h-5 w-5 text-success" /> : <Upload className="h-5 w-5 text-primary" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">
                          {file ? file.name : "Cliquez pour téléverser"}
                        </p>
                        <p className="text-xs text-muted-foreground">PDF, JPG ou PNG · max 10 Mo</p>
                      </div>
                      <Input id="carnet" type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="hidden" />
                    </label>
                  </div>

                  <Button type="submit" disabled={submitting} className="w-full shadow-soft transition-all hover:shadow-glow" size="lg">
                    {submitting ? "Création en cours..." : "Créer le rendez-vous"}
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
