import OpenAI from "openai";

export type Embedding = number[];

function getOpenAI(): OpenAI | undefined {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.warn("[AI DEBUG] OPENAI_API_KEY not configured - AI features disabled");
    return undefined;
  }
  if (!apiKey.startsWith('sk-')) {
    console.warn("[AI DEBUG] Invalid OPENAI_API_KEY format - AI features disabled");
    return undefined;
  }
  return new OpenAI({ apiKey });
}

export async function captionImageIfPublic(imageUrl?: string): Promise<string | undefined> {
  if (!imageUrl) return undefined;
  
  // Support both public URLs and data URLs (base64 images)
  if (!/^(https?:\/\/|data:image\/)/i.test(imageUrl)) {
    console.log(`[IMAGE DEBUG] Skipping image captioning - not a public URL or data URL: ${imageUrl.substring(0, 50)}...`);
    return undefined;
  }
  
  const openai = getOpenAI();
  if (!openai) {
    console.log("[IMAGE DEBUG] OpenAI client not available - check OPENAI_API_KEY");
    return undefined;
  }
  
  try {
    console.log(`[IMAGE DEBUG] Attempting to caption image: ${imageUrl.substring(0, 50)}...`);
    const resp = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Describe the main visible object briefly in one sentence, focusing on identifying features like text, colors, shapes, and type of item." },
        {
          role: "user",
          content: [
            { type: "text", text: "Caption this image succinctly, focusing on identifying features" },
            { type: "image_url", image_url: { url: imageUrl } },
          ],
        },
      ],
    });
    const text = resp.choices?.[0]?.message?.content?.trim();
    if (!text) {
      console.log("[IMAGE DEBUG] No caption text returned from OpenAI");
      return undefined;
    }
    console.log(`[IMAGE DEBUG] Generated caption: ${text}`);
    return text;
  } catch (error: any) {
    if (error?.status === 401) {
      console.error("[IMAGE DEBUG] OpenAI API authentication failed - check API key");
    } else if (error?.status === 429) {
      console.error("[IMAGE DEBUG] OpenAI API rate limit exceeded");
    } else {
      console.error("[IMAGE DEBUG] Error captioning image:", error?.message || error);
    }
    return undefined;
  }
}

export async function embedText(text: string): Promise<Embedding | undefined> {
  const openai = getOpenAI();
  if (!openai) {
    console.log("[EMBEDDING DEBUG] OpenAI client not available for embeddings");
    return undefined;
  }
  
  const content = (text || "").slice(0, 8000);
  console.log(`[EMBEDDING DEBUG] Creating embedding for text (${content.length} chars): ${content.substring(0, 100)}...`);
  
  try {
    const resp = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: content,
    });
    const vec = resp.data?.[0]?.embedding as number[] | undefined;
    console.log(`[EMBEDDING DEBUG] Embedding API response: ${vec ? 'success' : 'failed'} (vector length: ${vec?.length || 0})`);
    return vec;
  } catch (error: any) {
    if (error?.status === 401) {
      console.error("[EMBEDDING DEBUG] OpenAI API authentication failed - check API key");
    } else if (error?.status === 429) {
      console.error("[EMBEDDING DEBUG] OpenAI API rate limit exceeded");
    } else {
      console.error("[EMBEDDING DEBUG] Error creating embedding:", error?.message || error);
    }
    return undefined;
  }
}

export function cosineSimilarity(a?: Embedding, b?: Embedding): number {
  if (!a || !b) return 0;
  let dot = 0, na = 0, nb = 0;
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) {
    const x = a[i];
    const y = b[i];
    dot += x * y;
    na += x * x;
    nb += y * y;
  }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

export async function buildItemEmbedding(input: {
  title?: string;
  description?: string;
  category?: string;
  location?: string;
  imageUrl?: string;
}): Promise<Embedding | undefined> {
  const parts: string[] = [];
  if (input.title) parts.push(`Title: ${input.title}`);
  if (input.description) parts.push(`Description: ${input.description}`);
  if (input.category) parts.push(`Category: ${input.category}`);
  if (input.location) parts.push(`Location: ${input.location}`);
  
  console.log(`[EMBEDDING DEBUG] Building embedding for item: "${input.title}"`);
  console.log(`[EMBEDDING DEBUG] Image URL: ${input.imageUrl ? input.imageUrl.substring(0, 50) + '...' : 'none'}`);
  
  const caption = await captionImageIfPublic(input.imageUrl);
  if (caption) {
    parts.push(`Image: ${caption}`);
    console.log(`[EMBEDDING DEBUG] Added image caption: ${caption}`);
  } else {
    console.log(`[EMBEDDING DEBUG] No image caption generated`);
  }
  
  const text = parts.join("\n");
  console.log(`[EMBEDDING DEBUG] Final embedding text: ${text}`);
  
  const embedding = await embedText(text);
  console.log(`[EMBEDDING DEBUG] Embedding generated: ${embedding ? 'success' : 'failed'} (length: ${embedding?.length || 0})`);
  
  return embedding;
}
