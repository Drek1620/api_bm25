import { buildBM25SparseVector } from "@/lib/bm25";

type BM25RequestBody = {
  Busqueda_Libre?: unknown;
  totalDocuments?: unknown;
  avgDocLength?: unknown;
  documentFrequencies?: unknown;
  k1?: unknown;
  b?: unknown;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseRequestBody(body: BM25RequestBody) {
  if (typeof body.Busqueda_Libre !== "string" || body.Busqueda_Libre.trim() === "") {
    throw new Error("'Busqueda_Libre' debe ser una cadena de texto no vacia.");
  }

  const documentFrequencies: Record<string, number> = {};
  if (isRecord(body.documentFrequencies)) {
    for (const [term, value] of Object.entries(body.documentFrequencies)) {
      if (typeof value === "number" && Number.isFinite(value) && value >= 0) {
        documentFrequencies[term.toLowerCase()] = value;
      }
    }
  }

  return {
    Busqueda_Libre: body.Busqueda_Libre,
    totalDocuments:
      typeof body.totalDocuments === "number" && Number.isFinite(body.totalDocuments)
        ? body.totalDocuments
        : undefined,
    avgDocLength:
      typeof body.avgDocLength === "number" && Number.isFinite(body.avgDocLength)
        ? body.avgDocLength
        : undefined,
    documentFrequencies,
    k1: typeof body.k1 === "number" && Number.isFinite(body.k1) ? body.k1 : undefined,
    b: typeof body.b === "number" && Number.isFinite(body.b) ? body.b : undefined,
  };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as BM25RequestBody;
    const parsedInput = parseRequestBody(body);
    const result = buildBM25SparseVector(parsedInput);

    return Response.json(result, { status: 200 });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "No se pudo procesar la solicitud BM25.";

    return Response.json({ error: message }, { status: 400 });
  }
}
