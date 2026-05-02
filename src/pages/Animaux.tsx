import { useEffect, useState } from "react";
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
import { PawPrint, Plus, Sparkles, ArrowRight } from "lucide-react";
import { toast } from "sonner";

interface Animal {
  id: string;
  nom: string;
  espece: string;
  race: string | null;
  age: number | null;
  poids: number | null;
  photo_url: string | null;
}

const Animaux = () => {
  const { user } = useAuth();
  const [animaux, setAnimaux] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("animaux")
      .select("id, nom, espece, race, age, poids, photo_url")
      .eq("maitre_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) toast.error(error.message);
        setAnimaux((data as Animal[]) || []);
        setLoading(false);
      });
  }, [user]);

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
                <Sparkles className="h-3.5 w-3.5" /> Mes compagnons
              </p>
              <h1 className="font-display text-5xl font-semibold tracking-tight">Mes animaux</h1>
              <p className="mt-2 text-muted-foreground">Profils, suivi et historique médical.</p>
            </div>
            <Button asChild size="lg" className="gap-2 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-glow">
              <Link to="/animaux/nouveau"><Plus className="h-4 w-4" /> Ajouter un animal</Link>
            </Button>
          </motion.div>

          {loading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((i) => <div key={i} className="h-64 animate-pulse rounded-2xl bg-card/60" />)}
            </div>
          ) : animaux.length === 0 ? (
            <Card className="border-dashed border-border/60 shadow-none">
              <CardContent className="flex flex-col items-center gap-4 py-20 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-accent to-secondary shadow-soft animate-float">
                  <PawPrint className="h-10 w-10 text-primary" />
                </div>
                <div>
                  <h3 className="font-display text-2xl font-semibold">Aucun animal enregistré</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Créez le profil de votre premier compagnon.</p>
                </div>
                <Button asChild className="shadow-soft hover:shadow-glow">
                  <Link to="/animaux/nouveau">Ajouter un animal</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {animaux.map((a, idx) => (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                  whileHover={{ y: -6 }}
                >
                  <Link to={`/animaux/${a.id}`}>
                    <Card className="group relative h-full overflow-hidden border-border/60 shadow-card transition-all duration-300 hover:shadow-elegant">
                      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-accent to-secondary">
                        {a.photo_url ? (
                          <img
                            src={a.photo_url}
                            alt={a.nom}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <PawPrint className="h-16 w-16 text-primary/40" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                      </div>
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-display text-xl font-semibold">{a.nom}</h3>
                            <p className="mt-0.5 text-sm text-muted-foreground">
                              {a.espece}{a.race ? ` · ${a.race}` : ""}
                            </p>
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted-foreground transition-all group-hover:translate-x-1 group-hover:text-primary" />
                        </div>
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {a.age != null && <Badge variant="secondary">{a.age} an{a.age > 1 ? "s" : ""}</Badge>}
                          {a.poids != null && <Badge variant="secondary">{a.poids} kg</Badge>}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </main>
        <Footer />
      </PageTransition>
    </div>
  );
};

export default Animaux;
