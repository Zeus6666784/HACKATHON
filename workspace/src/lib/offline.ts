const KEY = "cc_sync_queue_v1";

export type QueueItem = {
  id: string;
  method: "POST" | "PATCH";
  url: string;
  body: unknown;
  label: string;
  createdAt: string;
};

function read(): QueueItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]") as QueueItem[];
  } catch {
    return [];
  }
}

function write(items: QueueItem[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
}

export function enqueue(item: Omit<QueueItem, "id" | "createdAt">) {
  const items = read();
  items.push({
    ...item,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  });
  write(items);
  return items;
}

export function listQueue() {
  return read();
}

export async function flushQueue() {
  const items = read();
  const remaining: QueueItem[] = [];
  for (const item of items) {
    try {
      const res = await fetch(item.url, {
        method: item.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item.body),
      });
      if (!res.ok) remaining.push(item);
    } catch {
      remaining.push(item);
    }
  }
  write(remaining);
  return remaining;
}

export async function postWithQueue(url: string, body: unknown, label: string) {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    enqueue({ method: "POST", url, body, label });
    return { queued: true as const };
  }
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { queued: false as const, ok: false, error: err };
    }
    const data = await res.json();
    return { queued: false as const, ok: true, data };
  } catch {
    enqueue({ method: "POST", url, body, label });
    return { queued: true as const };
  }
}
