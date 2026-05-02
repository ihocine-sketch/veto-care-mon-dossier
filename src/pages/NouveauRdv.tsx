import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload } from "lucide-react";
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
      <main className="container mx-auto max-w-2xl px-4 py-10">
        <div className="mb-8">
          <h1 className="font-display text-4xl font-semibold">Nouveau rendez-vous</h1>
          <p className="mt-2 text-muted-foreground">Renseignez les informations de votre animal.</p>
        </div>

        <Card className="shadow-elegant border-border/60">
          <CardHeader>
            <CardTitle>Informations du rendez-vous</CardTitle>
            <CardDescription>Tous les champs sont obligatoires sauf le carnet de santé.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="nom_animal">Nom de l'animal</Label>
                  <Input id="nom_animal" value={nomAnimal} onChange={(e) => setNomAnimal(e.target.value)} placeholder="Médor" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="espece">Espèce</Label>
                  <Input id="espece" value={espece} onChange={(e) => setEspece(e.target.value)} placeholder="Chien, chat..." />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date_rdv">Date et heure du rendez-vous</Label>
                <Input id="date_rdv" type="datetime-local" value={dateRdv} onChange={(e) => setDateRdv(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label>Vétérinaire</Label>
                <Select value={vetId} onValueChange={setVetId}>
                  <SelectTrigger><SelectValue placeholder="Choisir un vétérinaire" /></SelectTrigger>
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
                <div className="flex items-center gap-3 rounded-lg border border-dashed border-border bg-secondary/40 p-4">
                  <Upload className="h-5 w-5 text-muted-foreground" />
                  <Input id="carnet" type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="border-0 bg-transparent p-0 file:text-primary" />
                </div>
                {file && <p className="text-xs text-muted-foreground">Sélectionné : {file.name}</p>}
              </div>

              <Button type="submit" disabled={submitting} className="w-full" size="lg">
                {submitting ? "Création en cours..." : "Créer le rendez-vous"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default NouveauRdv;
