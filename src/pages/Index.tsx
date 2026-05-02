import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { PageTransition } from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { PawPrint, Calendar, Stethoscope, ShieldCheck, ArrowRight, Sparkles, Clock, FileText, Star, CheckCircle2 } from "lucide-react";
import { motion, type Variants } from "framer-motion";

const stagger: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] } },
};

// Floating animal animation
const floatingAnimal: Variants = {
  animate: {
    y: [0, -30, 0],
    rotate: [0, 5, -5, 0],
    transition: { duration: 4, repeat: Infinity, ease: "easeInOut" },
  },
};

const testimonials = [
  {
    name: "Marie Dupont",
    role: "Propriétaire de Médor",
    content: "Veto-Care m'a sauvé la vie ! Plus besoin de mémoriser les rendez-vous, tout est organisé.",
    rating: 5,
  },
  {
    name: "Jean Moreau",
    role: "Vétérinaire",
    content: "Plateforme magnifique et très intuitive. Mes clients adorent le design et la simplicité.",
    rating: 5,
  },
  {
    name: "Sophie Bernard",
    role: "Propriétaire de Whiskers",
    content: "Le carnet de santé numérique est fantastique ! Toujours à portée de main sur mon téléphone.",
    rating: 5,
  },
];

const statistics = [
  { label: "Animaux suivis", value: "500+" },
  { label: "Vétérinaires partenaires", value: "50+" },
  { label: "Satisfaction client", value: "4.9/5" },
];

