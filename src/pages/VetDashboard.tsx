import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
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

const statutClass: Record<string, string> = {
  en_attente: "bg-warning/15 text-warning border-warning/30",
  confirme: "bg-success/15 text-success border-success/30",
  "confirmé": "bg-success/15 text-success border-success/30",
  annule: "bg-destructive/15 text-destructive border-destructive/30",
  "annulé": "bg-destructive/15 text-destructive border-destructive/30",
};

const getStatutLabel = (statut: string) => {
  if (statut.includes("confirm")) return "Confirmé";
  if (statut.includes("annul")) return "Annulé";
  return "En attente";
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

    // Real-time subscription for rendez_vous changes
    const subscription = supabase
      .channel('vet_rendez_vous_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rendez_vous'
        },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            // Update the specific appointment in state
            setAppointments(prev => prev.map(apt => 
              apt.id === payload.new.id ? { ...apt, ...payload.new } : apt
            ));
            
            // Update notes draft if changed
            if (payload.new.notes_veterinaire !== payload.old.notes_veterinaire) {
              setNotesDraft(prev => ({
                ...prev,
                [payload.new.id]: payload.new.notes_veterinaire || ""
              }));
            }
          } else if (payload.eventType === 'INSERT') {
            // Add new appointment
            setAppointments(prev => [...prev, payload.new as Appointment]);
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
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
                          <div className="flex flex-col gap-2">
                            <Badge variant="outline" className={`${statutClass[a.statut] || statutClass.en_attente} font-semibold w-fit`}>
                              {getStatutLabel(a.statut)}
                            </Badge>
                            {a.statut === "en_attente" && (
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline" onClick={() => updateStatus(a.id, "confirmé")}>
                                  Confirmer
                                </Button>
                                <Button size="sm" variant="destructive" onClick={() => updateStatus(a.id, "annulé")}>
                                  Refuser
                                </Button>
                              </div>
                            )}
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
