import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MessageCircle, MapPin, Store, Croissant, Beer, UtensilsCrossed, BadgePercent } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ProductCard, type Product } from "@/components/ProductCard";
import { whatsappLink } from "@/lib/whatsapp";
import logo from "@/assets/logo-imperio.png";

const Index = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Império Doces — Atacado em Araçatuba";
    supabase
      .from("products")
      .select("id, name, description, price, image_url")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setProducts((data as Product[]) ?? []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/90 backdrop-blur-md">
        <div className="container mx-auto flex items-center justify-between gap-3 py-2">
          <a href="#" className="flex items-center gap-2">
            <img src={logo} alt="Império Doces Distribuidora" className="h-12 w-12 rounded-lg object-cover sm:h-14 sm:w-14" />
            <span className="text-base font-extrabold sm:text-lg">Império Doces</span>
          </a>
          <Button asChild size="sm" className="bg-gradient-cta font-bold text-whatsapp-foreground hover:opacity-95">
            <a href={whatsappLink("Olá! Quero fazer um pedido.")} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="mr-1.5 h-4 w-4" /> WhatsApp
            </a>
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-hero text-primary-foreground">
        <div className="container mx-auto flex flex-col items-center gap-5 px-4 py-10 text-center sm:py-16">
          <img
            src={logo}
            alt="Império Doces Distribuidora"
            className="h-32 w-32 rounded-2xl object-cover shadow-glow sm:h-48 sm:w-48"
          />
          <span className="inline-flex items-center gap-2 rounded-full bg-yellow-400 px-4 py-1.5 text-xs font-extrabold uppercase tracking-wide text-red-700 shadow-md sm:text-sm">
            <BadgePercent className="h-4 w-4" /> Melhor preço da região
          </span>
          <h1 className="max-w-2xl text-3xl font-extrabold leading-[1.05] sm:text-5xl lg:text-6xl">
            Doces no atacado<br />direto da distribuidora
          </h1>
          <p className="max-w-xl text-base font-semibold text-white/95 sm:text-lg">
            Araçatuba e toda região — para comércios, padarias, bares e restaurantes.
          </p>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Button
              asChild
              size="lg"
              className="h-14 w-full bg-gradient-cta px-6 text-base font-bold text-whatsapp-foreground shadow-glow hover:opacity-95 sm:w-auto sm:px-8"
            >
              <a href={whatsappLink("Olá! Quero fazer um pedido.")} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="mr-2 h-5 w-5" /> Pedir agora
              </a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="h-14 w-full px-6 text-base font-bold sm:w-auto sm:px-8"
            >
              <a href="#catalogo">Ver catálogo</a>
            </Button>
          </div>

          <p className="inline-flex items-center gap-2 text-sm font-semibold text-white/90">
            <MapPin className="h-4 w-4" /> Araçatuba/SP e região
          </p>
        </div>
      </section>

      {/* Para quem */}
      <section className="border-b border-border bg-card">
        <div className="container mx-auto grid grid-cols-2 gap-3 px-4 py-8 sm:grid-cols-4 sm:gap-4">
          {[
            { icon: Store, label: "Comércios" },
            { icon: Croissant, label: "Padarias" },
            { icon: Beer, label: "Bares" },
            { icon: UtensilsCrossed, label: "Restaurantes" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex flex-col items-center gap-2 rounded-2xl bg-background p-4 text-center shadow-card">
              <Icon className="h-7 w-7 text-primary" />
              <span className="text-sm font-bold sm:text-base">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Catalog */}
      <section id="catalogo" className="container mx-auto py-12 sm:py-16">
        <h2 className="mb-8 text-center text-3xl font-extrabold sm:text-4xl">Catálogo</h2>

        {loading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] animate-pulse rounded-2xl bg-muted" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-border bg-card/50 p-10 text-center">
            <p className="text-lg font-semibold">Catálogo em atualização.</p>
            <Button asChild className="mt-5 bg-gradient-cta text-whatsapp-foreground">
              <a href={whatsappLink()} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="mr-2 h-4 w-4" /> Falar agora
              </a>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* Final CTA */}
      <section className="bg-gradient-hero py-12 text-center text-primary-foreground sm:py-16">
        <div className="container mx-auto">
          <h2 className="text-3xl font-extrabold sm:text-4xl">Faça seu pedido agora</h2>
          <Button
            asChild
            size="lg"
            className="mt-6 h-14 bg-white px-8 text-base font-bold text-primary hover:bg-white/90"
          >
            <a href={whatsappLink("Olá! Quero fazer um pedido.")} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="mr-2 h-5 w-5" /> Chamar no WhatsApp
            </a>
          </Button>
        </div>
      </section>

      <footer className="border-t border-border bg-card">
        <div className="container mx-auto flex flex-col items-center justify-between gap-2 py-5 text-sm text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} Império Doces — Araçatuba/SP</p>
          <Link to="/admin" className="text-xs opacity-60 hover:opacity-100">Admin</Link>
        </div>
      </footer>

      <a
        href={whatsappLink("Olá! Quero fazer um pedido.")}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Falar no WhatsApp"
        className="fixed bottom-5 right-5 z-50 grid h-14 w-14 place-items-center rounded-full bg-gradient-cta text-whatsapp-foreground shadow-glow transition-smooth hover:scale-110"
      >
        <MessageCircle className="h-7 w-7" />
      </a>
    </div>
  );
};

export default Index;
