import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
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
import { ArrowLeft, Camera, Sparkles, PawPrint } from "lucide-react";
import { toast } from "sonner";

const schema = z.object({
  nom: z.string().trim().min(1, "Nom requis").max(80),
  espece: z.string().trim().min(1, "Espèce requise").max(50),
  race: z.string().trim().max(80).optional().or(z.literal("")),
  age: z.string().optional(),
  poids: z.string().optional(),
  allergies: z.string().trim().max(500).optional().or(z.literal("")),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
});

const AnimalForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const editing = Boolean(id);

  const [submitting, setSubmitting] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [form, setForm] = useState({
    nom: "", espece: "", race: "", age: "", poids: "", allergies: "", notes: "",
  });

  useEffect(() => {
    if (!editing || !user) return;
    supabase.from("animaux").select("*").eq("id", id).maybeSingle().then(({ data, error }) => {
      if (error) return toast.error(error.message);
      if (!data) return;
      setForm({
        nom: data.nom ?? "",
        espece: data.espece ?? "",
        race: data.race ?? "",
        age: data.age != null ? String(data.age) : "",
        poids: data.poids != null ? String(data.poids) : "",
        allergies: data.allergies ?? "",
        notes: data.notes ?? "",
      });
      setPhotoPreview(data.photo_url);
    });
  }, [id, editing, user]);

  const onPhoto = (file: File | null) => {
    setPhotoFile(file);
    if (file) setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const parsed = schema.safeParse(form);
    if (!parsed.success) return toast.error(parsed.error.errors[0].message);

    setSubmitting(true);
    try {
      let photo_url: string | null | undefined = undefined;
      if (photoFile) {
        if (photoFile.size > 5 * 1024 * 1024) throw new Error("Photo trop volumineuse (max 5 Mo)");
        const ext = photoFile.name.split(".").pop();
        const path = `${user.id}/${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage.from("photos-animaux").upload(path, photoFile);
        if (upErr) throw upErr;
        photo_url = supabase.storage.from("photos-animaux").getPublicUrl(path).data.publicUrl;
      }

      const payload: any = {
        maitre_id: user.id,
        nom: parsed.data.nom,
        espece: parsed.data.espece,
        race: parsed.data.race || null,
        age: parsed.data.age ? Number(parsed.data.age) : null,
        poids: parsed.data.poids ? Number(parsed.data.poids) : null,
        allergies: parsed.data.allergies || null,
        notes: parsed.data.notes || null,
      };
      if (photo_url !== undefined) payload.photo_url = photo_url;

      if (editing) {
        const { error } = await supabase.from("animaux").update(payload).eq("id", id!);
        if (error) throw error;
        toast.success("Profil mis à jour");
        navigate(`/animaux/${id}`);
      } else {
        const { data, error } = await supabase.from("animaux").insert(payload).select("id").single();
        if (error) throw error;
        toast.success("Animal ajouté !");
        navigate(`/animaux/${data.id}`);
      }
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de l'enregistrement");
    } finally {
      setSubmitting(false);
    }
  };

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div className="min-h-screen bg-gradient-soft">
      <Navbar />
      <PageTransition>
        <main className="container mx-auto max-w-2xl px-4 py-12">
          <Link to={editing ? `/animaux/${id}` : "/animaux"} className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary">
            <ArrowLeft className="h-4 w-4" /> Retour
          </Link>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-8">
            <p className="mb-2 inline-flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wider text-primary">
              <Sparkles className="h-3.5 w-3.5" /> {editing ? "Modifier le profil" : "Nouveau profil"}
            </p>
            <h1 className="font-display text-5xl font-semibold tracking-tight">
              {editing ? "Modifier l'animal" : "Ajouter un animal"}
            </h1>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
            <Card className="border-border/60 bg-card/80 shadow-elegant backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="font-display text-2xl">Profil de l'animal</CardTitle>
                <CardDescription>Renseignez les informations de votre compagnon.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="flex justify-center">
                    <label htmlFor="photo" className="group relative cursor-pointer">
                      <div className="relative h-32 w-32 overflow-hidden rounded-3xl bg-gradient-to-br from-accent to-secondary shadow-soft ring-4 ring-background transition-transform group-hover:scale-105">
                        {photoPreview ? (
                          <img src={photoPreview} alt="Aperçu" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <PawPrint className="h-12 w-12 text-primary/50" />
                          </div>
                        )}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                          <Camera className="h-7 w-7 text-white" />
                        </div>
                      </div>
                      <Input id="photo" type="file" accept="image/*" className="hidden" onChange={(e) => onPhoto(e.target.files?.[0] ?? null)} />
                    </label>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="nom">Nom</Label>
                      <Input id="nom" value={form.nom} onChange={set("nom")} placeholder="Médor" className="h-11" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="espece">Espèce</Label>
                      <Input id="espece" value={form.espece} onChange={set("espece")} placeholder="Chien, chat..." className="h-11" />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="race">Race</Label>
                      <Input id="race" value={form.race} onChange={set("race")} placeholder="Labrador" className="h-11" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="age">Âge (années)</Label>
                      <Input id="age" type="number" min="0" max="60" value={form.age} onChange={set("age")} placeholder="3" className="h-11" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="poids">Poids (kg)</Label>
                      <Input id="poids" type="number" min="0" step="0.1" value={form.poids} onChange={set("poids")} placeholder="12.5" className="h-11" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="allergies">Allergies</Label>
                    <Textarea id="allergies" value={form.allergies} onChange={set("allergies")} placeholder="Pollen, certains aliments..." rows={2} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea id="notes" value={form.notes} onChange={set("notes")} placeholder="Caractère, habitudes, conditions particulières..." rows={4} />
                  </div>

                  <Button type="submit" disabled={submitting} className="w-full shadow-soft transition-all hover:shadow-glow" size="lg">
                    {submitting ? "Enregistrement..." : editing ? "Enregistrer" : "Créer le profil"}
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

export default AnimalForm;
