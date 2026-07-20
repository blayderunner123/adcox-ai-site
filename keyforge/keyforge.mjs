const UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWERCASE = "abcdefghijklmnopqrstuvwxyz";
const NUMBERS = "0123456789";
const SYMBOLS = "@#$%&*!?";
const FULL_ALPHABET = `${UPPERCASE}${LOWERCASE}${NUMBERS}${SYMBOLS}`;

export const PBKDF2_ITERATIONS = 600_000;

export function createRandomMasterKey() {
  if (!globalThis.crypto?.getRandomValues) {
    throw new Error("Secure random generation is unavailable.");
  }

  const bytes = globalThis.crypto.getRandomValues(new Uint8Array(32));
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

/**
 * Derive a deterministic, policy-compliant password using Web Crypto.
 *
 * @param {{ masterKey: string; context: string; rotationVersion: string; length: number }} input
 */
export async function derivePassword({ masterKey, context, rotationVersion, length }) {
  if (!globalThis.crypto?.subtle) {
    throw new Error("Web Crypto is unavailable in this context.");
  }

  const encoder = new TextEncoder();
  const normalizedContext = context.trim().toLowerCase();
  const keyMaterial = await globalThis.crypto.subtle.importKey(
    "raw",
    encoder.encode(masterKey),
    "PBKDF2",
    false,
    ["deriveKey"],
  );

  const hmacKey = await globalThis.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      iterations: PBKDF2_ITERATIONS,
      salt: encoder.encode(`adcox.ai|keyforge|v1|${normalizedContext}`),
    },
    keyMaterial,
    { name: "HMAC", hash: "SHA-256", length: 256 },
    false,
    ["sign"],
  );

  const domain = [
    "adcox.ai-keyforge",
    "generator-v1",
    normalizedContext,
    rotationVersion.trim(),
    String(length),
    "upper+lower+number+symbol",
  ].join("\u001f");

  let counter = 0;
  let pool = new Uint8Array(0);
  let poolIndex = 0;

  async function nextByte() {
    if (poolIndex >= pool.length) {
      const block = await globalThis.crypto.subtle.sign(
        "HMAC",
        hmacKey,
        encoder.encode(`${domain}\u001f${counter}`),
      );
      pool = new Uint8Array(block);
      poolIndex = 0;
      counter += 1;
    }

    const value = pool[poolIndex];
    poolIndex += 1;
    return value;
  }

  async function unbiasedIndex(size) {
    const limit = Math.floor(256 / size) * size;
    let value = await nextByte();
    while (value >= limit) value = await nextByte();
    return value % size;
  }

  async function pickFrom(alphabet) {
    return alphabet[await unbiasedIndex(alphabet.length)];
  }

  const characters = [
    await pickFrom(UPPERCASE),
    await pickFrom(LOWERCASE),
    await pickFrom(NUMBERS),
    await pickFrom(SYMBOLS),
  ];

  while (characters.length < length) {
    characters.push(await pickFrom(FULL_ALPHABET));
  }

  for (let index = characters.length - 1; index > 0; index -= 1) {
    const swapIndex = await unbiasedIndex(index + 1);
    [characters[index], characters[swapIndex]] = [characters[swapIndex], characters[index]];
  }

  return characters.join("");
}

export function policyMatches(password) {
  return {
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    symbol: /[@#$%&*!?]/.test(password),
  };
}

async function copyTextToClipboard(value) {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    const temporary = document.createElement("textarea");
    temporary.value = value;
    temporary.setAttribute("readonly", "");
    temporary.style.position = "fixed";
    temporary.style.opacity = "0";
    document.body.appendChild(temporary);
    temporary.select();
    const copied = document.execCommand("copy");
    temporary.remove();
    return copied;
  }
}

