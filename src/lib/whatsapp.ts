export const WHATSAPP_NUMBER = "5518991913165";

export function whatsappLink(message?: string) {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export function productMessage(name: string, price: number) {
  return `Olá! Tenho interesse no produto *${name}* (R$ ${price.toFixed(2).replace(".", ",")}). Pode me passar mais informações?`;
}
