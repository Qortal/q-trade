/**
 * Parses data messages from Qortal WebSockets.
 *
 * The cross-chain sockets use text frames for their keepalive response
 * (`pong`), while trade updates are JSON. Control frames must not reach the
 * JSON parser.
 */
export const parseWebSocketJson = <T>(data: unknown): T | null => {
  if (data === "pong") {
    return null;
  }

  if (typeof data !== "string") {
    console.warn("Ignoring non-text WebSocket message.");
    return null;
  }

  try {
    return JSON.parse(data) as T;
  } catch {
    console.warn("Ignoring unexpected non-JSON WebSocket message.");
    return null;
  }
};
