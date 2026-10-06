const HTTP_PROTOCOLS = new Set(["http:", "https:"]);

export const isHttpUrlLike = (value: string): boolean => {
  const trimmed = value.trim();

  if (!trimmed) {
    return false;
  }

  try {
    const parsed = new URL(trimmed);
    return HTTP_PROTOCOLS.has(parsed.protocol);
  } catch {
    return false;
  }
};
