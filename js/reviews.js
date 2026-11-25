/*
 * Configure SUPABASE_URL and SUPABASE_KEY below. The anon/publishable key is meant to be public.
 * Approve reviews in the Supabase dashboard by setting status to "approved".
 * Never use the service_role key in this file.
 */
(function () {
  "use strict";

  var SUPABASE_URL = "https://hvsufljjygmkxssehbzz.supabase.co";
  var SUPABASE_KEY = "sb_publishable_Lcl-0ZxYTBDtm43R4jvXgw_7ofRftiM";
  var slug = document.body && document.body.getAttribute("data-tool");
  var section = document.getElementById("reviews");
  if (!section || !slug || !/^[a-z0-9-]{2,50}$/.test(slug)) return;

  var form = document.getElementById("review-form");
  var summary = document.getElementById("reviews-summary");
  var list = document.getElementById("reviews-list");
  if (!summary || !list) return;

  if (SUPABASE_URL.indexOf("PASTE_") === 0 || SUPABASE_KEY.indexOf("PASTE_") === 0) {
    if (form) form.hidden = true;
    summary.textContent = "Reader reviews are coming soon.";
    return;
  }

  var nameField = document.getElementById("review-name");
  var bodyField = document.getElementById("review-body");
  var honeypot = document.getElementById("review-website");
  var counter = document.getElementById("review-counter");
  var status = form && form.querySelector(".form-status");
  var submitButton = form && form.querySelector('button[type="submit"]');
  var apiUrl = SUPABASE_URL.replace(/\/$/, "") + "/rest/v1/reviews";

  function setError(field, error, message) {
    if (!field || !error) return;
    error.textContent = message || "";
    field.setAttribute("aria-invalid", message ? "true" : "false");
  }

  function showStatus(message, success) {
    if (!status) return;
    status.className = "form-status " + (success ? "form-status--success" : "form-status--error");
    status.textContent = message;
    status.hidden = false;
  }

  function updateCounter() {
    if (counter && bodyField) counter.textContent = bodyField.value.length + "/1000";
  }

  function render(rows) {
    var i, row, card, header, name, date, stars, ratingText, text, total = 0;
    list.textContent = "";
    if (!rows || !rows.length) {
      summary.textContent = "No reviews yet. Be the first to share your experience.";
      return;
    }
    for (i = 0; i < rows.length; i += 1) total += Number(rows[i].rating) || 0;
    summary.textContent = (total / rows.length).toFixed(1) + " out of 5 from " + rows.length + " reader review" + (rows.length === 1 ? "" : "s");
    for (i = 0; i < rows.length; i += 1) {
      row = rows[i];
      card = document.createElement("li");
      card.className = "reviews-card";
      header = document.createElement("div");
      header.className = "reviews-card__header";
      name = document.createElement("strong");
      name.textContent = row.display_name == null ? "Reader" : String(row.display_name);
      date = document.createElement("time");
      date.className = "reviews-date";
      date.textContent = "";
      if (row.created_at) {
        var parsed = new Date(row.created_at);
        if (!isNaN(parsed.getTime())) {
          date.dateTime = parsed.toISOString();
          date.textContent = parsed.toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" });
        }
      }
      header.appendChild(name);
      header.appendChild(date);
      card.appendChild(header);
      stars = document.createElement("span");
      stars.className = "reviews-stars";
      stars.setAttribute("aria-hidden", "true");
      var starCount = Math.max(0, Math.min(5, Number(row.rating) || 0));
      stars.textContent = "";
      while (starCount > 0) { stars.textContent += "★"; starCount -= 1; }
      card.appendChild(stars);
      ratingText = document.createElement("span");
      ratingText.className = "visually-hidden";
      ratingText.textContent = " " + (Number(row.rating) || 0) + "/5";
      card.appendChild(ratingText);
      text = document.createElement("p");
      text.textContent = row.body == null ? "" : String(row.body);
      card.appendChild(text);
      list.appendChild(card);
    }
  }

  function loadReviews() {
    summary.textContent = "Loading reviews…";
    try {
      fetch(apiUrl + "?select=display_name,rating,body,created_at&tool_slug=eq." + encodeURIComponent(slug) + "&status=eq.approved&order=created_at.desc&limit=100", {
        method: "GET",
        headers: { "apikey": SUPABASE_KEY }
      }).then(function (response) {
        if (!response.ok) throw new Error("load failed");
        return response.json();
      }).then(render).catch(function () { summary.textContent = "Reviews couldn't be loaded right now."; });
    } catch (e) {
      summary.textContent = "Reviews couldn't be loaded right now.";
    }
  }

  if (form) {
    if (bodyField) {
      bodyField.addEventListener("input", updateCounter);
      updateCounter();
    }
    form.addEventListener("input", function (event) {
      var target = event.target;
      if (target && target.id === "review-name") setError(nameField, document.getElementById("review-name-error"), "");
      if (target && target.id === "review-body") setError(bodyField, document.getElementById("review-body-error"), "");
      if (target && target.name === "rating") setError(document.getElementById("review-rating"), document.getElementById("review-rating-error"), "");
    });
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (honeypot && honeypot.value) { form.reset(); updateCounter(); showStatus("Thank you! Your review was received and will appear after a quick check.", true); return; }
      var name = nameField ? nameField.value.trim() : "";
      var body = bodyField ? bodyField.value.trim() : "";
      var selected = form.querySelector('input[name="rating"]:checked');
      var nameError = document.getElementById("review-name-error");
      var ratingError = document.getElementById("review-rating-error");
      var bodyError = document.getElementById("review-body-error");
      var valid = true;
      setError(nameField, nameError, "");
      setError(document.getElementById("review-rating"), ratingError, "");
      setError(bodyField, bodyError, "");
      if (name.length < 2 || name.length > 40) { setError(nameField, nameError, "Please enter a name between 2 and 40 characters."); valid = false; }
      if (!selected) { setError(document.getElementById("review-rating"), ratingError, "Please choose a rating."); valid = false; }
      if (body.length < 20 || body.length > 1000) { setError(bodyField, bodyError, "Please write between 20 and 1000 characters."); valid = false; }
      if (/http:\/\/|https:\/\/|www\./i.test(body)) { setError(bodyField, bodyError, "Please don't include links."); valid = false; }
      if (!valid) return;

      try {
        if (localStorage.getItem("aith_reviewed_" + slug)) { showStatus("A review for this tool has already been sent from this browser.", false); return; }
        var lastSent = Number(localStorage.getItem("aith_review_last_sent") || 0);
        if (lastSent && Date.now() - lastSent < 60000) { showStatus("Please wait a minute before sending another review.", false); return; }
      } catch (e) { /* Storage may be disabled; continue with submission. */ }
      if (!submitButton) return;
      submitButton.disabled = true;
      if (status) status.hidden = true;
      try {
        fetch(apiUrl, {
          method: "POST",
          headers: { "apikey": SUPABASE_KEY, "Content-Type": "application/json", "Prefer": "return=minimal" },
          body: JSON.stringify({ tool_slug: slug, display_name: name, rating: Number(selected.value), body: body })
        }).then(function (response) {
          if (response.status !== 201) throw new Error("submit failed");
          try { localStorage.setItem("aith_review_last_sent", String(Date.now())); localStorage.setItem("aith_reviewed_" + slug, "1"); } catch (e) { /* Ignore storage errors. */ }
          form.reset();
          updateCounter();
          showStatus("Thank you! Your review was received and will appear after a quick check.", true);
        }).catch(function () {
          showStatus("Sorry, your review couldn't be sent. Please try again later.", false);
        }).then(function () { submitButton.disabled = false; });
      } catch (e) {
        submitButton.disabled = false;
        showStatus("Sorry, your review couldn't be sent. Please try again later.", false);
      }
    });
  }

  loadReviews();
}());
