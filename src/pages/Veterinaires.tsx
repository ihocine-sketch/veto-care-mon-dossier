import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Stethoscope } from "lucide-react";

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
      <main className="container mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="font-display text-4xl font-semibold text-foreground">Nos vétérinaires</h1>
          <p className="mt-2 text-muted-foreground">Une équipe expérimentée à l'écoute de vos compagnons.</p>
        </div>

        {loading ? (
          <p className="text-muted-foreground">Chargement...</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {vets.map((v) => (
              <Card key={v.id} className="border-border/60 shadow-card transition-smooth hover:shadow-elegant hover:-translate-y-0.5">
                <CardContent className="flex items-start gap-4 p-6">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent">
                    <Stethoscope className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display text-lg font-semibold">
                      Dr. {v.prenom} {v.nom}
                    </h3>
                    <Badge variant="secondary" className="mt-2 bg-secondary text-secondary-foreground">
                      {v.specialite}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Veterinaires;
