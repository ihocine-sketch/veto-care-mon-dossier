import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { getDefaultDashboardPath, useAuth, UserRole } from "@/contexts/AuthContext";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PawPrint, ArrowLeft, User, Stethoscope, Shield } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

const authSchema = z.object({
  email: z.string().trim().email("Email invalide").max(255),
  password: z.string().min(6, "Le mot de passe doit faire au moins 6 caractères").max(100),
});

const Auth = () => {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole>("client");

  useEffect(() => {
    if (user) navigate(getDefaultDashboardPath(role));
  }, [user, role, navigate]);

  const handle = async (mode: "signin" | "signup") => {
    const parsed = authSchema.safeParse({ email, password });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    setLoading(true);
    try {
      let signedUserId: string | null = null;
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: parsed.data.email,
          password: parsed.data.password,
          options: { 
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: {
              role: selectedRole
            }
          },
        });
        if (error) throw error;
        signedUserId = data.user?.id ?? null;
        
        // Create role entry for new user
        if (signedUserId) {
          const { error: roleError } = await supabase
            .from("roles")
            .insert({ user_id: signedUserId, role: selectedRole });
          if (roleError) console.error("Role creation error:", roleError);
        }
        
        toast.success("Compte créé ! Vous êtes connecté.");
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: parsed.data.email,
          password: parsed.data.password,
        });
        if (error) throw error;
        signedUserId = data.user?.id ?? null;
        toast.success("Bienvenue !");
      }
      const { data: roleRow } = signedUserId
        ? await supabase.from("roles").select("role").eq("user_id", signedUserId).maybeSingle()
        : { data: null };
      navigate(getDefaultDashboardPath((roleRow?.role as "admin" | "client" | "vet" | undefined) ?? role));
    } catch (e: any) {
      toast.error(e.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-12">
      <AnimatedBackground />
      <Link to="/" className="absolute left-6 top-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary">
        <ArrowLeft className="h-4 w-4" /> Accueil
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="w-full max-w-md"
      >
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <motion.div
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
            className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-primary shadow-elegant"
          >
            <PawPrint className="h-8 w-8 text-primary-foreground" />
            <span className="absolute inset-0 rounded-2xl animate-pulse-ring" />
          </motion.div>
          <h1 className="font-display text-4xl font-semibold">Veto-Care</h1>
          <p className="text-sm text-muted-foreground">L'extranet des maîtres de vos animaux</p>
        </div>

        <Card className="border-border/60 bg-card/80 shadow-elegant backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="font-display text-2xl">Espace de connexion</CardTitle>
            <CardDescription>Choisissez votre rôle et connectez-vous</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <Label className="text-sm font-medium text-muted-foreground mb-3 block">Je suis...</Label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant={selectedRole === "client" ? "default" : "outline"}
                  onClick={() => setSelectedRole("client")}
                  className={`flex flex-col gap-2 h-auto py-3 px-2 transition-all ${
                    selectedRole === "client" 
                      ? "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white border-green-600 shadow-lg" 
                      : "hover:bg-green-50 hover:border-green-200"
                  }`}
                >
                  <User className="h-5 w-5" />
                  <span className="text-xs font-medium">Client</span>
                </Button>
                <Button
                  variant={selectedRole === "vet" ? "default" : "outline"}
                  onClick={() => setSelectedRole("vet")}
                  className={`flex flex-col gap-2 h-auto py-3 px-2 transition-all ${
                    selectedRole === "vet" 
                      ? "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white border-green-600 shadow-lg" 
                      : "hover:bg-green-50 hover:border-green-200"
                  }`}
                >
                  <Stethoscope className="h-5 w-5" />
                  <span className="text-xs font-medium">Vétérinaire</span>
                </Button>
                <Button
                  variant={selectedRole === "admin" ? "default" : "outline"}
                  onClick={() => setSelectedRole("admin")}
                  className={`flex flex-col gap-2 h-auto py-3 px-2 transition-all ${
                    selectedRole === "admin" 
                      ? "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white border-green-600 shadow-lg" 
                      : "hover:bg-green-50 hover:border-green-200"
                  }`}
                >
                  <Shield className="h-5 w-5" />
                  <span className="text-xs font-medium">Administrateur</span>
                </Button>
              </div>
            </div>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Connexion</TabsTrigger>
                <TabsTrigger value="signup">Inscription</TabsTrigger>
              </TabsList>

              <div className="mt-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vous@exemple.fr" className="h-11 transition-all focus:scale-[1.01]" />
                </div>
                <PasswordInput 
                  label="Mot de passe"
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="••••••••" 
                  className="h-11 transition-all focus:scale-[1.01]" 
                />
              </div>

              <TabsContent value="signin" className="mt-6">
                <Button onClick={() => handle("signin")} disabled={loading} className="w-full shadow-soft transition-all hover:shadow-glow bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white" size="lg">
                  {loading ? "Connexion..." : "Se connecter"}
                </Button>
              </TabsContent>
              <TabsContent value="signup" className="mt-6">
                <Button onClick={() => handle("signup")} disabled={loading} className="w-full shadow-soft transition-all hover:shadow-glow bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white" size="lg">
                  {loading ? "Création..." : "Créer mon compte"}
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          En continuant, vous acceptez nos conditions et notre politique de confidentialité.
        </p>
      </motion.div>
    </div>
  );
};

export default Auth;
