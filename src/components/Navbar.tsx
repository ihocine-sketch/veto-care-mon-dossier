import { Link, NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut, PawPrint, Menu, X } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useTranslation } from "react-i18next";

export const Navbar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = async () => {
    await signOut();
    toast.success(t('nav.loggedOut'));
    navigate("/auth");
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `relative px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
      isActive
        ? "text-primary"
        : "text-muted-foreground hover:text-foreground"
    }`;

  const links = user
    ? [
        { to: "/dashboard", label: t('nav.dashboard') },
        { to: "/animaux", label: t('nav.animals') },
        { to: "/veterinaires", label: t('nav.veterinarians') },
        { to: "/nouveau-rdv", label: t('nav.newAppointment') },
      ]
    : [];

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-500 ${
        scrolled
          ? "border-b border-border/40 bg-background/40 backdrop-blur-xl shadow-lg"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="group flex items-center gap-2.5">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary shadow-soft transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
            <PawPrint className="h-5 w-5 text-primary-foreground" />
            <span className="absolute inset-0 rounded-xl bg-gradient-primary opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-60" />
          </div>
          <span className="font-display text-xl font-semibold tracking-tight">
            Veto-Care
          </span>
        </Link>

        {user ? (
          <>
            <nav className="hidden items-center gap-1 md:flex">
              {links.map((l) => (
                <NavLink key={l.to} to={l.to} className={linkClass}>
                  {({ isActive }) => (
                    <>
                      {l.label}
                      {isActive && (
                        <motion.span
                          layoutId="nav-pill"
                          className="absolute inset-0 -z-10 rounded-lg bg-accent"
                          transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
              <NavLink to="/contact" className={linkClass}>
                {({ isActive }) => (
                  <>
                    {t('nav.contact')}
                    {isActive && (
                      <motion.span
                        layoutId="nav-pill"
                        className="absolute inset-0 -z-10 rounded-lg bg-accent"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </>
                )}
              </NavLink>
              <LanguageSwitcher />
              <Button variant="ghost" size="sm" onClick={handleLogout} className="ml-2 gap-2 transition-transform hover:scale-105">
                <LogOut className="h-4 w-4" />
                {t('nav.logout')}
              </Button>
            </nav>
            <button
              className="rounded-lg p-2 text-foreground hover:bg-accent md:hidden"
              onClick={() => setOpen((v) => !v)}
              aria-label="Menu"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </>
        ) : (
          <div className="hidden items-center gap-3 md:flex">
            <NavLink to="/contact" className={linkClass}>
              {({ isActive }) => (
                <>
                  {t('nav.contact')}
                  {isActive && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 -z-10 rounded-lg bg-accent"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </>
              )}
            </NavLink>
            <LanguageSwitcher />
            <Button asChild size="sm" className="gap-2 shadow-soft transition-transform hover:scale-105 hover:shadow-elegant">
              <Link to="/auth">{t('nav.login')}</Link>
            </Button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {open && user && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-border/60 glass md:hidden"
          >
            <div className="container mx-auto flex flex-col gap-1 px-4 py-3">
              {links.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `rounded-lg px-3 py-2.5 text-sm font-medium ${
                      isActive ? "bg-accent text-primary" : "text-muted-foreground hover:bg-secondary"
                    }`
                  }
                >
                  {l.label}
                </NavLink>
              ))}
              <NavLink
                to="/contact"
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2.5 text-sm font-medium ${
                    isActive ? "bg-accent text-primary" : "text-muted-foreground hover:bg-secondary"
                  }`
                }
              >
                {t('nav.contact')}
              </NavLink>
              <div className="px-3 py-2">
                <LanguageSwitcher />
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="mt-1 justify-start gap-2">
                <LogOut className="h-4 w-4" /> {t('nav.logout')}
              </Button>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
};
