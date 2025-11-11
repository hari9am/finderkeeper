import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    // Try to parse JSON error responses and present a friendlier message.
    try {
      const parsed = JSON.parse(text);
      // If the response follows our server error shape { message, issues }
      if (parsed && typeof parsed === "object") {
        const base = parsed.message || `Request failed with status ${res.status}`;
        if (Array.isArray(parsed.issues) && parsed.issues.length > 0) {
          // Collect field paths from validation issues if present
          const fields = parsed.issues
            .map((iss: any) => (Array.isArray(iss.path) ? iss.path.join(".") : undefined))
            .filter(Boolean);
          if (fields.length > 0) {
            throw new Error(`${base}. Please check: ${fields.join(", ")}`);
          }

          // Fallback: concatenate issue messages
          const issueMsgs = parsed.issues.map((iss: any) => iss.message || JSON.stringify(iss)).join("; ");
          throw new Error(`${base}. ${issueMsgs}`);
        }

        // If no structured issues, throw the base message
        throw new Error(base);
      }
    } catch {
      // Not JSON or parsing failed - fall back to raw text
    }

    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey.join("/") as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
