import { pipeline } from "@huggingface/transformers";

let cachedGenerator: Awaited<ReturnType<typeof pipeline>> | null = null;

async function getGenerator() {
  if (cachedGenerator) return cachedGenerator;

  const hasWebGpu = typeof navigator !== "undefined" && "gpu" in navigator;
  self.postMessage({
    type: "progress",
    msg: hasWebGpu
      ? "Cargando modelo IA 4-bit (WebGPU)..."
      : "Cargando modelo IA 4-bit (CPU WASM)...",
    pct: 15,
  });

  const pipe = await pipeline(
    "text-generation",
    "onnx-community/Qwen2.5-0.5B-Instruct",
    {
      dtype: "q4",
      device: hasWebGpu ? "webgpu" : "wasm",
      progress_callback: (info: { status?: string; progress?: number }) => {
        if (info.status === "progress" && typeof info.progress === "number") {
          const pct = Math.min(78, Math.max(15, Math.round(info.progress * 0.78)));
          self.postMessage({
            type: "progress",
            msg: `Descargando modelo IA 4-bit (${Math.round(info.progress)}%)...`,
            pct,
          });
        } else if (info.status === "done") {
          self.postMessage({
            type: "progress",
            msg: "Inicializando motor ONNX en memoria...",
            pct: 82,
          });
        }
      },
    }
  );

  cachedGenerator = pipe;
  return pipe;
}

self.onmessage = async (e: MessageEvent<{ prompt: string; maxTokens: number }>) => {
  try {
    const generator = await getGenerator();
    self.postMessage({
      type: "progress",
      msg: "Generando respuesta con IA local...",
      pct: 90,
    });

    const out = await (generator as unknown as (
      msgs: { role: string; content: string }[],
      opts: { max_new_tokens: number; do_sample: boolean }
    ) => Promise<unknown>)(
      [{ role: "user", content: e.data.prompt }],
      { max_new_tokens: e.data.maxTokens, do_sample: false }
    );

    const first = Array.isArray(out) ? out[0] : out;
    const generated = (first as { generated_text?: unknown })?.generated_text;
    let text = "";
    if (Array.isArray(generated)) {
      const last = generated[generated.length - 1] as { content?: string };
      text = last?.content?.trim() || "";
    } else {
      text = String(generated || "").trim();
    }

    self.postMessage({ type: "done", text });
  } catch (err) {
    self.postMessage({
      type: "error",
      error: err instanceof Error ? err.message : "Error ejecutando IA local.",
    });
  }
};
