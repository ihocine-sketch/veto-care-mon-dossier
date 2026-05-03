import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Vet = {
  id: string;
  nom: string;
  prenom: string;
  specialite: string;
  user_id: string | null;
};

type Appointment = {
  id: string;
  nom_animal: string;
  animal_id: string | null;
  date_rdv: string;
  statut: string;
  motif: string;
  maitre_id: string;
  veterinaire_id: string | null;
  veterinaires: { nom: string; prenom: string } | null;
  animaux: { nom: string; espece: string } | null;
};

const AdminDashboard = () => {
  const [vets, setVets] = useState<Vet[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingVetId, setEditingVetId] = useState<string | null>(null);
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [specialite, setSpecialite] = useState("");
  const [userId, setUserId] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      console.log("Fetching admin dashboard data...");
      
      // Fetch veterinarians
      const { data: vetsData, error: vetsError } = await supabase
        .from("veterinaires")
        .select("id, nom, prenom, specialite, user_id")
        .order("nom");

      if (vetsError) {
        console.error("Vets fetch error:", vetsError);
        toast.error(`Erreur vétérinaires: ${vetsError.message}`);
      } else {
        console.log("Vets data:", vetsData);
        setVets((vetsData as Vet[]) ?? []);
      }

      // Fetch all appointments for admin
      console.log("Fetching appointments for admin user...");
      
      // Query with proper joins using foreign keys
      const { data: rdvData, error: rdvError } = await supabase
        .from("rendez_vous")
        .select(`
          id, 
          nom_animal,
          animal_id,
          date_rdv, 
          statut, 
          motif,
          maitre_id,
          veterinaire_id,
          veterinaires!left(nom, prenom),
          animaux!left(nom, espece)
        `)
        .order("date_rdv", { ascending: false });

      if (rdvError) {
        console.error("Appointments fetch error:", rdvError);
        
        // Try a more basic query without joins as fallback
        console.log("Trying fallback query without joins...");
        const { data: fallbackData, error: fallbackError } = await supabase
          .from("rendez_vous")
          .select("id, nom_animal, date_rdv, statut, motif, maitre_id")
          .order("date_rdv", { ascending: false });
          
        if (fallbackError) {
          console.error("Fallback query also failed:", fallbackError);
          toast.error(`Erreur rendez-vous: ${rdvError.message}. RLS policies may be blocking access.`);
        } else {
          console.log("Fallback data:", fallbackData);
          setAppointments((fallbackData as unknown as Appointment[]) ?? []);
          toast.info("Affichage des rendez-vous sans informations détaillées (vétérinaire/animal)");
        }
      } else {
        console.log("Appointments data:", rdvData);
        console.log(`Found ${rdvData?.length || 0} appointments`);
        setAppointments((rdvData as unknown as Appointment[]) ?? []);
      }
    } catch (error) {
      console.error("Fetch data error:", error);
      toast.error("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Real-time subscription for appointment changes
    const subscription = supabase
      .channel('admin_rendez_vous_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rendez_vous'
        },
        (payload) => {
          console.log('Admin received change:', payload);
          if (payload.eventType === 'UPDATE') {
            setAppointments(prev => prev.map(apt => 
              apt.id === payload.new.id ? { ...apt, ...payload.new } : apt
            ));
          } else if (payload.eventType === 'INSERT') {
            setAppointments(prev => [...prev, payload.new as Appointment]);
          } else if (payload.eventType === 'DELETE') {
            setAppointments(prev => prev.filter(apt => apt.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const resetVetForm = () => {
    setEditingVetId(null);
    setNom("");
    setPrenom("");
    setSpecialite("");
    setUserId("");
  };

  const startEditVet = (vet: Vet) => {
    setEditingVetId(vet.id);
    setNom(vet.nom);
    setPrenom(vet.prenom);
    setSpecialite(vet.specialite);
    setUserId(vet.user_id ?? "");
  };

  const saveVet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom.trim() || !prenom.trim() || !specialite.trim()) {
      toast.error("Tous les champs vétérinaire sont requis.");
      return;
    }

    const payload = {
      nom: nom.trim(),
      prenom: prenom.trim(),
      specialite: specialite.trim(),
      user_id: userId.trim() || null,
    };
    const query = editingVetId
      ? supabase.from("veterinaires").update(payload).eq("id", editingVetId)
      : supabase.from("veterinaires").insert(payload);

    const { error } = await query;
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(editingVetId ? "Vétérinaire modifié." : "Vétérinaire ajouté.");
    resetVetForm();
    fetchData();
  };

  const deleteVet = async (vetId: string) => {
    const { error } = await supabase.from("veterinaires").delete().eq("id", vetId);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Vétérinaire supprimé.");
    fetchData();
  };

  const updateAppointmentStatus = async (appointmentId: string, statut: string) => {
    const { error } = await supabase.from("rendez_vous").update({ statut }).eq("id", appointmentId);
    if (error) {
      toast.error(error.message);
      return;
    }
    setAppointments((prev) => prev.map((a) => (a.id === appointmentId ? { ...a, statut } : a)));
  };

  return (
    <div className="min-h-screen bg-gradient-soft">
      <Navbar />
      <PageTransition>
        <main className="container mx-auto space-y-8 px-4 py-10">
          <h1 className="font-display text-4xl font-semibold">Dashboard Admin</h1>

          <Card>
            <CardHeader>
              <CardTitle>{editingVetId ? "Modifier un vétérinaire" : "Ajouter un vétérinaire"}</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="grid gap-4 md:grid-cols-5" onSubmit={saveVet}>
                <div className="space-y-2">
                  <Label>Nom</Label>
                  <Input value={nom} onChange={(e) => setNom(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Prénom</Label>
                  <Input value={prenom} onChange={(e) => setPrenom(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Spécialité</Label>
                  <Input value={specialite} onChange={(e) => setSpecialite(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Compte vet (user_id)</Label>
                  <Input
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    placeholder="UUID du compte auth du vétérinaire"
                  />
                </div>
                <div className="flex items-end gap-2">
                  <Button type="submit">{editingVetId ? "Enregistrer" : "Ajouter"}</Button>
                  {editingVetId && (
                    <Button type="button" variant="outline" onClick={resetVetForm}>
                      Annuler
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Vétérinaires</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p>Chargement...</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom</TableHead>
                      <TableHead>Prénom</TableHead>
                      <TableHead>Spécialité</TableHead>
                      <TableHead>Compte lié</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vets.map((vet) => (
                      <TableRow key={vet.id}>
                        <TableCell>{vet.nom}</TableCell>
                        <TableCell>{vet.prenom}</TableCell>
                        <TableCell>{vet.specialite}</TableCell>
                        <TableCell>{vet.user_id ?? "Non lié"}</TableCell>
                        <TableCell className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => startEditVet(vet)}>
                            Modifier
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => deleteVet(vet.id)}>
                            Supprimer
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tous les rendez-vous</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p>Chargement...</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Animal</TableHead>
                      <TableHead>Propriétaire</TableHead>
                      <TableHead>Vétérinaire</TableHead>
                      <TableHead>Motif</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {appointments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          Aucun rendez-vous trouvé
                        </TableCell>
                      </TableRow>
                    ) : (
                      appointments.map((a) => (
                        <TableRow key={a.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {a.animaux?.nom || a.nom_animal || 'Animal non spécifié'}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {a.animaux?.espece || 'Espèce non spécifiée'}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              ID: {a.maitre_id?.substring(0, 8)}...
                            </div>
                          </TableCell>
                          <TableCell>
                            {a.veterinaires ? `Dr. ${a.veterinaires.prenom} ${a.veterinaires.nom}` : "-"}
                          </TableCell>
                          <TableCell>
                            <div className="max-w-[200px] truncate" title={a.motif}>
                              {a.motif || "-"}
                            </div>
                          </TableCell>
                          <TableCell>{new Date(a.date_rdv).toLocaleString("fr-FR")}</TableCell>
                          <TableCell>
                            <Select value={a.statut} onValueChange={(value) => updateAppointmentStatus(a.id, value)}>
                              <SelectTrigger className="w-[140px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="en_attente">En attente</SelectItem>
                                <SelectItem value="confirmé">Confirmé</SelectItem>
                                <SelectItem value="annulé">Annulé</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </main>
      </PageTransition>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
