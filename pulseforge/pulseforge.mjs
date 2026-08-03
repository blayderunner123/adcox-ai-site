function localMonthValue(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function readableMonth(value) {
  const match = /^(\d{4})-(\d{2})$/.exec(value || "");
  if (!match) return "Not selected";

  const date = new Date(Number(match[1]), Number(match[2]) - 1, 1);
  return new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" }).format(date);
}

function initializePulseForge() {
  const form = document.getElementById("pulse-form");
  if (!form) return;

  const monthInput = document.getElementById("check-in-month");
  const comments = document.getElementById("additional-comments");
  const characterCount = document.getElementById("character-count");
  const printButton = document.getElementById("print-check-in");
  const resetButton = document.getElementById("reset-check-in");
  const statusMessage = document.getElementById("status-message");
  const ratingInputs = [...form.querySelectorAll('input[name="rating"]')];

  const printMonth = document.getElementById("print-month");
  const printScore = document.getElementById("print-score");
  const printRatingLabel = document.getElementById("print-rating-label");
  const printComments = document.getElementById("print-comments");
  const printGenerated = document.getElementById("print-generated");

  function selectedRating() {
    return ratingInputs.find((input) => input.checked) || null;
  }

  function setStatus(message) {
    statusMessage.textContent = message;
  }

  function syncPrintableRecord() {
    const rating = selectedRating();
    const commentText = comments.value.trim();

    printMonth.textContent = readableMonth(monthInput.value);
    printScore.textContent = rating?.value || "—";
    printRatingLabel.textContent = rating?.dataset.label || "Not selected";
    printComments.textContent = commentText || "No additional comments.";
    printGenerated.textContent = `Printed ${new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date())}`;
  }

  function resetCheckIn() {
    for (const input of ratingInputs) input.checked = false;
    comments.value = "";
    monthInput.value = localMonthValue();
    characterCount.textContent = "0 / 2,000";
    syncPrintableRecord();
    setStatus("Check-in cleared. Nothing was stored.");
    monthInput.focus();
  }

  monthInput.value = localMonthValue();
  syncPrintableRecord();

  monthInput.addEventListener("change", () => {
    syncPrintableRecord();
    setStatus("Month updated locally.");
  });

  for (const input of ratingInputs) {
    input.addEventListener("change", () => {
      syncPrintableRecord();
      setStatus(`Rating selected: ${input.value} of 6. Nothing was submitted.`);
    });
  }

  comments.addEventListener("input", () => {
    characterCount.textContent = `${comments.value.length.toLocaleString()} / 2,000`;
    syncPrintableRecord();
    setStatus("Comments remain only in this browser session.");
  });

  printButton.addEventListener("click", () => {
    syncPrintableRecord();
    setStatus("Opening the browser print dialog. You can also save the check-in as a PDF.");
    window.print();
  });

  resetButton.addEventListener("click", resetCheckIn);
  window.addEventListener("beforeprint", syncPrintableRecord);

  const navbarToggle = document.querySelector(".navbar-toggler");
  const navbarMenu = document.getElementById("nav");

  if (navbarToggle && navbarMenu) {
    navbarToggle.addEventListener("click", () => {
      const isOpen = navbarMenu.classList.toggle("show");
      navbarToggle.setAttribute("aria-expanded", String(isOpen));
    });
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializePulseForge, { once: true });
} else {
  initializePulseForge();
}