function initializeInterface() {
  const form = document.getElementById("generator-form");
  if (!form) return;

  const masterKey = document.getElementById("master-key");
  const context = document.getElementById("context");
  const rotationVersion = document.getElementById("rotation-version");
  const length = document.getElementById("password-length");
  const output = document.getElementById("generated-password");
  const resultLength = document.getElementById("result-length");
  const statusMessage = document.getElementById("status-message");
  const generateButton = document.getElementById("generate-password");
  const generateLabel = generateButton.querySelector("span");
  const createMasterKeyButton = document.getElementById("create-master-key");
  const toggleMasterKeyButton = document.getElementById("toggle-master-key");
  const copyButton = document.getElementById("copy-password");
  const copyLabel = copyButton.querySelector("span");
  const inputWrap = masterKey.closest(".input-wrap");
  const policyElements = new Map(
    [...document.querySelectorAll("[data-policy]")].map((element) => [element.dataset.policy, element]),
  );

  let copyTimer = null;

  function setStatus(message) {
    statusMessage.textContent = message;
  }

  function setFieldError(input, errorId, message) {
    const error = document.getElementById(errorId);
    const wrap = input === masterKey ? inputWrap : input;
    const hasError = Boolean(message);

    error.textContent = message || "";
    error.hidden = !hasError;
    input.setAttribute("aria-invalid", String(hasError));
    wrap.classList.toggle("has-error", hasError);
  }

  function resetPolicy() {
    for (const element of policyElements.values()) {
      element.classList.remove("passes");
      element.querySelector(".checkmark").textContent = "·";
    }
  }

  function renderPolicy(password) {
    const matches = policyMatches(password);
    for (const [key, element] of policyElements) {
      const passes = Boolean(password && matches[key]);
      element.classList.toggle("passes", passes);
      element.querySelector(".checkmark").textContent = passes ? "✓" : "·";
    }
  }

  function invalidateResult(message) {
    output.value = "";
    resultLength.textContent = "Awaiting input";
    copyButton.disabled = true;
    copyButton.classList.remove("is-copied");
    copyLabel.textContent = "Copy";
    resetPolicy();
    setStatus(message);
  }

  function validate() {
    let valid = true;

    if (masterKey.value.length < 16) {
      setFieldError(masterKey, "master-key-error", "Use a master key of at least 16 characters.");
      valid = false;
    } else {
      setFieldError(masterKey, "master-key-error", "");
    }

    if (!context.value.trim()) {
      setFieldError(context, "context-error", "Enter the account or system this password belongs to.");
      valid = false;
    } else {
      setFieldError(context, "context-error", "");
    }

    if (!/^\d+$/.test(rotationVersion.value) || Number(rotationVersion.value) < 1) {
      setFieldError(rotationVersion, "rotation-version-error", "Use a whole-number version of 1 or greater.");
      valid = false;
    } else {
      setFieldError(rotationVersion, "rotation-version-error", "");
    }

    return valid;
  }

  masterKey.addEventListener("input", () => {
    setFieldError(masterKey, "master-key-error", "");
    invalidateResult("Master key changed. Generate a fresh result.");
  });

  context.addEventListener("input", () => {
    setFieldError(context, "context-error", "");
    invalidateResult("Context changed. Generate a fresh result.");
  });

  rotationVersion.addEventListener("input", () => {
    setFieldError(rotationVersion, "rotation-version-error", "");
    invalidateResult("Rotation version changed. Generate a fresh result.");
  });

  length.addEventListener("change", () => {
    invalidateResult("Length changed. Generate a fresh result.");
  });

  toggleMasterKeyButton.addEventListener("click", () => {
    const reveal = masterKey.type === "password";
    masterKey.type = reveal ? "text" : "password";
    toggleMasterKeyButton.setAttribute("aria-label", reveal ? "Hide master key" : "Show master key");
    toggleMasterKeyButton.title = reveal ? "Hide master key" : "Show master key";
    toggleMasterKeyButton.classList.toggle("is-revealed", reveal);
  });

  createMasterKeyButton.addEventListener("click", async () => {
    try {
      const generatedKey = createRandomMasterKey();
      masterKey.value = generatedKey;
      masterKey.type = "text";
      toggleMasterKeyButton.setAttribute("aria-label", "Hide master key");
      toggleMasterKeyButton.title = "Hide master key";
      toggleMasterKeyButton.classList.add("is-revealed");
      setFieldError(masterKey, "master-key-error", "");
      invalidateResult("Random master key created. Store it securely before continuing.");

      const copied = await copyTextToClipboard(generatedKey);
      setStatus(
        copied
          ? "Random 256-bit master key created and copied. Store it securely."
          : "Random 256-bit master key created. Copy and store it securely.",
      );
    } catch {
      setStatus("This browser could not generate a secure random master key.");
    }
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    copyButton.classList.remove("is-copied");
    copyLabel.textContent = "Copy";

    if (!validate()) {
      setStatus("Check the highlighted fields and try again.");
      return;
    }

    generateButton.disabled = true;
    generateLabel.textContent = "Deriving locally…";
    setStatus("Deriving locally in this browser…");

    try {
      const password = await derivePassword({
        masterKey: masterKey.value,
        context: context.value,
        rotationVersion: rotationVersion.value,
        length: Number(length.value),
      });

      output.value = password;
      resultLength.textContent = `${password.length} characters`;
      copyButton.disabled = false;
      renderPolicy(password);
      setStatus("Password derived locally. Unchanged inputs will reproduce this result.");
    } catch {
      invalidateResult(
        window.isSecureContext
          ? "This browser could not access its local cryptography engine."
          : "Secure browser cryptography requires an HTTPS connection.",
      );
    } finally {
      generateButton.disabled = false;
      generateLabel.textContent = "Generate password";
    }
  });

  copyButton.addEventListener("click", async () => {
    if (!output.value) return;

    const copied = await copyTextToClipboard(output.value);
    if (!copied) {
      setStatus("The browser could not copy the password. Select it manually instead.");
      return;
    }

    copyButton.classList.add("is-copied");
    copyLabel.textContent = "Copied";
    setStatus("Password copied to the clipboard.");

    if (copyTimer) clearTimeout(copyTimer);
    copyTimer = setTimeout(() => {
      copyButton.classList.remove("is-copied");
      copyLabel.textContent = "Copy";
    }, 2000);
  });
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeInterface, { once: true });
  } else {
    initializeInterface();
  }
}
