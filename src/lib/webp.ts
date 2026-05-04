// Convert any image File to a WEBP File (client-side, lossy quality 0.82)
// Resizes to max 1200px on the longest edge to keep things light.
export async function convertToWebp(file: File, quality = 0.82, maxSize = 1200): Promise<File> {
  try {
    // Timeout para evitar travamento
    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error("Timeout na conversão")), 10000)
    );

    const dataUrl = await Promise.race([
      new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      }),
      timeoutPromise
    ]);

    const img = await Promise.race([
      new Promise<HTMLImageElement>((resolve, reject) => {
        const i = new Image();
        i.onload = () => resolve(i);
        i.onerror = reject;
        i.src = dataUrl;
      }),
      timeoutPromise
    ]);

    let { width, height } = img;
    if (width > maxSize || height > maxSize) {
      const ratio = Math.min(maxSize / width, maxSize / height);
      width = Math.round(width * ratio);
      height = Math.round(height * ratio);
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas não suportado");
    ctx.drawImage(img, 0, 0, width, height);

    const blob: Blob = await Promise.race([
      new Promise<Blob>((resolve, reject) =>
        canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Falha ao converter"))), "image/webp", quality)
      ),
      timeoutPromise
    ]);

    const baseName = file.name.replace(/\.[^.]+$/, "");
    return new File([blob], `${baseName}.webp`, { type: "image/webp" });
  } catch (error) {
    console.error("Erro na conversão WEBP:", error);
    // Se falhar, retorna o arquivo original
    return file;
  }
}
