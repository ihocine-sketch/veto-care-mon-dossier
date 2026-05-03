import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Download, FileText, Plus, PawPrint, Sparkles, Clock, CheckCircle2, TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

interface Rdv {
  id: string;
  nom_animal: string;
  espece: string;
  date_rdv: string;
  motif: string;
  statut: string;
  carnet_sante_url: string | null;
  veterinaires: { nom: string; prenom: string; specialite: string } | null;
}

interface MonthData {
  month: string;
  count: number;
}

const statutClass: Record<string, string> = {
  en_attente: "bg-warning/15 text-warning border-warning/30",
  confirme: "bg-success/15 text-success border-success/30",
  "confirmé": "bg-success/15 text-success border-success/30",
  annule: "bg-destructive/15 text-destructive border-destructive/30",
  "annulé": "bg-destructive/15 text-destructive border-destructive/30",
};

// Animal emoji mapping
const getAnimalEmoji = (espece: string): string => {
  const lower = espece.toLowerCase();
  if (lower.includes("chat") || lower.includes("félin")) return "🐱";
  if (lower.includes("chien") || lower.includes("canin")) return "🐶";
  if (lower.includes("lapin")) return "🐰";
  if (lower.includes("hamster") || lower.includes("rongeur")) return "🐹";
  if (lower.includes("oiseau")) return "🦜";
  if (lower.includes("lézard") || lower.includes("reptile")) return "🦎";
  if (lower.includes("tortue")) return "🐢";
  if (lower.includes("cochon")) return "🐷";
  if (lower.includes("cheval")) return "🐴";
  if (lower.includes("vache")) return "🐄";
  return "🐾";
};

