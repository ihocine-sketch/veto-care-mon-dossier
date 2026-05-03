import { useState } from "react";
import { ArrowLeft, Mail, Phone, MapPin, Clock, Send } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Veuillez entrer une adresse email valide");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.functions.invoke("send-contact-email", {
        body: {
          name: formData.name,
          email: formData.email,
          message: formData.message,
        },
      });

      if (error) {
        toast.error("Erreur lors de l'envoi du message");
        console.error(error);
      } else {
        toast.success("Message envoyé avec succès!");
        setFormData({ name: "", email: "", message: "" });
      }
    } catch (error) {
      toast.error("Erreur lors de l'envoi du message");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openingHours = [
    { day: "Lundi", hours: "09:00 - 19:00" },
    { day: "Mardi", hours: "09:00 - 19:00" },
    { day: "Mercredi", hours: "09:00 - 19:00" },
    { day: "Jeudi", hours: "09:00 - 19:00" },
    { day: "Vendredi", hours: "09:00 - 19:00" },
    { day: "Samedi", hours: "10:00 - 16:00" },
    { day: "Dimanche", hours: "Fermé" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#e8f5e9] via-[#f0f9f0] to-white">
      <Navbar />
      <PageTransition>
        <main className="pb-16 pt-8">
          <div className="max-w-6xl mx-auto px-4 mb-6">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              <ArrowLeft className="h-4 w-4" /> Retour à l'accueil
            </Link>
          </div>

          {/* Header Section */}
          <div className="max-w-6xl mx-auto px-4 mb-16">
            <div className="text-center mb-12">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-display text-4xl md:text-5xl font-bold text-gray-900 mb-3"
              >
                Veto-Care Clinique Vétérinaire
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-xl text-gray-600 mb-4"
              >
                Clinique Vétérinaire
              </motion.p>
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="h-1 w-24 bg-gradient-to-r from-emerald-500 to-green-600 mx-auto rounded-full"
              />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                whileHover={{ y: -4 }}
              >
                <Card className="p-6 border-border/60 shadow-lg hover:shadow-elegant transition-all duration-300 bg-gradient-to-br from-white to-emerald-50/80 group cursor-pointer">
                  <div className="flex items-start gap-4">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 8 }}
                      className="p-3 bg-gradient-to-br from-emerald-100 to-green-100 rounded-lg group-hover:shadow-md transition-shadow"
                    >
                      <MapPin className="h-6 w-6 text-emerald-700" />
                    </motion.div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">Adresse</h3>
                      <p className="text-gray-600 text-sm leading-relaxed font-medium">
                        Tizi Ouzou, Algérie
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                whileHover={{ y: -4 }}
              >
                <Card className="p-6 border-border/60 shadow-lg hover:shadow-elegant transition-all duration-300 bg-gradient-to-br from-white to-emerald-50/80 group cursor-pointer">
                  <div className="flex items-start gap-4">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 8 }}
                      className="p-3 bg-gradient-to-br from-emerald-100 to-green-100 rounded-lg group-hover:shadow-md transition-shadow"
                    >
                      <Phone className="h-6 w-6 text-emerald-700" />
                    </motion.div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">Téléphone</h3>
                      <p className="text-gray-600 text-sm font-medium">
                        <a
                          href="tel:+213XXXXXXXX"
                          className="hover:text-emerald-700 transition-colors font-semibold"
                        >
                          +213 XX XX XX XX
                        </a>
                      </p>
                      <p className="text-gray-500 text-xs mt-2 font-medium">
                        Appel d'urgence 24/7
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                whileHover={{ y: -4 }}
              >
                <Card className="p-6 border-border/60 shadow-lg hover:shadow-elegant transition-all duration-300 bg-gradient-to-br from-white to-emerald-50/80 group cursor-pointer">
                  <div className="flex items-start gap-4">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 8 }}
                      className="p-3 bg-gradient-to-br from-emerald-100 to-green-100 rounded-lg group-hover:shadow-md transition-shadow"
                    >
                      <Mail className="h-6 w-6 text-emerald-700" />
                    </motion.div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">Email</h3>
                      <p className="text-gray-600 text-sm font-medium">
                        <a
                          href="mailto:contact@veto-care.com"
                          className="hover:text-emerald-700 transition-colors font-semibold"
                        >
                          contact@veto-care.com
                        </a>
                      </p>
                      <p className="text-gray-500 text-xs mt-2 font-medium">
                        Réponse dans 24 heures
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </motion.div>
          </div>

          {/* Main Content Section */}
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div>
                <Card className="p-8 border-border/60 shadow-elegant bg-card/95 backdrop-blur-sm">
                  <h2 className="font-display text-2xl font-bold text-gray-900 mb-6">
                    Nous contacter
                  </h2>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom complet
                      </label>
                      <Input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Votre nom"
                        className="w-full focus-visible:ring-emerald-500/30 focus-visible:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Adresse email
                      </label>
                      <Input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="votre@email.com"
                        className="w-full focus-visible:ring-emerald-500/30 focus-visible:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Message
                      </label>
                      <Textarea
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        placeholder="Votre message..."
                        rows={5}
                        className="w-full resize-none focus-visible:ring-emerald-500/30 focus-visible:border-emerald-500"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full shadow-soft gap-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-medium py-2.5"
                    >
                      <Send className="h-4 w-4" />
                      {isSubmitting ? "Envoi en cours..." : "Envoyer le message"}
                    </Button>
                  </form>

                  <p className="text-xs text-muted-foreground mt-4 text-center">
                    Vos données sont sécurisées et ne seront jamais partagées.
                  </p>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="p-8 border-border/60 shadow-elegant bg-card/95 backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                      <Clock className="h-6 w-6 text-emerald-700" />
                    </div>
                    <h2 className="font-display text-2xl font-bold text-gray-900">
                      Horaires d'ouverture
                    </h2>
                  </div>

                  <div className="space-y-3">
                    {openingHours.map((item, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-gray-700 font-medium">{item.day}</span>
                        <span
                          className={`text-sm font-medium ${
                            item.hours === "Fermé"
                              ? "text-gray-400"
                              : "text-emerald-700"
                          }`}
                        >
                          {item.hours}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 pt-6 border-t border-border">
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold text-gray-900">
                        Urgences 24/7:
                      </span>{" "}
                      Service d'urgence disponible tous les jours et toutes les
                      nuits.
                    </p>
                  </div>
                </Card>

                <Card className="overflow-hidden border-border/60 shadow-elegant">
                  <div className="aspect-video w-full bg-muted">
                    <iframe
                      src="https://www.google.com/maps?q=Tizi%20Ouzou%2C%20Algeria&output=embed"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen={true}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Carte — Tizi Ouzou"
                    />
                  </div>
                </Card>
              </div>
            </div>
          </div>

          <div className="mt-16 bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-700 py-12 px-4">
            <div className="max-w-4xl mx-auto text-center text-white">
              <h3 className="font-display text-2xl md:text-3xl font-bold mb-3">
                Prendre un rendez-vous
              </h3>
              <p className="mb-6 text-emerald-50">
                Accédez à notre plateforme pour prendre rendez-vous en ligne ou
                appelez-nous directement.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => (window.location.href = "/auth")}
                  className="bg-white text-emerald-700 hover:bg-emerald-50 font-medium px-8 py-2.5"
                >
                  Se connecter
                </Button>
                <Button
                  variant="outline"
                  onClick={() => (window.location.href = "tel:+213XXXXXXXX")}
                  className="border-2 border-white bg-transparent text-white hover:bg-white/15 font-medium px-8 py-2.5"
                >
                  Nous appeler
                </Button>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </PageTransition>
    </div>
  );
}
