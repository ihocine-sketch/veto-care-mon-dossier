import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Appointment = {
  id: string;
  nom_animal: string;
  espece: string;
  date_rdv: string;
  motif: string;
  statut: string;
  notes_veterinaire: string | null;
};

const VetDashboard = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [notesDraft, setNotesDraft] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const fetchAppointments = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("rendez_vous")
      .select("id, nom_animal, espece, date_rdv, motif, statut, notes_veterinaire")
      .order("date_rdv", { ascending: true });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    const rows = (data as Appointment[]) ?? [];
    setAppointments(rows);
    const draft: Record<string, string> = {};
    rows.forEach((item) => {
      draft[item.id] = item.notes_veterinaire ?? "";
    });
    setNotesDraft(draft);
    setLoading(false);
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const updateStatus = async (appointmentId: string, statut: "confirmé" | "annulé") => {
    const { error } = await supabase.from("rendez_vous").update({ statut }).eq("id", appointmentId);
    if (error) {
      toast.error(error.message);
      return;
    }
    setAppointments((prev) => prev.map((a) => (a.id === appointmentId ? { ...a, statut } : a)));
    toast.success(`Rendez-vous ${statut}.`);
  };

  const saveNotes = async (appointmentId: string) => {
    const notes = notesDraft[appointmentId] ?? "";
    const { error } = await supabase
      .from("rendez_vous")
      .update({ notes_veterinaire: notes.trim() || null })
      .eq("id", appointmentId);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Notes enregistrées.");
    setAppointments((prev) =>
      prev.map((a) => (a.id === appointmentId ? { ...a, notes_veterinaire: notes.trim() || null } : a)),
    );
  };

  return (
    <div className="min-h-screen bg-gradient-soft">
      <Navbar />
      <PageTransition>
        <main className="container mx-auto space-y-8 px-4 py-10">
          <h1 className="font-display text-4xl font-semibold">Dashboard Vétérinaire</h1>
          <Card>
            <CardHeader>
              <CardTitle>Mes rendez-vous</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p>Chargement...</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Animal</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Motif</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {appointments.map((a) => (
                      <TableRow key={a.id}>
                        <TableCell>{a.nom_animal} ({a.espece})</TableCell>
                        <TableCell>{new Date(a.date_rdv).toLocaleString("fr-FR")}</TableCell>
                        <TableCell>{a.motif}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => updateStatus(a.id, "confirmé")}>
                              Confirmer
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => updateStatus(a.id, "annulé")}>
                              Refuser
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="min-w-[280px] space-y-2">
                          <Label className="text-xs">Notes vétérinaire</Label>
                          <Textarea
                            value={notesDraft[a.id] ?? ""}
                            onChange={(e) => setNotesDraft((prev) => ({ ...prev, [a.id]: e.target.value }))}
                            rows={3}
                          />
                          <Button size="sm" onClick={() => saveNotes(a.id)}>
                            Enregistrer
                          </Button>
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

export default VetDashboard;
