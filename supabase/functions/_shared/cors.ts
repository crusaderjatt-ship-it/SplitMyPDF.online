const defaultAllowedOrigins = [
  "https://splitmypdf.online",
  "https://www.splitmypdf.online",
  "http://localhost:8080",
  "http://127.0.0.1:8080",
];

const getAllowedOrigins = () =>
  (Deno.env.get("ALLOWED_ORIGINS") || defaultAllowedOrigins.join(","))
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

export const getCorsHeaders = (req: Request) => {
  const origin = req.headers.get("Origin");
  const allowedOrigins = getAllowedOrigins();
  const allowedOrigin = origin && allowedOrigins.includes(origin) ? origin : allowedOrigins[0];

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
};

export const rejectDisallowedOrigin = (req: Request) => {
  const origin = req.headers.get("Origin");
  if (!origin) return null;
  if (getAllowedOrigins().includes(origin)) return null;

  return new Response(JSON.stringify({ error: "Origin not allowed" }), {
    headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    status: 403,
  });
};

export const assertOwnedPath = (path: string, userId: string) => {
  if (!path || path.includes("..") || !path.startsWith(`${userId}/`)) {
    throw new Error("Requested file path is not allowed");
  }
};

export const sanitizePdfFileName = (fileName: string, fallback: string) => {
  const cleaned = fileName
    .replace(/[/\\]/g, "-")
    .replace(/[^a-zA-Z0-9._ -]/g, "")
    .trim();
  const safeName = cleaned || fallback;
  return safeName.toLowerCase().endsWith(".pdf") ? safeName : `${safeName}.pdf`;
};
