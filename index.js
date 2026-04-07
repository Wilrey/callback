const clientId = "f6408f25-89c1-427d-ba0f-c2d74922366f";
const environment = "mypurecloud.ie";
const redirectUri = window.location.origin + window.location.pathname;

const conversationIdInput = document.getElementById("conversationId");
const externalTagInput = document.getElementById("externalTag");
const runBtn = document.getElementById("runBtn");
const statusDiv = document.getElementById("status");

function randomString(length) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

async function sha256(value) {
  const data = new TextEncoder().encode(value);
  return crypto.subtle.digest("SHA-256", data);
}

function base64UrlEncode(buffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function loginIfNeeded() {
  const token = sessionStorage.getItem("access_token");
  if (token) return token;

  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");

  if (!code) {
    const verifier = randomString(64);
    sessionStorage.setItem("pkce_verifier", verifier);

    const challenge = base64UrlEncode(await sha256(verifier));

    const authUrl =
      `https://login.${environment}/oauth/authorize` +
      `?response_type=code` +
      `&client_id=${encodeURIComponent(clientId)}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&code_challenge=${encodeURIComponent(challenge)}` +
      `&code_challenge_method=S256`;

    window.location.href = authUrl;
    return null;
  }

  const verifier = sessionStorage.getItem("pkce_verifier");

  const response = await fetch(`https://login.${environment}/oauth/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: clientId,
      code,
      redirect_uri: redirectUri,
      code_verifier: verifier
    })
  });

  const data = await response.json();

  if (!data.access_token) {
    throw new Error("No se pudo obtener el token");
  }

  sessionStorage.setItem("access_token", data.access_token);
  window.history.replaceState({}, document.title, redirectUri);

  return data.access_token;
}

runBtn.addEventListener("click", async () => {
  try {
    statusDiv.textContent = "Procesando...";

    const token = await loginIfNeeded();
    if (!token) return;

    const conversationId = conversationIdInput.value.trim();
    const externalTag = externalTagInput.value.trim();

    if (!conversationId || !externalTag) {
      statusDiv.textContent = "Debes informar conversationId y externalTag";
      return;
    }

    const response = await fetch(
      `https://api.${environment}/api/v2/conversations/${conversationId}/tags`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ externalTag })
      }
    );

    if (response.ok) {
      statusDiv.textContent = "External tag actualizado";
    } else {
      statusDiv.textContent = `Error ${response.status}`;
    }
  } catch (e) {
    statusDiv.textContent = e.message;
  }
});
