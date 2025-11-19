export default async function getUser() {
  try {
    const res = await fetch("/api/auth/user", {
      method: "POST"
    });

    if (!res.ok)
      return null;

    const data = await res.json();
    return data;

  } catch (err) {
    console.log("Error at /app/conn/conn.js:");
    console.log(err);
    return null;
  }
}
