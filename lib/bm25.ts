type DocumentFrequencies = Record<string, number>;

export type BM25BuildInput = {
  Busqueda_Libre: string;
  totalDocuments?: number;
  avgDocLength?: number;
  documentFrequencies?: DocumentFrequencies;
  k1?: number;
  b?: number;
};

export type BM25VectorItem = {
  term: string;
  tf: number;
  df: number | null;
  idf: number;
  weight: number;
  index: number;
};

export type BM25BuildOutput = {
  sparseVector: {
    indices: number[];
    values: number[];
  };
  items: BM25VectorItem[];
  normalizedText: string;
  docLength: number;
  config: {
    k1: number;
    b: number;
    totalDocuments: number | null;
    avgDocLength: number;
    usedFallbackIdf: boolean;
  };
};

const DEFAULT_K1 = 1.5;
const DEFAULT_B = 0.75;
const DEFAULT_AVG_DOC_LENGTH = 100;

export function normalizeAndTokenize(text: string): string[] {
  return text
    .toLowerCase()
    .match(/[\p{L}\p{N}]+/gu)
    ?.filter(Boolean) ?? [];
}

function fnv1a32(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

function computeIdf(df: number, totalDocuments: number): number {
  const safeDf = Math.max(0, Math.min(df, totalDocuments));
  return Math.log(1 + (totalDocuments - safeDf + 0.5) / (safeDf + 0.5));
}

function bm25Weight(
  tf: number,
  idf: number,
  docLength: number,
  avgDocLength: number,
  k1: number,
  b: number
): number {
  const denominator = tf + k1 * (1 - b + b * (docLength / avgDocLength));
  return idf * ((tf * (k1 + 1)) / denominator);
}

export function buildBM25SparseVector(input: BM25BuildInput): BM25BuildOutput {
  const tokens = normalizeAndTokenize(input.Busqueda_Libre ?? "");
  const tfMap = new Map<string, number>();

  for (const token of tokens) {
    tfMap.set(token, (tfMap.get(token) ?? 0) + 1);
  }

  const k1 =
    typeof input.k1 === "number" && Number.isFinite(input.k1) && input.k1 > 0
      ? input.k1
      : DEFAULT_K1;
  const b =
    typeof input.b === "number" && Number.isFinite(input.b) && input.b >= 0 && input.b <= 1
      ? input.b
      : DEFAULT_B;
  const avgDocLength =
    typeof input.avgDocLength === "number" && Number.isFinite(input.avgDocLength) && input.avgDocLength > 0
      ? input.avgDocLength
      : DEFAULT_AVG_DOC_LENGTH;
  const totalDocuments =
    typeof input.totalDocuments === "number" &&
    Number.isFinite(input.totalDocuments) &&
    input.totalDocuments > 0
      ? input.totalDocuments
      : null;
  const documentFrequencies = input.documentFrequencies ?? {};

  let usedFallbackIdf = totalDocuments === null;
  const docLength = tokens.length;

  const items: BM25VectorItem[] = [];

  for (const [term, tf] of tfMap.entries()) {
    const dfRaw = documentFrequencies[term];
    const df = typeof dfRaw === "number" && Number.isFinite(dfRaw) ? dfRaw : null;
    const usesFallbackForTerm = totalDocuments === null || df === null;

    if (usesFallbackForTerm) {
      usedFallbackIdf = true;
    }

    const idf = usesFallbackForTerm ? 1 : computeIdf(df, totalDocuments);
    const weight =
      docLength > 0
        ? bm25Weight(tf, idf, docLength, avgDocLength, k1, b)
        : 0;

    items.push({
      term,
      tf,
      df,
      idf,
      weight,
      index: fnv1a32(term),
    });
  }

  items.sort((a, bItem) => a.index - bItem.index);

  return {
    sparseVector: {
      indices: items.map((item) => item.index),
      values: items.map((item) => item.weight),
    },
    items,
    normalizedText: tokens.join(" "),
    docLength,
    config: {
      k1,
      b,
      totalDocuments,
      avgDocLength,
      usedFallbackIdf,
    },
  };
}
