import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, FileText, Plus, PawPrint, Sparkles } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
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

interface MonthData {
  month: string;
  count: number;
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
  const [animalCount, setAnimalCount] = useState(0);

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

    supabase
      .from("animaux")
      .select("id", { count: "exact", head: true })
      .eq("maitre_id", user.id)
      .then(({ count, error }) => {
        if (error) {
          toast.error(error.message);
          return;
        }
        setAnimalCount(count ?? 0);
      });
  }, [user]);

  const downloadCarnet = (url: string) => window.open(url, "_blank");

  const totalAppointments = rdvs.length;

  const nextAppointment = useMemo(() => {
    const now = Date.now();
    return rdvs
      .map((rdv) => ({ ...rdv, date: new Date(rdv.date_rdv) }))
      .filter((rdv) => rdv.date.getTime() >= now)
      .sort((a, b) => a.date.getTime() - b.date.getTime())[0];
  }, [rdvs]);

  const monthlyAppointments = useMemo((): MonthData[] => {
    const months = Array.from({ length: 12 }, (_, index) => {
      const date = new Date();
      date.setMonth(index);
      return {
        month: date.toLocaleString("fr-FR", { month: "short" }).replace(".", ""),
        count: 0,
      };
    });

    const currentYear = new Date().getFullYear();

    rdvs.forEach((rdv) => {
      const date = new Date(rdv.date_rdv);
      if (date.getFullYear() !== currentYear) {
        return;
      }
      const monthKey = date.getMonth();
      if (!Number.isNaN(monthKey)) {
        months[monthKey]!.count += 1;
      }
    });

    return months;
  }, [rdvs]);

  return (
    <div className="min-h-screen bg-gradient-soft">
      <Navbar />
      <PageTransition>
        <main className="container mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-10 flex flex-wrap items-end justify-between gap-4"
          >
            <div>
              <p className="mb-2 inline-flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wider text-primary">
                <Sparkles className="h-3.5 w-3.5" /> Mon espace
              </p>
              <h1 className="font-display text-5xl font-semibold tracking-tight">Mes rendez-vous</h1>
              <p className="mt-2 text-muted-foreground">Suivez les soins de vos compagnons.</p>
            </div>
            <Button asChild size="lg" className="gap-2 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-glow">
              <Link to="/nouveau-rdv"><Plus className="h-4 w-4" /> Nouveau rendez-vous</Link>
            </Button>
          </motion.div>

          <div className="grid gap-4 xl:grid-cols-[1.4fr_2fr]">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
              <Card className="border-border/60 bg-gradient-to-br from-background/80 to-slate-50/60 shadow-soft">
                <CardContent className="space-y-3 p-6">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground">Rendez-vous</p>
                      <p className="mt-2 text-3xl font-semibold text-foreground">{totalAppointments}</p>
                    </div>
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-primary/10 text-primary shadow-soft">
                      <Calendar className="h-6 w-6" />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">Total de rendez-vous enregistrés pour votre compte.</p>
                </CardContent>
              </Card>

              <Card className="border-border/60 bg-white/80 shadow-soft">
                <CardContent className="space-y-3 p-6">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground">Animaux suivis</p>
                      <p className="mt-2 text-3xl font-semibold text-foreground">{animalCount}</p>
                    </div>
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-secondary/10 text-secondary shadow-soft">
                      <PawPrint className="h-6 w-6" />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">Nombre d'animaux différents dans votre carnet.</p>
                </CardContent>
              </Card>

              <Card className="border-border/60 bg-white/80 shadow-soft">
                <CardContent className="space-y-3 p-6">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground">Prochain rendez-vous</p>
                      <p className="mt-2 text-xl font-semibold text-foreground">
                        {nextAppointment ? nextAppointment.nom_animal : "Aucun planifié"}
                      </p>
                    </div>
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-emerald-500/10 text-emerald-600 shadow-soft">
                      <Sparkles className="h-6 w-6" />
                    </div>
                  </div>
                  {nextAppointment ? (
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>{new Date(nextAppointment.date_rdv).toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short" })}</p>
                      <p>{nextAppointment.veterinaires ? `Dr. ${nextAppointment.veterinaires.prenom} ${nextAppointment.veterinaires.nom}` : "Vétérinaire non défini"}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Aucun prochain rendez-vous n'a encore été planifié.</p>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card className="border-border/60 bg-white/80 shadow-soft">
              <CardContent className="p-6">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground">Rendez-vous par mois</p>
                    <h2 className="mt-2 text-2xl font-semibold text-foreground">Tendance trimestrielle</h2>
                  </div>
                  <Badge variant="secondary" className="rounded-full px-3 py-1 text-sm">
                    {new Date().getFullYear()}
                  </Badge>
                </div>
                <div className="h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyAppointments} margin={{ top: 10, right: 16, left: -10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="appointmentsGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#2563eb" stopOpacity={0.28} />
                          <stop offset="100%" stopColor="#2563eb" stopOpacity={0.06} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} opacity={0.6} />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#6b7280", fontSize: 12 }} padding={{ left: 8, right: 8 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: "#6b7280", fontSize: 12 }} allowDecimals={false} width={40} />
                      <Tooltip contentStyle={{ borderRadius: 16, border: "1px solid #e5e7eb", boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)", backgroundColor: "#fff" }} formatter={(value: number) => [value, "Rendez-vous"]} />
                      <Area type="monotone" dataKey="count" stroke="#2563eb" fill="url(#appointmentsGradient)" strokeWidth={3} activeDot={{ r: 6, fill: "#2563eb" }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {loading ? (
            <div className="grid gap-4">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-32 animate-pulse rounded-2xl bg-card/60" />
              ))}
            </div>
          ) : rdvs.length === 0 ? (
            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
              <Card className="border-dashed border-border/60 shadow-none">
                <CardContent className="flex flex-col items-center gap-4 py-20 text-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-accent to-secondary shadow-soft animate-float">
                    <PawPrint className="h-10 w-10 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display text-2xl font-semibold">Aucun rendez-vous</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Prenez votre premier rendez-vous pour commencer.</p>
                  </div>
                  <Button asChild className="shadow-soft hover:shadow-glow">
                    <Link to="/nouveau-rdv">Créer un rendez-vous</Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <div className="grid gap-4">
              {rdvs.map((r, idx) => {
                const st = statutLabel[r.statut] || statutLabel.en_attente;
                const date = new Date(r.date_rdv);
                return (
                  <motion.div
                    key={r.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: idx * 0.06 }}
                    whileHover={{ y: -4 }}
                  >
                    <Card className="group relative overflow-hidden border-border/60 shadow-card transition-all duration-300 hover:shadow-elegant">
                      <div className="absolute inset-y-0 left-0 w-1 bg-gradient-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                      <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-gradient-primary opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-20" />
                      <CardContent className="relative flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-4">
                          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-primary shadow-soft transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                            <PawPrint className="h-7 w-7 text-primary-foreground" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-display text-xl font-semibold">{r.nom_animal}</h3>
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
                            <Button variant="ghost" size="sm" className="gap-1.5 transition-transform hover:scale-105" onClick={() => downloadCarnet(r.carnet_sante_url!)}>
                              <FileText className="h-4 w-4" /> Carnet de santé
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </main>
        <Footer />
      </PageTransition>
    </div>
  );
};

export default Dashboard;