const Dashboard = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [rdvs, setRdvs] = useState<Rdv[]>([]);
  const [loading, setLoading] = useState(true);
  const [animalCount, setAnimalCount] = useState(0);
  const [calendarMonth, setCalendarMonth] = useState(new Date());

  useEffect(() => {
    if (!user) return;
    supabase
      .from("rendez_vous")
      .select("*, veterinaires(nom, prenom, specialite)")
      .eq("maitre_id", user.id)
      .order("date_rdv", { ascending: true })
      .then(({ data, error }) => {
        if (error) toast.error(error.message);
        setRdvs((data as any) || []);
        setLoading(false);
      });

    supabase
      .from("animaux")
      .select("id", { count: "exact", head: true })
      .eq("maitre_id", user.id)
      .then(({ count, error }) => {
        if (error) {
          toast.error(error.message);
          return;
        }
        setAnimalCount(count ?? 0);
      });
  }, [user]);

  const downloadCarnet = (url: string) => window.open(url, "_blank");

  const totalAppointments = rdvs.length;

  const nextAppointment = useMemo(() => {
    const now = Date.now();
    return rdvs
      .map((rdv) => ({ ...rdv, date: new Date(rdv.date_rdv) }))
      .filter((rdv) => rdv.date.getTime() >= now)
      .sort((a, b) => a.date.getTime() - b.date.getTime())[0];
  }, [rdvs]);

  const monthlyAppointments = useMemo((): MonthData[] => {
    const months = Array.from({ length: 12 }, (_, index) => {
      const date = new Date();
      date.setMonth(index);
      return {
        month: date.toLocaleString("fr-FR", { month: "short" }).replace(".", ""),
        count: 0,
      };
    });

    const currentYear = new Date().getFullYear();

    rdvs.forEach((rdv) => {
      const date = new Date(rdv.date_rdv);
      if (date.getFullYear() !== currentYear) {
        return;
      }
      const monthKey = date.getMonth();
      if (!Number.isNaN(monthKey)) {
        months[monthKey]!.count += 1;
      }
    });

    return months;
  }, [rdvs]);

  const appointmentDays = useMemo(() => {
    const map = new Map<string, Rdv[]>();
    rdvs.forEach((rdv) => {
      const date = new Date(rdv.date_rdv);
      const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      const items = map.get(key) || [];
      items.push(rdv);
      map.set(key, items);
    });
    return map;
  }, [rdvs]);

  const locale = i18n.language === "ar" ? "ar-DZ" : i18n.language === "en" ? "en-US" : "fr-FR";
  const monthLabel = calendarMonth.toLocaleString(locale, { month: "long", year: "numeric" });

  const firstDayIndex = (new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1).getDay() + 6) % 7;
  const daysInMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0).getDate();
  const totalCells = Math.ceil((firstDayIndex + daysInMonth) / 7) * 7;
  const todayKey = (() => {
    const now = new Date();
    return `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
  })();

  return (
    <div className="min-h-screen bg-gradient-soft">
      <Navbar />
      <PageTransition>
        <main className="container mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12 flex flex-wrap items-end justify-between gap-4"
          >
            <div>
              <p className="mb-3 inline-flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wider text-primary">
                <Sparkles className="h-3.5 w-3.5" /> {t("dashboardPage.welcome")}
              </p>
              <h1 className="font-display text-5xl font-semibold tracking-tight mb-2">{t("dashboardPage.title")}</h1>
              <p className="text-muted-foreground text-lg">{t("dashboardPage.animalsFollowed", { count: animalCount })}</p>
            </div>
            <Button asChild size="lg" className="gap-2 shadow-elegant transition-all hover:shadow-glow hover:-translate-y-0.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white">
              <Link to="/nouveau-rdv"><Plus className="h-4 w-4" /> {t("dashboardPage.newAppointment")}</Link>
            </Button>
          </motion.div>

          <div className="grid gap-4 xl:grid-cols-[1.4fr_2fr]">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                whileHover={{ y: -4 }}
              >
                <Card className="border-0 bg-gradient-to-br from-blue-500 via-blue-400 to-cyan-400 shadow-lg hover:shadow-xl transition-shadow duration-300 text-white">
                  <CardContent className="space-y-3 p-6">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium uppercase tracking-wider text-blue-100 opacity-90">{t("dashboardPage.cards.appointments")}</p>
                        <p className="mt-3 text-4xl font-bold">{totalAppointments}</p>
                      </div>
                      <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                        <CalendarIcon className="h-8 w-8" />
                      </div>
                    </div>
                    <p className="text-sm text-blue-50 opacity-90">{t("dashboardPage.cards.totalAppointments")}</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                whileHover={{ y: -4 }}
              >
                <Card className="border-0 bg-gradient-to-br from-purple-500 via-pink-400 to-rose-400 shadow-lg hover:shadow-xl transition-shadow duration-300 text-white">
                  <CardContent className="space-y-3 p-6">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium uppercase tracking-wider text-purple-100 opacity-90">{t("dashboardPage.cards.animals")}</p>
                        <p className="mt-3 text-4xl font-bold">{animalCount}</p>
                      </div>
                      <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                        <PawPrint className="h-8 w-8" />
                      </div>
                    </div>
                    <p className="text-sm text-purple-50 opacity-90">{t("dashboardPage.cards.healthRecord")}</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                whileHover={{ y: -4 }}
              >
                <Card className="border-0 bg-gradient-to-br from-amber-400 via-orange-400 to-red-400 shadow-lg hover:shadow-xl transition-shadow duration-300 text-white">
                  <CardContent className="space-y-3 p-6">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium uppercase tracking-wider text-amber-100 opacity-90">{t("dashboardPage.cards.next")}</p>
                        <p className="mt-3 text-2xl font-bold">
                          {nextAppointment ? (
                            <span>{getAnimalEmoji(nextAppointment.espece)} {nextAppointment.nom_animal}</span>
                          ) : (
                            "—"
                          )}
                        </p>
                      </div>
                      <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                        <TrendingUp className="h-8 w-8" />
                      </div>
                    </div>
                    {nextAppointment ? (
                      <div className="space-y-1 text-sm text-amber-50 opacity-90">
                        <p>{new Date(nextAppointment.date_rdv).toLocaleString(locale, { dateStyle: "long", timeStyle: "short" })}</p>
                        <p>{nextAppointment.veterinaires ? `Dr. ${nextAppointment.veterinaires.prenom} ${nextAppointment.veterinaires.nom}` : t("dashboardPage.vetNotSet")}</p>
                      </div>
                    ) : (
                      <p className="text-sm text-amber-50 opacity-90">{t("dashboardPage.noNextAppointment")}</p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <Card className="border-0 bg-gradient-to-br from-slate-50 to-white shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="mb-6 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">{t("dashboardPage.chart.byMonth")}</p>
                      <h2 className="mt-2 text-2xl font-bold text-foreground">{t("dashboardPage.chart.annualTrend")}</h2>
                    </div>
                    <Badge className="rounded-full px-4 py-1.5 text-sm font-semibold bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
                      {new Date().getFullYear()}
                    </Badge>
                  </div>
                  <div className="h-[320px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={monthlyAppointments} margin={{ top: 10, right: 16, left: -10, bottom: 0 }}>
                        <defs>
                          <linearGradient id="appointmentsGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#2563eb" stopOpacity={0.28} />
                            <stop offset="100%" stopColor="#2563eb" stopOpacity={0.06} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} opacity={0.6} />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#6b7280", fontSize: 12 }} padding={{ left: 8, right: 8 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: "#6b7280", fontSize: 12 }} allowDecimals={false} width={40} />
                        <Tooltip contentStyle={{ borderRadius: 16, border: "1px solid #e5e7eb", boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)", backgroundColor: "#fff" }} formatter={(value: number) => [value, t("dashboardPage.cards.appointments")]} />
                        <Area type="monotone" dataKey="count" stroke="#2563eb" fill="url(#appointmentsGradient)" strokeWidth={3} activeDot={{ r: 6, fill: "#2563eb" }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-0 bg-gradient-to-br from-slate-50 to-white shadow-lg">
              <CardContent className="p-6">
                <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">{t("dashboardPage.calendar.title")}</p>
                    <h2 className="mt-2 text-2xl font-bold text-foreground">{t("dashboardPage.calendar.monthlyAppointments")}</h2>
                  </div>
                  <div className="flex items-center gap-2 rounded-full bg-white border border-gray-200 px-3 py-2 text-sm text-muted-foreground shadow-sm hover:shadow-md transition-shadow">
                    <button
                      type="button"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100 transition"
                      onClick={() => setCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="font-bold text-foreground min-w-[140px] text-center">{monthLabel}</span>
                    <button
                      type="button"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100 transition"
                      onClick={() => setCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-5">
                  <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold tracking-wider text-gray-600 mb-3">
                    {[t("dashboardPage.days.mon"), t("dashboardPage.days.tue"), t("dashboardPage.days.wed"), t("dashboardPage.days.thu"), t("dashboardPage.days.fri"), t("dashboardPage.days.sat"), t("dashboardPage.days.sun")].map((label) => (
                      <div key={label} className="py-3">{label}</div>
                    ))}
                  </div>
                  <div className="grid gap-2 sm:grid-cols-7">
                    {Array.from({ length: totalCells }).map((_, index) => {
                      const dayNumber = index - firstDayIndex + 1;
                      const inMonth = dayNumber >= 1 && dayNumber <= daysInMonth;
                      const date = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), dayNumber);
                      const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
                      const items = inMonth ? appointmentDays.get(key) || [] : [];
                      return (
                        <motion.div
                          key={`${calendarMonth.getMonth()}-${index}`}
                          whileHover={inMonth ? { y: -2, boxShadow: "0 8px 16px rgba(37, 99, 235, 0.1)" } : {}}
                          className={`min-h-[7.5rem] overflow-hidden rounded-xl border transition-all ${
                            inMonth 
                              ? 'bg-white border-gray-200 shadow-sm hover:border-blue-300 cursor-pointer' 
                              : 'bg-gray-50 border-gray-100 text-gray-400'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 p-3">
                            <span className={`text-sm font-bold ${key === todayKey ? 'text-blue-600 bg-blue-100 rounded-full w-6 h-6 flex items-center justify-center' : 'text-foreground'}`}>
                              {inMonth ? dayNumber : ''}
                            </span>
                            {items.length > 0 && (
                              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-600">
                                {items.length}
                              </span>
                            )}
                          </div>
                          <div className="px-3 pb-3 flex flex-col gap-1.5">
                            {items.slice(0, 2).map((item) => (
                              <div key={item.id} className="overflow-hidden rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 px-2 py-1.5 text-xs leading-tight">
                                <p className="font-bold text-blue-900">{getAnimalEmoji(item.espece)} {item.nom_animal}</p>
                                <p className="text-blue-700 text-[0.65rem]">
                                  {item.veterinaires ? `Dr. ${item.veterinaires.prenom}` : t("dashboardPage.vetShort")}
                                </p>
                              </div>
                            ))}
                            {items.length > 2 && (
                              <p className="text-xs font-semibold text-blue-600">+{items.length - 2} {t("dashboardPage.other", { count: items.length - 2 })}</p>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {loading ? (
            <div className="grid gap-4">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-32 animate-pulse rounded-2xl bg-gradient-to-r from-slate-200 to-slate-100" />
              ))}
            </div>
          ) : rdvs.length === 0 ? (
            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
              <Card className="border-2 border-dashed border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-none">
                <CardContent className="flex flex-col items-center gap-4 py-20 text-center">
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-400 to-blue-500 shadow-lg"
                  >
                    <PawPrint className="h-10 w-10 text-white" />
                  </motion.div>
                  <div>
                    <h3 className="font-display text-2xl font-bold text-foreground">{t("dashboardPage.empty.title")}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{t("dashboardPage.empty.subtitle")}</p>
                  </div>
                  <Button asChild className="gap-2 mt-4 shadow-lg hover:shadow-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white">
                    <Link to="/nouveau-rdv"><Plus className="h-4 w-4" /> {t("dashboardPage.empty.create")}</Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <div className="grid gap-4">
              {rdvs.map((r, idx) => {
                const stClass = statutClass[r.statut] || statutClass.en_attente;
                const stLabel = r.statut.includes("confirm")
                  ? t("dashboardPage.status.confirmed")
                  : r.statut.includes("annul")
                    ? t("dashboardPage.status.cancelled")
                    : t("dashboardPage.status.pending");
                const date = new Date(r.date_rdv);
                return (
                  <motion.div
                    key={r.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: idx * 0.06 }}
                    whileHover={{ y: -4, boxShadow: "0 20px 40px rgba(37, 99, 235, 0.15)" }}
                  >
                    <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-slate-50">
                      <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-blue-500 to-indigo-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                      <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-gradient-to-br from-blue-400 to-indigo-400 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-20" />
                      <CardContent className="relative flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-4">
                          <motion.div
                            whileHover={{ scale: 1.1, rotate: 8 }}
                            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg text-2xl"
                          >
                            {getAnimalEmoji(r.espece)}
                          </motion.div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-display text-xl font-bold text-foreground">{r.nom_animal}</h3>
                              <span className="text-sm text-muted-foreground">· {r.espece}</span>
                            </div>
                            <p className="mt-1.5 text-sm text-blue-700 font-medium">
                              {r.veterinaires ? `Dr. ${r.veterinaires.prenom} ${r.veterinaires.nom}` : t("dashboardPage.vetNotSet")}
                            </p>
                            <p className="mt-1 text-sm text-muted-foreground">{r.motif}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-start gap-2 sm:items-end">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="outline" className={`${stClass} font-semibold`}>{stLabel}</Badge>
                            {(r as any).payment_status === "paid" ? (
                              <Badge className="gap-1.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 font-semibold">
                                <CheckCircle2 className="h-3.5 w-3.5" /> {t("dashboardPage.payment.paid")}
                              </Badge>
                            ) : (
                              <Badge className="gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 font-semibold">
                                <Clock className="h-3.5 w-3.5" /> {t("dashboardPage.status.pending")}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                            <CalendarIcon className="h-4 w-4" />
                            {date.toLocaleString(locale, { dateStyle: "long", timeStyle: "short" })}
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {(r as any).payment_status === "paid" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="gap-1.5 h-7 px-2 text-xs transition-transform hover:scale-105"
                                onClick={async () => {
                                  try {
                                    const { data, error } = await supabase.functions.invoke("generate-invoice", {
                                      body: JSON.stringify({ appointmentId: r.id }),
                                    });
                                    if (error) throw error;
                                    const blob = new Blob([data], { type: "text/html" });
                                    const url = window.URL.createObjectURL(blob);
                                    const a = document.createElement("a");
                                    a.href = url;
                                    a.download = `facture_${r.id.substring(0, 8)}.html`;
                                    a.click();
                                  } catch (err) {
                                    toast.error(t("dashboardPage.errors.invoice"));
                                  }
                                }}
                              >
                                <Download className="h-3.5 w-3.5" /> {t("dashboardPage.invoice")}
                              </Button>
                            )}
                            {r.carnet_sante_url && (
                              <Button variant="ghost" size="sm" className="gap-1.5 h-7 px-2 text-xs transition-transform hover:scale-105" onClick={() => downloadCarnet(r.carnet_sante_url!)}>
                                <FileText className="h-3.5 w-3.5" /> {t("dashboardPage.healthRecord")}
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </main>
        <Footer />
      </PageTransition>
    </div>
  );
};

export default Dashboard;
