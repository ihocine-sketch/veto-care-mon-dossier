import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { PawPrint, Calendar, Stethoscope, ShieldCheck } from "lucide-react";

const Index = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-soft">
      <Navbar />
      <main>
        {/* Hero */}
        <section className="container mx-auto px-4 py-20 sm:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm text-muted-foreground shadow-soft">
              <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
              Extranet vétérinaire
            </div>
            <h1 className="font-display text-5xl font-semibold leading-tight text-foreground sm:text-6xl">
              Le suivi santé de vos animaux,{" "}
              <span className="text-primary">en toute simplicité.</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              Prenez rendez-vous, gérez les carnets de santé et suivez les visites de vos compagnons depuis un seul espace.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <Button asChild size="lg" className="gap-2">
                <Link to={user ? "/dashboard" : "/auth"}>
                  <PawPrint className="h-4 w-4" />
                  {user ? "Mon espace" : "Créer mon espace"}
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/veterinaires">Voir nos vétérinaires</Link>
              </Button>
            </div>
          </div>

          {/* Features */}
          <div className="mx-auto mt-24 grid max-w-5xl gap-6 sm:grid-cols-3">
            {[
              { icon: Calendar, title: "Rendez-vous en ligne", desc: "Choisissez votre vétérinaire et planifiez en quelques clics." },
              { icon: Stethoscope, title: "Équipe spécialisée", desc: "Médecine générale, chirurgie, dermatologie et plus." },
              { icon: ShieldCheck, title: "Carnet de santé sécurisé", desc: "Vos documents stockés de manière confidentielle." },
            ].map((f) => (
              <div key={f.title} className="rounded-2xl border border-border/60 bg-card p-6 shadow-card transition-smooth hover:shadow-elegant hover:-translate-y-1">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-accent">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-display text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;
