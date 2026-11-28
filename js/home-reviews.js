/*
 * Shows the latest approved reader reviews on the home page.
 * Data comes from the Worker: GET /api/reviews?latest=1 (Cloudflare D1).
 * All text is added with textContent, never as HTML. If there are no reviews or the
 * request fails, the section simply stays hidden.
 */
(function () {
  "use strict";
  var section = document.getElementById("home-reviews");
  var list = document.getElementById("home-reviews-list");
  if (!section || !list) return;

  var base = (document.body && document.body.getAttribute("data-base")) || "";
  var tools = {};
  (window.TOOLS_DATA || []).forEach(function (t) { if (t && t.slug) tools[t.slug] = t.name; });

  function initialsFor(value) {
    var words = String(value || "").trim().split(/\s+/), out = "", i;
    for (i = 0; i < words.length && out.length < 2; i += 1) if (words[i]) out += words[i].charAt(0).toUpperCase();
    return out || "R";
  }

  function shorten(text) {
    text = String(text == null ? "" : text);
    if (text.length <= 220) return text;
    return text.slice(0, 217).replace(/\s+\S*$/, "") + "…";
  }

  function card(row) {
    var li = document.createElement("li"), header = document.createElement("div"), person = document.createElement("div");
    var avatar = document.createElement("span"), name = document.createElement("strong"), date = document.createElement("time");
    var stars = document.createElement("span"), hidden = document.createElement("span"), p = document.createElement("p");
    var rating = Math.max(0, Math.min(5, Number(row.rating) || 0)), i, parsed;
    li.className = "reviews-card";
    header.className = "reviews-card__header";
    person.className = "reviews-person";
    avatar.className = "reviews-avatar";
    avatar.setAttribute("aria-hidden", "true");
    avatar.textContent = initialsFor(row.display_name);
    name.className = "reviews-name";
    name.textContent = row.display_name == null || String(row.display_name).trim() === "" ? "Reader" : String(row.display_name);
    date.className = "reviews-date";
    parsed = row.created_at ? new Date(row.created_at) : null;
    if (parsed && !isNaN(parsed.getTime())) {
      date.dateTime = parsed.toISOString();
      date.textContent = parsed.toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" });
    }
    person.appendChild(avatar); person.appendChild(name);
    header.appendChild(person); header.appendChild(date);
    li.appendChild(header);
    stars.className = "reviews-stars";
    stars.setAttribute("aria-hidden", "true");
    for (i = 0; i < rating; i += 1) stars.textContent += "★";
    hidden.className = "visually-hidden";
    hidden.textContent = " " + rating + "/5";
    li.appendChild(stars); li.appendChild(hidden);
    p.textContent = shorten(row.body);
    li.appendChild(p);
    if (typeof row.tool_slug === "string" && /^[a-z0-9-]{2,50}$/.test(row.tool_slug) && tools[row.tool_slug]) {
      var a = document.createElement("a");
      a.className = "reviews-tool";
      a.href = base + "tools/" + row.tool_slug + ".html#reviews";
      a.textContent = "Review of " + tools[row.tool_slug] + " →";
      li.appendChild(a);
    }
    return li;
  }

  try {
    fetch("/api/reviews?latest=1", { method: "GET" }).then(function (r) {
      if (!r.ok) throw new Error("load failed");
      return r.json();
    }).then(function (rows) {
      if (!Array.isArray(rows) || !rows.length) return;
      list.textContent = "";
      rows.forEach(function (row) { list.appendChild(card(row || {})); });
      section.hidden = false;
    }).catch(function () {});
  } catch (e) {}
})();
