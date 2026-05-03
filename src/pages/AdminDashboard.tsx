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
  date_rdv: string;
  statut: string;
  veterinaires: { nom: string; prenom: string } | null;
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
    const [{ data: vetsData, error: vetsError }, { data: rdvData, error: rdvError }] = await Promise.all([
      supabase.from("veterinaires").select("id, nom, prenom, specialite, user_id").order("nom"),
      supabase
        .from("rendez_vous")
        .select("id, nom_animal, date_rdv, statut, veterinaires(nom, prenom)")
        .order("date_rdv", { ascending: false }),
    ]);

    if (vetsError) toast.error(vetsError.message);
    if (rdvError) toast.error(rdvError.message);

    setVets((vetsData as Vet[]) ?? []);
    setAppointments((rdvData as unknown as Appointment[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
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
                      <TableHead>Vétérinaire</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {appointments.map((a) => (
                      <TableRow key={a.id}>
                        <TableCell>{a.nom_animal}</TableCell>
                        <TableCell>{a.veterinaires ? `Dr. ${a.veterinaires.prenom} ${a.veterinaires.nom}` : "-"}</TableCell>
                        <TableCell>{new Date(a.date_rdv).toLocaleString("fr-FR")}</TableCell>
                        <TableCell>
                          <Select value={a.statut} onValueChange={(value) => updateAppointmentStatus(a.id, value)}>
                            <SelectTrigger className="w-[160px]">
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
                    ))}
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
