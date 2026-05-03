import { useState } from "react";
import { Mail, Phone, MapPin, Clock, Send } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-50 to-white pt-24 pb-16">
      {/* Header Section */}
      <div className="max-w-6xl mx-auto px-4 mb-16">
        <div className="text-center mb-12">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-3"
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
            className="h-1 w-24 bg-gradient-to-r from-blue-500 to-indigo-600 mx-auto rounded-full"
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
        >
          {/* Contact Info Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ y: -4 }}
          >
            <Card className="p-6 border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-blue-50 group cursor-pointer">
              <div className="flex items-start gap-4">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 8 }}
                  className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg group-hover:shadow-lg transition-shadow"
                >
                  <MapPin className="h-6 w-6 text-blue-600" />
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
            <Card className="p-6 border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-blue-50 group cursor-pointer">
              <div className="flex items-start gap-4">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 8 }}
                  className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg group-hover:shadow-lg transition-shadow"
                >
                  <Phone className="h-6 w-6 text-blue-600" />
                </motion.div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Téléphone</h3>
                  <p className="text-gray-600 text-sm font-medium">
                    <a
                      href="tel:+213XXXXXXXX"
                      className="hover:text-blue-600 transition-colors font-semibold"
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
            <Card className="p-6 border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-blue-50 group cursor-pointer">
              <div className="flex items-start gap-4">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 8 }}
                  className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg group-hover:shadow-lg transition-shadow"
                >
                  <Mail className="h-6 w-6 text-blue-600" />
                </motion.div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Email</h3>
                  <p className="text-gray-600 text-sm font-medium">
                    <a
                      href="mailto:contact@veto-care.com"
                      className="hover:text-blue-600 transition-colors font-semibold"
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
          {/* Contact Form */}
          <div>
            <Card className="p-8 border-0 shadow-xl bg-white">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
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
                    className="w-full border-gray-300 focus:ring-blue-500 focus:border-blue-500"
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
                    className="w-full border-gray-300 focus:ring-blue-500 focus:border-blue-500"
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
                    className="w-full border-gray-300 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-2.5 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  {isSubmitting ? "Envoi en cours..." : "Envoyer le message"}
                </Button>
              </form>

              <p className="text-xs text-gray-500 mt-4 text-center">
                Vos données sont sécurisées et ne seront jamais partagées.
              </p>
            </Card>
          </div>

          {/* Opening Hours & Map */}
          <div className="space-y-6">
            {/* Opening Hours Card */}
            <Card className="p-8 border-0 shadow-xl bg-white">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
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
                          : "text-blue-600"
                      }`}
                    >
                      {item.hours}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-900">
                    Urgences 24/7:
                  </span>{" "}
                  Service d'urgence disponible tous les jours et toutes les
                  nuits.
                </p>
              </div>
            </Card>

            {/* Google Maps Embed */}
            <Card className="overflow-hidden border-0 shadow-xl">
              <div className="aspect-video w-full bg-gray-200">
                <iframe
                  src="https://www.google.com/maps?q=Tizi%20Ouzou%2C%20Algeria&output=embed"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={true}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Bottom CTA Section */}
      <div className="mt-16 bg-gradient-to-r from-blue-500 to-blue-600 py-12 px-4">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h3 className="text-2xl md:text-3xl font-bold mb-3">
            Prendre un rendez-vous
          </h3>
          <p className="mb-6 text-blue-100">
            Accédez à notre plateforme pour prendre rendez-vous en ligne ou
            appelez-nous directement.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => (window.location.href = "/auth")}
              className="bg-white text-blue-600 hover:bg-blue-50 font-medium px-8 py-2.5 rounded-lg transition-all"
            >
              Se connecter
            </Button>
            <Button
              onClick={() => (window.location.href = "tel:+213XXXXXXXX")}
              className="border-2 border-white text-white hover:bg-white/10 font-medium px-8 py-2.5 rounded-lg transition-all"
            >
              Nous appeler
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
