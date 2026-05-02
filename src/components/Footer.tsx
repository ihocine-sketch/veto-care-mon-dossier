import { Link } from "react-router-dom";
import { PawPrint, Mail, MapPin, Phone, Heart } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="relative mt-24 border-t border-border/60 bg-card/40 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-14">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary shadow-soft">
                <PawPrint className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-display text-xl font-semibold">Veto-Care</span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              L'extranet pensé pour les maîtres et leurs animaux. Soins, suivi et carnets de santé en un seul endroit.
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">Espace</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/dashboard" className="transition-colors hover:text-primary">Mes rendez-vous</Link></li>
              <li><Link to="/animaux" className="transition-colors hover:text-primary">Mes animaux</Link></li>
              <li><Link to="/veterinaires" className="transition-colors hover:text-primary">Vétérinaires</Link></li>
              <li><Link to="/nouveau-rdv" className="transition-colors hover:text-primary">Nouveau RDV</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">Cabinet</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> 12 rue des Tilleuls, 75011 Paris</li>
              <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary" /> +33 1 23 45 67 89</li>
              <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-primary" /> contact@veto-care.fr</li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">Horaires</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex justify-between"><span>Lun – Ven</span><span className="text-foreground/80">8h – 19h</span></li>
              <li className="flex justify-between"><span>Samedi</span><span className="text-foreground/80">9h – 17h</span></li>
              <li className="flex justify-between"><span>Dimanche</span><span className="text-foreground/80">Urgences</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-border/60 pt-6 text-sm text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} Veto-Care. Tous droits réservés.</p>
          <p className="flex items-center gap-1.5">
            Conçu avec <Heart className="h-3.5 w-3.5 fill-primary text-primary" /> pour vos compagnons
          </p>
        </div>
      </div>
    </footer>
  );
};