const Index = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#e8f5e9] via-[#f0f9f0] to-white animate-gradient-x">
      <Navbar />
      <PageTransition>
        <main>
          {/* Hero */}
          <section className="relative overflow-hidden bg-gradient-to-br from-[#e8f5e9] via-[#f0f9f0] to-white">
            <AnimatedBackground />
            
            {/* Floating animal icons */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <motion.div
                variants={floatingAnimal}
                animate="animate"
                className="absolute top-32 left-[5%] text-6xl opacity-20"
              >
                🐶
              </motion.div>
              <motion.div
                variants={floatingAnimal}
                animate="animate"
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute top-48 right-[8%] text-6xl opacity-20"
              >
                🐱
              </motion.div>
              <motion.div
                variants={floatingAnimal}
                animate="animate"
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-32 left-[10%] text-6xl opacity-20"
              >
                🐰
              </motion.div>
            </div>

            <div className="container mx-auto px-4 pt-20 pb-32 sm:pt-28 sm:pb-40 relative z-10">
              <motion.div
                variants={stagger}
                initial="hidden"
                animate="show"
                className="mx-auto max-w-3xl text-center"
              >
                <motion.div variants={item} className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/80 bg-card/70 px-4 py-1.5 text-sm text-muted-foreground shadow-soft backdrop-blur">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
                  </span>
                  Extranet vétérinaire · nouvelle génération
                </motion.div>

                <motion.h1 variants={item} className="font-display text-6xl font-bold leading-[1.05] text-foreground sm:text-8xl">
                  Le suivi santé de vos animaux,{" "}
                  <span className="relative inline-block">
                    <span className="text-gradient">en toute simplicité.</span>
                    <svg className="absolute -bottom-2 left-0 w-full" height="12" viewBox="0 0 200 12" fill="none">
                      <motion.path
                        d="M2 8 Q 50 2, 100 6 T 198 5"
                        stroke="hsl(var(--primary))"
                        strokeWidth="3"
                        strokeLinecap="round"
                        fill="none"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1.4, delay: 0.6, ease: "easeInOut" }}
                      />
                    </svg>
                  </span>
                </motion.h1>

                <motion.p variants={item} className="mx-auto mt-7 max-w-2xl text-lg text-muted-foreground sm:text-xl">
                  Prenez rendez-vous, gérez les carnets de santé et suivez les visites de vos compagnons depuis un seul espace, élégant et sécurisé.
                </motion.p>

                <motion.div variants={item} className="mt-10 flex flex-wrap items-center justify-center gap-3">
                  <Button asChild size="lg" className="group h-12 gap-2 px-7 text-base shadow-elegant transition-all hover:-translate-y-0.5 hover:shadow-glow">
                    <Link to={user ? "/dashboard" : "/auth"}>
                      <PawPrint className="h-4 w-4" />
                      {user ? "Mon espace" : "Créer mon espace"}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="h-12 px-7 text-base backdrop-blur transition-all hover:-translate-y-0.5">
                    <Link to="/veterinaires">Voir nos vétérinaires</Link>
                  </Button>
                </motion.div>

                <motion.div variants={item} className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5 text-primary" /> Sans engagement</span>
                  <span className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-primary" /> RGPD</span>
                  <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-primary" /> Disponible 24/7</span>
                </motion.div>
              </motion.div>

              {/* Floating preview card */}
              <motion.div
                initial={{ opacity: 0, y: 60 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="relative mx-auto mt-20 max-w-3xl"
              >
                <div className="absolute -inset-4 rounded-[2rem] bg-gradient-primary opacity-20 blur-2xl" />
                <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-card/90 p-2 shadow-elegant backdrop-blur">
                  <div className="rounded-2xl bg-gradient-soft p-8 sm:p-10">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary">
                        <Calendar className="h-5 w-5 text-primary-foreground" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Prochain rendez-vous</p>
                        <p className="font-display text-lg font-semibold">Médor — Vaccin annuel</p>
                      </div>
                    </div>
                    <div className="mt-6 grid gap-3 sm:grid-cols-3">
                      {[
                        { label: "Vétérinaire", value: "Dr. Meziane" },
                        { label: "Date", value: "Mar. 14h00" },
                        { label: "Statut", value: "Confirmé", accent: true },
                      ].map((s) => (
                        <div key={s.label} className="rounded-xl border border-border/60 bg-background/60 p-4">
                          <p className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</p>
                          <p className={`mt-1 font-medium ${s.accent ? "text-success" : "text-foreground"}`}>{s.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>

          {/* Feature Cards */}
          <section className="container mx-auto px-4 py-16">
            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-80px" }}
              className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-3"
            >
              <motion.div
                variants={item}
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-8 shadow-card hover:shadow-elegant"
              >
                <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gradient-primary opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-30" />
                <div className="relative mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200 shadow-soft transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                  <Calendar className="h-7 w-7 text-blue-600" />
                </div>
                <h3 className="relative font-display text-xl font-bold mb-3">Rendez-vous en ligne</h3>
                <p className="relative text-sm leading-relaxed text-muted-foreground">Prenez rendez-vous 24/7 avec nos vétérinaires certifiés depuis votre téléphone ou ordinateur.</p>
              </motion.div>

              <motion.div
                variants={item}
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-8 shadow-card hover:shadow-elegant"
              >
                <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gradient-primary opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-30" />
                <div className="relative mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-red-100 to-pink-200 shadow-soft transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                  <Sparkles className="h-7 w-7 text-red-600" />
                </div>
                <h3 className="relative font-display text-xl font-bold mb-3">Carnet de santé digital</h3>
                <p className="relative text-sm leading-relaxed text-muted-foreground">Tous les vaccins, traitements et visites médicales de vos animaux centralisés et sécurisés.</p>
              </motion.div>

              <motion.div
                variants={item}
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-8 shadow-card hover:shadow-elegant"
              >
                <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gradient-primary opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-30" />
                <div className="relative mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-green-100 to-emerald-200 shadow-soft transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                  <ShieldCheck className="h-7 w-7 text-green-600" />
                </div>
                <h3 className="relative font-display text-xl font-bold mb-3">Vétérinaires certifiés</h3>
                <p className="relative text-sm leading-relaxed text-muted-foreground">Une équipe de professionnels qualifiés et passionnés, disponibles pour prendre soin de vos compagnons.</p>
              </motion.div>
            </motion.div>
          </section>

          {/* Stats Section */}
          <section className="container mx-auto px-4 py-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mx-auto max-w-4xl rounded-3xl bg-gradient-to-r from-green-50 via-blue-50 to-purple-50 p-8 shadow-lg border border-green-100/50"
            >
              <div className="text-center">
                <h3 className="font-display text-2xl font-bold text-gray-900 mb-6">Veto-Care en chiffres</h3>
                <div className="flex flex-wrap justify-center items-center gap-8 text-lg font-semibold text-gray-700">
                  <div className="flex items-center gap-2">
                    <span className="text-3xl">🐾</span>
                    <span>500+ animaux suivis</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-3xl">👨‍⚕️</span>
                    <span>50+ vétérinaires</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-3xl">⭐</span>
                    <span>4.9/5 étoiles</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </section>

          {/* Features */}
          <section className="container mx-auto px-4 pb-24">
            <div className="mx-auto mb-14 max-w-2xl text-center">
              <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">Fonctionnalités</p>
              <h2 className="font-display text-4xl font-semibold sm:text-5xl">
                Tout ce qu'il faut, <span className="text-gradient">rien de plus</span>
              </h2>
            </div>

            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-80px" }}
              className="mx-auto grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {[
                { icon: Calendar, title: "Rendez-vous en ligne", desc: "Choisissez votre vétérinaire et planifiez en quelques clics, à toute heure." },
                { icon: Stethoscope, title: "Équipe spécialisée", desc: "Médecine générale, chirurgie, dermatologie — un savoir-faire pour chaque besoin." },
                { icon: ShieldCheck, title: "Carnet sécurisé", desc: "Documents stockés de manière confidentielle et accessibles à tout moment." },
                { icon: FileText, title: "Historique complet", desc: "Retrouvez toutes les visites passées et à venir de vos compagnons." },
                { icon: Clock, title: "Rappels automatiques", desc: "Ne manquez plus jamais un vaccin ou un rendez-vous important." },
                { icon: Sparkles, title: "Interface élégante", desc: "Une expérience pensée pour la sérénité, sur mobile comme sur ordinateur." },
              ].map((f) => (
                <motion.div
                  key={f.title}
                  variants={item}
                  whileHover={{ y: -6 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-7 shadow-card"
                >
                  <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gradient-primary opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-30" />
                  <div className="relative mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-secondary shadow-soft transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                    <f.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="relative font-display text-xl font-semibold">{f.title}</h3>
                  <p className="relative mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </section>

          {/* Statistics Section */}
          <section className="container mx-auto px-4 pb-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mx-auto max-w-5xl rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-50 p-12 shadow-lg border border-blue-100/50"
            >
              <div className="grid gap-8 sm:grid-cols-3">
                {statistics.map((stat, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1, duration: 0.5 }}
                    className="text-center"
                  >
                    <motion.p
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.15, duration: 0.5, type: "spring" }}
                      className="font-display text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600"
                    >
                      {stat.value}
                    </motion.p>
                    <p className="mt-2 text-sm text-gray-600 font-medium">{stat.label}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </section>

          {/* Testimonials Section */}
          <section className="container mx-auto px-4 pb-24">
            <div className="mx-auto mb-16 max-w-2xl text-center">
              <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">Avis clients</p>
              <h2 className="font-display text-4xl font-semibold sm:text-5xl">
                Les propriétaires adorent <span className="text-gradient">Veto-Care</span>
              </h2>
            </div>

            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-80px" }}
              className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {testimonials.map((testimonial, idx) => (
                <motion.div
                  key={idx}
                  variants={item}
                  whileHover={{ y: -6 }}
                  className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-8 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gradient-primary opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-30" />
                  
                  <div className="relative mb-4 flex gap-0.5">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1, type: "spring" }}
                      >
                        <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      </motion.div>
                    ))}
                  </div>

                  <p className="relative mb-6 text-sm leading-relaxed text-muted-foreground italic">
                    "{testimonial.content}"
                  </p>

                  <div className="relative flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-primary flex items-center justify-center text-lg">
                      {testimonial.name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{testimonial.name}</p>
                      <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </section>

          {/* CTA */}
          <section className="container mx-auto px-4 pb-24">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl bg-gradient-primary p-10 text-center shadow-elegant sm:p-16"
            >
              <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "var(--gradient-mesh)" }} />
              <div className="absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-white/20 blur-3xl" />
              <div className="relative">
                <h2 className="font-display text-4xl font-semibold text-primary-foreground sm:text-5xl">
                  Prêt à prendre soin d'eux ?
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-primary-foreground/85">
                  Créez votre espace en moins d'une minute et accédez à toute l'équipe Veto-Care.
                </p>
                <Button asChild size="lg" variant="secondary" className="mt-8 h-12 gap-2 px-7 text-base shadow-elegant transition-transform hover:scale-105">
                  <Link to={user ? "/dashboard" : "/auth"}>
                    Commencer maintenant
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </motion.div>
          </section>
        </main>
        <Footer />
      </PageTransition>
    </div>
  );
};

export default Index;
