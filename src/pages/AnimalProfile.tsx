import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft, PawPrint, Pencil, Trash2, Calendar, FileText, Stethoscope,
  Cake, Weight, AlertTriangle, NotebookPen, Plus, Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

interface Animal {
  id: string;
  nom: string;
  espece: string;
  race: string | null;
  age: number | null;
  poids: number | null;
  allergies: string | null;
  notes: string | null;
  photo_url: string | null;
  created_at: string;
}

interface Rdv {
  id: string;
  date_rdv: string;
  motif: string;
  statut: string;
  carnet_sante_url: string | null;
  veterinaires: { nom: string; prenom: string; specialite: string } | null;
}

const statutClass: Record<string, string> = {
  en_attente: "bg-warning/15 text-warning border-warning/30",
  confirme: "bg-success/15 text-success border-success/30",
  "confirmé": "bg-success/15 text-success border-success/30",
  annule: "bg-destructive/15 text-destructive border-destructive/30",
  "annulé": "bg-destructive/15 text-destructive border-destructive/30",
};

const AnimalProfile = () => {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [rdvs, setRdvs] = useState<Rdv[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || !user) return;
    (async () => {
      const { data: a, error: e1 } = await supabase.from("animaux").select("*").eq("id", id).maybeSingle();
      if (e1) toast.error(e1.message);
      setAnimal((a as Animal) || null);

      const { data: r, error: e2 } = await supabase
        .from("rendez_vous")
        .select("id, date_rdv, motif, statut, carnet_sante_url, veterinaires(nom, prenom, specialite)")
        .eq("animal_id", id)
        .order("date_rdv", { ascending: false });
      if (e2) toast.error(e2.message);
      setRdvs((r as any) || []);
      setLoading(false);
    })();
  }, [id, user]);

  const handleDelete = async () => {
    if (!id) return;
    const { error } = await supabase.from("animaux").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(t("animalProfilePage.success.deleted"));
    navigate("/animaux");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-soft">
        <Navbar />
        <main className="container mx-auto px-4 py-12">
          <div className="h-64 animate-pulse rounded-3xl bg-card/60" />
        </main>
      </div>
    );
  }

  if (!animal) {
    return (
      <div className="min-h-screen bg-gradient-soft">
        <Navbar />
        <main className="container mx-auto px-4 py-20 text-center">
          <h1 className="font-display text-3xl">{t("animalProfilePage.notFound")}</h1>
          <Button asChild className="mt-6"><Link to="/animaux">{t("animalProfilePage.back")}</Link></Button>
        </main>
      </div>
    );
  }

  const now = Date.now();
  const upcoming = rdvs.filter((r) => new Date(r.date_rdv).getTime() >= now);
  const past = rdvs.filter((r) => new Date(r.date_rdv).getTime() < now);

  const stats = [
    { icon: Cake, label: t("animalProfilePage.stats.age"), value: animal.age != null ? `${animal.age} ${t("animalProfilePage.stats.years", { count: animal.age })}` : "—" },
    { icon: Weight, label: t("animalProfilePage.stats.weight"), value: animal.poids != null ? `${animal.poids} kg` : "—" },
    { icon: Stethoscope, label: t("animalProfilePage.stats.visits"), value: String(rdvs.length) },
    { icon: Calendar, label: t("animalProfilePage.stats.upcoming"), value: String(upcoming.length) },
  ];

  return (
    <div className="min-h-screen bg-gradient-soft">
      <Navbar />
      <PageTransition>
        <main className="container mx-auto px-4 py-10">
          <Link to="/animaux" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary">
            <ArrowLeft className="h-4 w-4" /> {t("animalProfilePage.myAnimals")}
          </Link>

          {/* Hero card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative overflow-hidden rounded-3xl border border-border/60 bg-card/80 shadow-elegant backdrop-blur-xl"
          >
            <div className="absolute inset-0 bg-gradient-primary opacity-10" />
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/30 blur-3xl" />
            <div className="relative flex flex-col items-start gap-6 p-6 sm:flex-row sm:items-center sm:p-8">
              <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-3xl bg-gradient-to-br from-accent to-secondary shadow-elegant ring-4 ring-background sm:h-40 sm:w-40">
                {animal.photo_url ? (
                  <img src={animal.photo_url} alt={animal.nom} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <PawPrint className="h-16 w-16 text-primary/50" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p className="mb-1 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
                  <Sparkles className="h-3 w-3" /> {t("animalProfilePage.profile")}
                </p>
                <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">{animal.nom}</h1>
                <p className="mt-1 text-muted-foreground">
                  {animal.espece}{animal.race ? ` · ${animal.race}` : ""}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button asChild size="sm" variant="secondary" className="gap-1.5">
                    <Link to={`/animaux/${animal.id}/edit`}><Pencil className="h-3.5 w-3.5" /> {t("animalProfilePage.edit")}</Link>
                  </Button>
                  <Button asChild size="sm" className="gap-1.5">
                    <Link to="/nouveau-rdv"><Plus className="h-3.5 w-3.5" /> {t("animalProfilePage.newAppointment")}</Link>
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="ghost" className="gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive">
                        <Trash2 className="h-3.5 w-3.5" /> {t("animalProfilePage.delete")}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{t("animalProfilePage.deleteTitle")}</AlertDialogTitle>
                        <AlertDialogDescription>
                          {t("animalProfilePage.deleteDescription")}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{t("animalProfilePage.cancel")}</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">{t("animalProfilePage.delete")}</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="relative grid grid-cols-2 gap-px border-t border-border/60 bg-border/60 sm:grid-cols-4">
              {stats.map((s) => (
                <div key={s.label} className="flex items-center gap-3 bg-card/80 p-5 backdrop-blur">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent">
                    <s.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</p>
                    <p className="font-display text-lg font-semibold">{s.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            {/* Info column */}
            <div className="space-y-4 lg:col-span-1">
              <Card className="border-border/60 shadow-card">
                <CardContent className="space-y-4 p-6">
                  <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-primary">
                    <AlertTriangle className="h-4 w-4" /> {t("animalProfilePage.allergies")}
                  </div>
                  <p className="text-sm text-foreground/80">
                    {animal.allergies || <span className="italic text-muted-foreground">{t("animalProfilePage.noAllergies")}</span>}
                  </p>
                </CardContent>
              </Card>
              <Card className="border-border/60 shadow-card">
                <CardContent className="space-y-4 p-6">
                  <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-primary">
                    <NotebookPen className="h-4 w-4" /> {t("animalProfilePage.notes")}
                  </div>
                  <p className="whitespace-pre-line text-sm text-foreground/80">
                    {animal.notes || <span className="italic text-muted-foreground">{t("animalProfilePage.noNotes")}</span>}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Timeline */}
            <div className="lg:col-span-2">
              <Card className="border-border/60 shadow-card">
                <CardContent className="p-6 sm:p-8">
                  <div className="mb-6 flex items-center justify-between">
                    <div>
                      <h2 className="font-display text-2xl font-semibold">{t("animalProfilePage.medicalHistory")}</h2>
                      <p className="text-sm text-muted-foreground">{t("animalProfilePage.allAppointments", { name: animal.nom })}</p>
                    </div>
                    <Button asChild size="sm" variant="outline" className="gap-1.5">
                      <Link to="/nouveau-rdv"><Plus className="h-3.5 w-3.5" /> {t("animalProfilePage.add")}</Link>
                    </Button>
                  </div>

                  {rdvs.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-secondary/20 py-12 text-center">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent">
                        <Calendar className="h-6 w-6 text-primary" />
                      </div>
                      <p className="text-sm text-muted-foreground">{t("animalProfilePage.noAppointments")}</p>
                      <Button asChild size="sm"><Link to="/nouveau-rdv">{t("animalProfilePage.createAppointment")}</Link></Button>
                    </div>
                  ) : (
                    <div className="relative">
                      <div className="absolute bottom-2 left-[19px] top-2 w-px bg-gradient-to-b from-primary/40 via-border to-transparent" />
                      <ol className="space-y-5">
                        {rdvs.map((r, idx) => {
                          const stClass = statutClass[r.statut] || statutClass.en_attente;
                          const stLabel = r.statut.includes("confirm")
                            ? t("animalProfilePage.status.confirmed")
                            : r.statut.includes("annul")
                              ? t("animalProfilePage.status.cancelled")
                              : t("animalProfilePage.status.pending");
                          const date = new Date(r.date_rdv);
                          const isFuture = date.getTime() >= now;
                          return (
                            <motion.li
                              key={r.id}
                              initial={{ opacity: 0, x: -12 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.35, delay: idx * 0.05 }}
                              className="relative pl-12"
                            >
                              <div className={`absolute left-0 top-1 flex h-10 w-10 items-center justify-center rounded-full ring-4 ring-card ${isFuture ? "bg-gradient-primary text-primary-foreground" : "bg-accent text-primary"}`}>
                                <Stethoscope className="h-5 w-5" />
                              </div>
                              <div className="rounded-2xl border border-border/60 bg-background/60 p-4 transition-all hover:border-primary/40 hover:shadow-soft">
                                <div className="flex flex-wrap items-start justify-between gap-2">
                                  <div>
                                    <p className="text-xs uppercase tracking-wider text-muted-foreground">
                                      {date.toLocaleString(i18n.language === "ar" ? "ar-DZ" : i18n.language === "en" ? "en-US" : "fr-FR", { dateStyle: "long", timeStyle: "short" })}
                                    </p>
                                    <h3 className="mt-0.5 font-display text-lg font-semibold">{r.motif}</h3>
                                    <p className="mt-0.5 text-sm text-muted-foreground">
                                      {r.veterinaires
                                        ? `Dr. ${r.veterinaires.prenom} ${r.veterinaires.nom} — ${r.veterinaires.specialite}`
                                        : t("animalProfilePage.notSet")}
                                    </p>
                                  </div>
                                  <Badge variant="outline" className={stClass}>{stLabel}</Badge>
                                </div>
                                {r.carnet_sante_url && (
                                  <Button
                                    variant="ghost" size="sm"
                                    className="mt-2 h-7 gap-1.5 px-2 text-xs"
                                    onClick={() => window.open(r.carnet_sante_url!, "_blank")}
                                  >
                                    <FileText className="h-3.5 w-3.5" /> {t("animalProfilePage.healthRecord")}
                                  </Button>
                                )}
                              </div>
                            </motion.li>
                          );
                        })}
                      </ol>

                      {past.length > 0 && (
                        <p className="mt-6 text-center text-xs text-muted-foreground">
                          {t("animalProfilePage.timelineSummary", { past: past.length, upcoming: upcoming.length })}
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
        <Footer />
      </PageTransition>
    </div>
  );
};

export default AnimalProfile;
