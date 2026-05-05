import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, LogOut, Pencil, Plus, Trash2, Upload, ShieldAlert } from "lucide-react";
import { convertToWebp } from "@/lib/webp";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  sort_order: number;
}

const emptyForm = { id: "", name: "", description: "", price: "", sort_order: "0", image_url: "" };

export default function Admin() {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(true);

  // auth form
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // products
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const editing = !!form.id;

  useEffect(() => {
    document.title = "Admin — Império Doces";
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, s) => {
      setSession(s);
      if (s) checkAdmin(s.user.id);
      else { setIsAdmin(null); setChecking(false); }
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session) checkAdmin(data.session.user.id);
      else setChecking(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function checkAdmin(userId: string) {
    setChecking(true);
    const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle();
    setIsAdmin(!!data);
    setChecking(false);
    if (data) loadProducts();
  }

  async function loadProducts() {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    else setProducts((data as Product[]) ?? []);
  }

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    setAuthLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/admin` },
        });
        if (error) throw error;
        toast.success("Conta criada! Peça ao administrador para liberar seu acesso.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err: any) {
      toast.error(err.message ?? "Erro de autenticação");
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate("/");
  }

  function startEdit(p: Product) {
    setForm({
      id: p.id,
      name: p.name,
      description: p.description ?? "",
      price: String(p.price),
      sort_order: String(p.sort_order),
      image_url: p.image_url ?? "",
    });
    setImageFile(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() { setForm(emptyForm); setImageFile(null); }

  async function uploadImage(file: File): Promise<string> {
    const webp = await convertToWebp(file);
    const path = `${crypto.randomUUID()}.webp`;
    const { error } = await supabase.storage.from("product-images").upload(path, webp, {
      contentType: "image/webp",
      upsert: false,
    });
    if (error) throw error;
    const { data } = supabase.storage.from("product-images").getPublicUrl(path);
    return data.publicUrl;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Nome obrigatório");
    setSaving(true);
    try {
      let image_url = form.image_url || null;
      if (imageFile) {
        toast.info("Convertendo imagem para WEBP...");
        image_url = await uploadImage(imageFile);
      }
      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        price: Number(form.price) || 0,
        sort_order: Number(form.sort_order) || 0,
        image_url,
      };
      if (editing) {
        const { error } = await supabase.from("products").update(payload).eq("id", form.id);
        if (error) throw error;
        toast.success("Produto atualizado!");
      } else {
        const { error } = await supabase.from("products").insert(payload);
        if (error) throw error;
        toast.success("Produto adicionado!");
      }
      resetForm();
      loadProducts();
    } catch (err: any) {
      toast.error(err.message ?? "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Excluir este produto?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Produto excluído"); loadProducts(); }
  }

  // Loading
  if (checking) {
    return (
      <div className="grid min-h-screen place-items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Login screen
  if (!session) {
    return (
      <div className="grid min-h-screen place-items-center bg-gradient-hero p-4">
        <div className="w-full max-w-md rounded-2xl bg-card p-6 shadow-card sm:p-8">
          <h1 className="text-2xl font-extrabold">Painel administrativo</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "login" ? "Entre para gerenciar o catálogo." : "Crie sua conta."}
          </p>
          <form onSubmit={handleAuth} className="mt-6 space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="password">Senha</Label>
              <Input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button type="submit" className="w-full" disabled={authLoading}>
              {authLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === "login" ? "Entrar" : "Criar conta"}
            </Button>
          </form>
          <button
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
            className="mt-4 w-full text-sm text-muted-foreground hover:text-foreground"
          >
            {mode === "login" ? "Não tem conta? Criar conta" : "Já tem conta? Entrar"}
          </button>
        </div>
      </div>
    );
  }

  // Logged in but not admin
  if (!isAdmin) {
    return (
      <div className="grid min-h-screen place-items-center bg-background p-4">
        <div className="w-full max-w-md rounded-2xl bg-card p-8 text-center shadow-card">
          <ShieldAlert className="mx-auto h-12 w-12 text-destructive" />
          <h1 className="mt-4 text-xl font-bold">Acesso restrito</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sua conta ({session.user.email}) ainda não tem permissão de administrador.
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Peça ao responsável para conceder o papel <code className="rounded bg-muted px-1">admin</code> no banco de dados (tabela <code>user_roles</code>).
          </p>
          <Button onClick={handleSignOut} variant="outline" className="mt-6">
            <LogOut className="mr-2 h-4 w-4" /> Sair
          </Button>
        </div>
      </div>
    );
  }

  // Admin panel
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto flex items-center justify-between py-4">
          <div>
            <h1 className="text-xl font-extrabold sm:text-2xl">Painel administrativo</h1>
            <p className="text-xs text-muted-foreground">{session.user.email}</p>
          </div>
          <Button variant="outline" onClick={handleSignOut}><LogOut className="mr-2 h-4 w-4" /> Sair</Button>
        </div>
      </header>

      <main className="container mx-auto grid gap-8 py-8 lg:grid-cols-[420px_1fr]">
        {/* Form */}
        <section className="rounded-2xl bg-card p-6 shadow-card lg:sticky lg:top-6 lg:self-start">
          <h2 className="text-lg font-bold">{editing ? "Editar produto" : "Novo produto"}</h2>
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
              <Label htmlFor="name">Nome *</Label>
              <Input id="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="desc">Descrição</Label>
              <Textarea id="desc" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="price">Preço (R$)</Label>
                <Input id="price" type="number" step="0.01" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="Deixe em branco para produto sem preço" />
              </div>
              <div>
                <Label htmlFor="order">Ordem</Label>
                <Input id="order" type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} />
              </div>
            </div>
            <div>
              <Label htmlFor="img">Foto (será convertida para WEBP)</Label>
              <Input id="img" type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] ?? null)} />
              {(imageFile || form.image_url) && (
                <div className="mt-2 overflow-hidden rounded-lg border border-border">
                  <img
                    src={imageFile ? URL.createObjectURL(imageFile) : form.image_url}
                    alt="preview"
                    className="h-32 w-full object-cover"
                  />
                </div>
              )}
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={saving} className="flex-1">
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : editing ? <Pencil className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
                {editing ? "Salvar" : "Adicionar"}
              </Button>
              {editing && <Button type="button" variant="outline" onClick={resetForm}>Cancelar</Button>}
            </div>
          </form>
        </section>

        {/* List */}
        <section>
          <h2 className="mb-4 text-lg font-bold">Produtos ({products.length})</h2>
          {products.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-border p-12 text-center text-muted-foreground">
              <Upload className="mx-auto h-8 w-8" />
              <p className="mt-2">Nenhum produto cadastrado.</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {products.map((p) => (
                <div key={p.id} className="flex gap-3 rounded-xl bg-card p-3 shadow-card">
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                    {p.image_url && <img src={p.image_url} alt={p.name} className="h-full w-full object-cover" />}
                  </div>
                  <div className="flex flex-1 flex-col">
                    <p className="line-clamp-1 font-bold">{p.name}</p>
                    <p className="text-sm font-bold text-primary">R$ {p.price.toFixed(2).replace(".", ",")}</p>
                    {p.description && <p className="line-clamp-2 text-xs text-muted-foreground">{p.description}</p>}
                    <div className="mt-auto flex gap-1 pt-2">
                      <Button size="sm" variant="outline" onClick={() => startEdit(p)}><Pencil className="h-3 w-3" /></Button>
                      <Button size="sm" variant="outline" onClick={() => handleDelete(p.id)}><Trash2 className="h-3 w-3" /></Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
