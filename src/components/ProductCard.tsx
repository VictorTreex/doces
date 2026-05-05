import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { productMessage, whatsappLink } from "@/lib/whatsapp";

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  image_url: string | null;
}

const PLACEHOLDER =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'><rect width='400' height='300' fill='%23fce8d8'/><text x='50%' y='50%' font-family='sans-serif' font-size='20' fill='%23b85c2e' text-anchor='middle' dominant-baseline='middle'>Sem imagem</text></svg>";

export function ProductCard({ product }: { product: Product }) {
  const hasPrice = product.price !== null && product.price !== undefined;
  const formatted = hasPrice ? product.price!.toFixed(2).replace(".", ",") : null;
  
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl bg-gradient-card shadow-card transition-smooth hover:shadow-card-hover hover:-translate-y-1">
      <div className="aspect-square w-full overflow-hidden bg-muted">
        <img
          src={product.image_url || PLACEHOLDER}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-smooth group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
        <div className="flex-1">
          <h3 className="text-base font-bold leading-tight sm:text-lg">{product.name}</h3>
          {product.description && (
            <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">{product.description}</p>
          )}
        </div>
        {hasPrice ? (
          <div className="flex items-baseline gap-1">
            <span className="text-xs font-semibold text-muted-foreground">R$</span>
            <span className="text-2xl font-extrabold text-primary">{formatted}</span>
          </div>
        ) : null}
        <Button
          asChild
          size="lg"
          className="w-full bg-gradient-cta font-bold text-whatsapp-foreground hover:opacity-95"
        >
          <a
            href={whatsappLink(productMessage(product.name, hasPrice ? product.price! : 0))}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle className="mr-2 h-5 w-5" /> Pedir agora
          </a>
        </Button>
      </div>
    </article>
  );
}
