/*
 * Reviews are stored in Cloudflare D1. Approve a review in the D1 console with:
 * UPDATE reviews SET status='approved' WHERE id=<id>.
 */
(function () {
  "use strict";

  var slug = document.body && document.body.getAttribute("data-tool");
  var section = document.getElementById("reviews");
  if (!section || !slug || !/^[a-z0-9-]{2,50}$/.test(slug)) return;

  var form = document.getElementById("review-form");
  var summary = document.getElementById("reviews-summary");
  var list = document.getElementById("reviews-list");
  if (!summary || !list) return;

  var nameField = document.getElementById("review-name");
  var bodyField = document.getElementById("review-body");
  var honeypot = document.getElementById("review-website");
  var counter = document.getElementById("review-counter");
  var ratingField = document.getElementById("review-rating");
  var ratingHint = document.getElementById("review-rating-hint");
  var status = form && form.querySelector(".form-status");
  var submitButton = form && form.querySelector('button[type="submit"]');
  var apiUrl = "/api/reviews";
  var ratingWords = ["", "Very poor", "Poor", "Okay", "Good", "Excellent"];
  var hoverRating = 0;

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
    if (!counter || !bodyField) return;
    counter.textContent = bodyField.value.length + "/1000";
    bodyField.style.height = "auto";
    var maxHeight = 224;
    var nextHeight = Math.min(bodyField.scrollHeight, maxHeight);
    bodyField.style.height = nextHeight + "px";
    bodyField.style.overflowY = bodyField.scrollHeight > maxHeight ? "auto" : "hidden";
  }

  function getSelectedRating() {
    if (!form) return 0;
    var selected = form.querySelector('input[name="rating"]:checked');
    return selected ? Number(selected.value) || 0 : 0;
  }

  function updateStars(preview) {
    if (!form) return;
    var labels = form.querySelectorAll(".review-star");
    var selected = getSelectedRating();
    var active = preview || selected;
    var i, input;
    for (i = 0; i < labels.length; i += 1) {
      input = labels[i].querySelector('input[name="rating"]');
      var value = input ? Number(input.value) : i + 1;
      labels[i].classList.toggle("is-filled", value <= active);
      labels[i].classList.toggle("is-selected", value === selected);
    }
  }

  function updateRatingHint() {
    var value = getSelectedRating();
    if (ratingHint) ratingHint.textContent = value ? value + " out of 5 - " + ratingWords[value] : "Select a rating";
    updateStars(hoverRating);
  }

  function addSummaryMessage() {
    var strong = document.createElement("strong");
    var br = document.createElement("br");
    var note = document.createElement("span");
    strong.textContent = "No reviews yet";
    note.textContent = "Tried this tool? Your experience could help the next person decide.";
    summary.textContent = "";
    summary.appendChild(strong);
    summary.appendChild(br);
    summary.appendChild(note);
  }

  function initialsFor(value) {
    var words = String(value || "").trim().split(/\s+/);
    var initials = "";
    var i;
    for (i = 0; i < words.length && initials.length < 2; i += 1) {
      if (words[i]) initials += words[i].charAt(0).toUpperCase();
    }
    return initials || "R";
  }

  function render(rows) {
    if (!Array.isArray(rows)) throw new Error("invalid review data");
    var i, row, card, header, avatar, person, name, date, stars, ratingText, text, total = 0;
    list.textContent = "";
    if (!rows.length) {
      addSummaryMessage();
      return;
    }
    for (i = 0; i < rows.length; i += 1) total += Number(rows[i] && rows[i].rating) || 0;
    var average = (total / rows.length).toFixed(1);
    summary.textContent = "";
    var visibleSummary = document.createElement("span");
    var screenSummary = document.createElement("span");
    screenSummary.className = "visually-hidden";
    visibleSummary.textContent = average + " ★ · " + rows.length + " " + (rows.length === 1 ? "review" : "reviews");
    screenSummary.textContent = average + " out of 5 from " + rows.length + " reader review" + (rows.length === 1 ? "" : "s");
    summary.appendChild(visibleSummary);
    summary.appendChild(screenSummary);
    for (i = 0; i < rows.length; i += 1) {
      row = rows[i] || {};
      card = document.createElement("li");
      card.className = "reviews-card";
      header = document.createElement("div");
      header.className = "reviews-card__header";
      person = document.createElement("div");
      person.className = "reviews-person";
      avatar = document.createElement("span");
      avatar.className = "reviews-avatar";
      avatar.setAttribute("aria-hidden", "true");
      avatar.textContent = initialsFor(row.display_name);
      name = document.createElement("strong");
      name.className = "reviews-name";
      name.textContent = row.display_name == null || String(row.display_name).trim() === "" ? "Reader" : String(row.display_name);
      date = document.createElement("time");
      date.className = "reviews-date";
      if (row.created_at) {
        var parsed = new Date(row.created_at);
        if (!isNaN(parsed.getTime())) {
          date.dateTime = parsed.toISOString();
          date.textContent = parsed.toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" });
        }
      }
      person.appendChild(avatar);
      person.appendChild(name);
      header.appendChild(person);
      header.appendChild(date);
      card.appendChild(header);
      stars = document.createElement("span");
      stars.className = "reviews-stars";
      stars.setAttribute("aria-hidden", "true");
      var starCount = Math.max(0, Math.min(5, Number(row.rating) || 0));
      stars.textContent = "";
      var j;
      for (j = 0; j < starCount; j += 1) stars.textContent += "★";
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
      fetch(apiUrl + "?tool=" + encodeURIComponent(slug), { method: "GET" }).then(function (response) {
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
    var starInputs = form.querySelectorAll('input[name="rating"]');
    var starIndex;
    for (starIndex = 0; starIndex < starInputs.length; starIndex += 1) {
      (function (input) {
        var label = input.parentNode;
        label.addEventListener("mouseenter", function () { hoverRating = Number(input.value) || 0; updateStars(hoverRating); });
        input.addEventListener("focus", function () { hoverRating = Number(input.value) || 0; updateStars(hoverRating); });
        input.addEventListener("blur", function () { hoverRating = 0; updateStars(0); });
        input.addEventListener("change", function () {
          hoverRating = 0;
          updateRatingHint();
          setError(ratingField, document.getElementById("review-rating-error"), "");
        });
      }(starInputs[starIndex]));
    }
    var starOptions = form.querySelector(".review-rating__options");
    if (starOptions) starOptions.addEventListener("mouseleave", function () { hoverRating = 0; updateStars(0); });
    form.addEventListener("reset", function () {
      hoverRating = 0;
      if (ratingHint) ratingHint.textContent = "Select a rating";
      window.setTimeout(function () { updateCounter(); updateStars(0); }, 0);
    });
    form.addEventListener("input", function (event) {
      var target = event.target;
      if (target && target.id === "review-name") setError(nameField, document.getElementById("review-name-error"), "");
      if (target && target.id === "review-body") setError(bodyField, document.getElementById("review-body-error"), "");
      if (target && target.name === "rating") setError(ratingField, document.getElementById("review-rating-error"), "");
    });
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (honeypot && honeypot.value) { form.reset(); updateCounter(); showStatus("Thank you! Your review was received and will appear after a quick check.", true); return; }
      var nameValue = nameField ? nameField.value.trim() : "";
      var bodyValue = bodyField ? bodyField.value.trim() : "";
      var selected = form.querySelector('input[name="rating"]:checked');
      var nameError = document.getElementById("review-name-error");
      var ratingError = document.getElementById("review-rating-error");
      var bodyError = document.getElementById("review-body-error");
      var valid = true;
      setError(nameField, nameError, "");
      setError(ratingField, ratingError, "");
      setError(bodyField, bodyError, "");
      if (nameValue.length < 2 || nameValue.length > 40) { setError(nameField, nameError, "Please enter a name between 2 and 40 characters."); valid = false; }
      if (/http:\/\/|https:\/\/|www\./i.test(nameValue)) { setError(nameField, nameError, "Please don't include links"); valid = false; }
      if (!selected) { setError(ratingField, ratingError, "Please choose a rating."); valid = false; }
      if (bodyValue.length < 20 || bodyValue.length > 1000) { setError(bodyField, bodyError, "Please write between 20 and 1000 characters."); valid = false; }
      if (/http:\/\/|https:\/\/|www\./i.test(bodyValue)) { setError(bodyField, bodyError, "Please don't include links."); valid = false; }
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
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tool_slug: slug, display_name: nameValue, rating: Number(selected.value), body: bodyValue })
        }).then(function (response) {
          if (response.status !== 201) { var failure = new Error("submit failed"); failure.status = response.status; throw failure; }
          try { localStorage.setItem("aith_review_last_sent", String(Date.now())); localStorage.setItem("aith_reviewed_" + slug, "1"); } catch (e) { /* Ignore storage errors. */ }
          form.reset();
          showStatus("Thank you! Your review was received and will appear after a quick check.", true);
        }).catch(function (error) {
          showStatus(error && error.status === 429 ? "We're receiving a lot of reviews right now. Please try again later." : "Sorry, your review couldn't be sent. Please try again later.", false);
        }).then(function () { submitButton.disabled = false; });
      } catch (e) {
        submitButton.disabled = false;
        showStatus("Sorry, your review couldn't be sent. Please try again later.", false);
      }
    });
  }

  loadReviews();
}());
