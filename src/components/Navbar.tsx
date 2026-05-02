import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut, PawPrint } from "lucide-react";
import { toast } from "sonner";

export const Navbar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    toast.success("Déconnecté avec succès");
    navigate("/auth");
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 text-sm font-medium rounded-md transition-smooth ${
      isActive ? "text-primary bg-accent" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
    }`;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-primary shadow-soft">
            <PawPrint className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-semibold text-foreground">
            Veto-Care
          </span>
        </Link>

        {user ? (
          <nav className="flex items-center gap-1">
            <NavLink to="/dashboard" className={linkClass}>Mes rendez-vous</NavLink>
            <NavLink to="/veterinaires" className={linkClass}>Vétérinaires</NavLink>
            <NavLink to="/nouveau-rdv" className={linkClass}>Nouveau RDV</NavLink>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="ml-2 gap-2">
              <LogOut className="h-4 w-4" />
              Déconnexion
            </Button>
          </nav>
        ) : (
          <Button asChild variant="default" size="sm">
            <Link to="/auth">Se connecter</Link>
          </Button>
        )}
      </div>
    </header>
  );
};
