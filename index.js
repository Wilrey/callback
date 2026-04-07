const clientId = "f6408f25-89c1-427d-ba0f-c2d74922366f";
const redirectUri = window.location.origin + window.location.pathname;
const environment = "mypurecloud.ie";

const loginBtn = document.getElementById("loginBtn");
const sendBtn = document.getElementById("sendBtn");
const statusDiv = document.getElementById("status");
const appSection = document.getElementById("appSection");
const authSection = document.getElementById("authSection");

const conversationInput = document.getElementById("conversationId");
const tagInput = document.getElementById("externalTag");

// =========================
// Utils PKCE
// =========================
function generateRandomString(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

async function sha256(plain) {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return window.crypto.subtle.digest('SHA-256', data);
}

function base64urlencode(buffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// =========================
// OAuth Login
// =========================
loginBtn.addEventListener("click", async () => {
  const verifier = generateRandomString(64);
  const challengeBuffer = await sha256(verifier);
  const challenge = base64urlencode(challengeBuffer);

  sessionStorage.setItem("pkce_verifier", verifier);

  const authUrl =
    `https://login.${environment}/oauth/authorize` +
    `?response_type=code` +
    `&client_id=${clientId}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&code_challenge=${challenge}` +
    `&code_challenge_method=S256`;

  window.location.href = authUrl;
});

// =========================
// Handle redirect + token
// =========================
async function handleRedirect() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");

  if (!code) return;

  const verifier = sessionStorage.getItem("pkce_verifier");

  const response = await fetch(`https://login.${environment}/oauth/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: clientId,
      code: code,
      redirect_uri: redirectUri,
      code_verifier: verifier
    })
  });

  const data = await response.json();
  sessionStorage.setItem("access_token", data.access_token);

  window.history.replaceState({}, document.title, redirectUri);
}

// =========================
// Load app
// =========================
function loadApp() {
  const token = sessionStorage.getItem("access_token");

  if (token) {
    authSection.style.display = "none";
    appSection.style.display = "block";

    // leer conversationId de URL si viene
    const params = new URLSearchParams(window.location.search);
    const convId = params.get("conversationId");
    if (convId) {
      conversationInput.value = convId;
    }
  }
}

// =========================
// Send PUT externalTag
// =========================
sendBtn.addEventListener("click", async () => {
  const token = sessionStorage.getItem("access_token");
  const conversationId = conversationInput.value;
  const externalTag = tagInput.value;

  if (!conversationId || !externalTag) {
    statusDiv.innerText = "Missing data";
    return;
  }

  const url = `https://api.${environment}/api/v2/conversations/${conversationId}/tags`;

  try {
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        externalTag: externalTag
      })
    });

    if (response.ok) {
      statusDiv.innerText = "Tag updated successfully";
    } else {
      const err = await response.text();
      statusDiv.innerText = "Error: " + err;
    }
  } catch (error) {
    statusDiv.innerText = "Request failed";
  }
});

// =========================
// Init
// =========================
(async () => {
  await handleRedirect();
  loadApp();
})();
