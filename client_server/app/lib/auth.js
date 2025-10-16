const SECRET = process.env.AUTH_SECRET || "dev-secret";

function strToBuf(str) {
  return new TextEncoder().encode(str);
}

async function getKey() {
  return crypto.subtle.importKey(
    "raw",
    strToBuf(SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export async function signToken(username, role, userId, expires_in_minutes = 60) {
  const expiry = Date.now() + expires_in_minutes * 60_000;
  const payload = `${username}|${role}|${userId}|${expiry}`;
  const key = await getKey();
  const sigBuf = await crypto.subtle.sign("HMAC", key, strToBuf(payload));
  const sigHex = Array.from(new Uint8Array(sigBuf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return `${payload}|${sigHex}`;
}

export async function verifyToken(token) {
  const [username, role, userId, expiry, sig] = token.split("|");
  if (!username || !role || !userId || !expiry || !sig) return null;
  if (Date.now() > parseInt(expiry)) return null;

  const payload = `${username}|${role}|${userId}|${expiry}`;
  const key = await getKey();
  const sigBuf = new Uint8Array(
    sig.match(/.{1,2}/g).map((byte) => parseInt(byte, 16))
  );

  const ok = await crypto.subtle.verify("HMAC", key, sigBuf, strToBuf(payload));
  if (!ok) return null;

  return { username, role, userId };
}
