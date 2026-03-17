import { motion } from "framer-motion";
import { Users, Shield, Zap, Heart, Target, Eye, Sparkles, LifeBuoy } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/i18n/LanguageContext";

import clientMockup from "@/assets/about/client_app_screenshot.png";
import providerMockup from "@/assets/about/provider_app_screenshot.png";

const DeviceFrame = ({ children, title }: { children: React.ReactNode; title: string }) => (
  <div className="relative mx-auto w-full max-w-[260px]">
    <div className="relative rounded-[2.5rem] border-[6px] border-slate-900 bg-slate-900 shadow-2xl overflow-hidden aspect-[9/19]">
      <div className="absolute top-0 left-1/2 z-20 h-5 w-24 -translate-x-1/2 rounded-b-xl bg-slate-900"></div>
      <div className="relative h-full w-full overflow-hidden rounded-[2rem] bg-background">
        {children}
      </div>
    </div>
    <p className="mt-4 text-center text-sm font-semibold text-muted-foreground">{title}</p>
  </div>
);

const About = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      <section className="relative overflow-hidden bg-primary/5 py-24 md:py-32">
        <div className="container relative mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="font-heading text-4xl font-bold leading-tight md:text-6xl uppercase tracking-tight">
              Rezervitoo
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-lg md:text-xl text-muted-foreground leading-relaxed italic">
              {t("about.missionDesc")}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-20 bg-background border-y border-border/50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12">
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              viewport={{ once: true }}
              className="p-8 rounded-3xl bg-secondary/30 backdrop-blur-sm border border-primary/10"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  <Target className="h-6 w-6" />
                </div>
                <h2 className="text-2xl font-bold font-heading">{t("about.goal")}</h2>
              </div>
              <p className="text-lg leading-relaxed text-muted-foreground">
                {t("about.goalDesc")}
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              viewport={{ once: true }}
              className="p-8 rounded-3xl bg-primary/5 backdrop-blur-sm border border-primary/10"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  <Eye className="h-6 w-6" />
                </div>
                <h2 className="text-2xl font-bold font-heading">{t("about.vision")}</h2>
              </div>
              <p className="text-lg leading-relaxed text-muted-foreground">
                {t("about.visionDesc")}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl font-bold md:text-4xl">{t("about.dualTitle")}</h2>
            <div className="mt-4 mx-auto h-1 w-20 bg-primary rounded-full"></div>
          </div>

          <div className="grid gap-20 lg:grid-cols-2 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="flex flex-col justify-center">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-500">
                <Heart className="h-7 w-7" />
              </div>
              <h3 className="font-heading text-2xl font-bold md:text-3xl">{t("about.clientTitle")}</h3>
              <p className="mt-4 text-lg text-muted-foreground">{t("about.clientDesc")}</p>
              <ul className="mt-6 space-y-3">
                <li className="flex items-center gap-3 text-sm font-medium"><span className="h-1.5 w-1.5 rounded-full bg-primary"></span> {t("about.clientFeature1")}</li>
                <li className="flex items-center gap-3 text-sm font-medium"><span className="h-1.5 w-1.5 rounded-full bg-primary"></span> {t("about.clientFeature2")}</li>
                <li className="flex items-center gap-3 text-sm font-medium"><span className="h-1.5 w-1.5 rounded-full bg-primary"></span> {t("about.clientFeature3")}</li>
              </ul>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
              <DeviceFrame title={t("about.travelerExperience")}>
                <img src={clientMockup} alt={t("about.clientTitle")} className="h-full w-full object-cover" />
              </DeviceFrame>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="order-2 lg:order-1">
              <DeviceFrame title={t("about.providerManagement")}>
                <img src={providerMockup} alt={t("about.providerTitle")} className="h-full w-full object-cover" />
              </DeviceFrame>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="order-1 flex flex-col justify-center lg:order-2">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-500">
                <Zap className="h-7 w-7" />
              </div>
              <h3 className="font-heading text-2xl font-bold md:text-3xl">{t("about.providerTitle")}</h3>
              <p className="mt-4 text-lg text-muted-foreground">{t("about.providerDesc")}</p>
              <ul className="mt-6 space-y-3">
                <li className="flex items-center gap-3 text-sm font-medium"><span className="h-1.5 w-1.5 rounded-full bg-primary"></span> {t("about.providerFeature1")}</li>
                <li className="flex items-center gap-3 text-sm font-medium"><span className="h-1.5 w-1.5 rounded-full bg-primary"></span> {t("about.providerFeature2")}</li>
                <li className="flex items-center gap-3 text-sm font-medium"><span className="h-1.5 w-1.5 rounded-full bg-primary"></span> {t("about.providerFeature3")}</li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="bg-secondary/20 py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl font-bold md:text-4xl">{t("about.valuesTitle")}</h2>
            <div className="mt-4 mx-auto h-1.5 w-20 bg-primary rounded-full"></div>
          </div>
          
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { key: "Trust", icon: Shield, color: "bg-blue-500/10 text-blue-500" },
              { key: "Innovation", icon: Zap, color: "bg-orange-500/10 text-orange-500" },
              { key: "Quality", icon: Sparkles, color: "bg-purple-500/10 text-purple-500" },
              { key: "Support", icon: LifeBuoy, color: "bg-emerald-500/10 text-emerald-500" }
            ].map((value, i) => (
              <motion.div 
                key={value.key}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-card p-8 rounded-[2rem] border shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center"
              >
                <div className={`mb-6 flex h-16 w-16 items-center justify-center rounded-2xl ${value.color}`}>
                  <value.icon className="h-8 w-8" />
                </div>
                <h4 className="font-heading font-bold text-xl mb-3">{t(`about.value${value.key}`)}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t(`about.value${value.key}Desc`)}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
