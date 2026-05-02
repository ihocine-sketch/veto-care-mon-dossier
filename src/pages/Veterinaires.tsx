import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Stethoscope, Sparkles } from "lucide-react";

interface Vet {
  id: string;
  nom: string;
  prenom: string;
  specialite: string;
}

const Veterinaires = () => {
  const [vets, setVets] = useState<Vet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("veterinaires").select("*").order("nom").then(({ data }) => {
      setVets(data || []);
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-soft">
      <Navbar />
      <PageTransition>
        <main className="container mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-10"
          >
            <p className="mb-2 inline-flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wider text-primary">
              <Sparkles className="h-3.5 w-3.5" /> Notre équipe
            </p>
            <h1 className="font-display text-5xl font-semibold tracking-tight">Nos vétérinaires</h1>
            <p className="mt-2 text-muted-foreground">Une équipe expérimentée à l'écoute de vos compagnons.</p>
          </motion.div>

          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-32 animate-pulse rounded-2xl bg-card/60" />
              ))}
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {vets.map((v, idx) => (
                <motion.div
                  key={v.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                  whileHover={{ y: -6 }}
                >
                  <Card className="group relative h-full overflow-hidden border-border/60 shadow-card transition-all duration-300 hover:shadow-elegant">
                    <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-gradient-primary opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-25" />
                    <CardContent className="relative flex items-start gap-4 p-6">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-secondary shadow-soft transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                        <Stethoscope className="h-7 w-7 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-display text-xl font-semibold">
                          Dr. {v.prenom} {v.nom}
                        </h3>
                        <Badge variant="secondary" className="mt-2 bg-secondary text-secondary-foreground">
                          {v.specialite}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
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

export default Veterinaires;
