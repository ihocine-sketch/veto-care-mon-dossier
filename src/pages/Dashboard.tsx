import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, FileText, Plus, PawPrint } from "lucide-react";
import { toast } from "sonner";

interface Rdv {
  id: string;
  nom_animal: string;
  espece: string;
  date_rdv: string;
  motif: string;
  statut: string;
  carnet_sante_url: string | null;
  veterinaires: { nom: string; prenom: string; specialite: string } | null;
}

const statutLabel: Record<string, { label: string; cls: string }> = {
  en_attente: { label: "En attente", cls: "bg-warning/15 text-warning border-warning/30" },
  confirme: { label: "Confirmé", cls: "bg-success/15 text-success border-success/30" },
  annule: { label: "Annulé", cls: "bg-destructive/15 text-destructive border-destructive/30" },
};

const Dashboard = () => {
  const { user } = useAuth();
  const [rdvs, setRdvs] = useState<Rdv[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("rendez_vous")
      .select("*, veterinaires(nom, prenom, specialite)")
      .eq("maitre_id", user.id)
      .order("date_rdv", { ascending: true })
      .then(({ data, error }) => {
        if (error) toast.error(error.message);
        setRdvs((data as any) || []);
        setLoading(false);
      });
  }, [user]);

  const downloadCarnet = async (path: string) => {
    const { data, error } = await supabase.storage.from("carnets_sante").createSignedUrl(path, 60);
    if (error) return toast.error("Impossible d'ouvrir le carnet");
    window.open(data.signedUrl, "_blank");
  };

  return (
    <div className="min-h-screen bg-gradient-soft">
      <Navbar />
      <main className="container mx-auto px-4 py-10">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl font-semibold">Mes rendez-vous</h1>
            <p className="mt-2 text-muted-foreground">Suivez les soins de vos compagnons.</p>
          </div>
          <Button asChild size="lg" className="gap-2">
            <Link to="/nouveau-rdv"><Plus className="h-4 w-4" /> Nouveau rendez-vous</Link>
          </Button>
        </div>

        {loading ? (
          <p className="text-muted-foreground">Chargement...</p>
        ) : rdvs.length === 0 ? (
          <Card className="border-dashed border-border/60 shadow-none">
            <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent">
                <PawPrint className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="font-display text-xl font-semibold">Aucun rendez-vous</h3>
                <p className="mt-1 text-sm text-muted-foreground">Prenez votre premier rendez-vous pour commencer.</p>
              </div>
              <Button asChild><Link to="/nouveau-rdv">Créer un rendez-vous</Link></Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {rdvs.map((r) => {
              const st = statutLabel[r.statut] || statutLabel.en_attente;
              const date = new Date(r.date_rdv);
              return (
                <Card key={r.id} className="border-border/60 shadow-card transition-smooth hover:shadow-elegant">
                  <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary shadow-soft">
                        <PawPrint className="h-6 w-6 text-primary-foreground" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-display text-lg font-semibold">{r.nom_animal}</h3>
                          <span className="text-sm text-muted-foreground">· {r.espece}</span>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {r.veterinaires ? `Dr. ${r.veterinaires.prenom} ${r.veterinaires.nom} — ${r.veterinaires.specialite}` : "—"}
                        </p>
                        <p className="mt-2 text-sm text-foreground/80">{r.motif}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-start gap-2 sm:items-end">
                      <Badge variant="outline" className={st.cls}>{st.label}</Badge>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {date.toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short" })}
                      </div>
                      {r.carnet_sante_url && (
                        <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => downloadCarnet(r.carnet_sante_url!)}>
                          <FileText className="h-4 w-4" /> Carnet de santé
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
