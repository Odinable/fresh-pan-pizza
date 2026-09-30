(function () {
  "use strict";

  const STORE_CART = "fpp_cart";
  const STORE_DETAILS = "fpp_details";

  const $ = (id) => document.getElementById(id);
  const rs = (n) => "Rs " + n.toLocaleString("en-US");
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
  ));

  // ---------- Catalog: one entry per orderable item + size ----------
  // Keys are built from names so a saved cart survives menu reordering.
  const catalog = new Map();

  function keyFor(s, i, z) {
    const section = MENU[s];
    const item = section.items[i];
    const sizes = item.sizes || section.sizes;
    return section.id + "::" + item.name + (sizes ? "::" + sizes[z] : "");
  }

  MENU.forEach((section, s) => {
    section.items.forEach((item, i) => {
      const sizes = item.sizes || section.sizes;
      if (sizes) {
        sizes.forEach((size, z) => {
          catalog.set(keyFor(s, i, z), { label: item.name + " (" + size + ")", price: item.prices[z] });
        });
      } else {
        const label = item.desc ? item.name + ": " + item.desc : item.name;
        catalog.set(keyFor(s, i, 0), { label: label, price: item.price });
      }
    });
  });

  // ---------- Storage (optional; the site works without it) ----------
  function load(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }
  function save(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* ignore */ }
  }

  // cart: array of [key, qty], kept in the order items were first added
  let cart = load(STORE_CART, []).filter(
    (row) => Array.isArray(row) && catalog.has(row[0]) && row[1] > 0
  );

  // ---------- Render menu ----------
  function fromPrice(section, item) {
    return item.prices ? Math.min.apply(null, item.prices) : item.price;
  }

  function renderCard(section, s, item, i) {
    const sizes = item.sizes || section.sizes;
    let actions;
    if (sizes) {
      actions = '<div class="sizes">' + sizes.map((size, z) =>
        '<button type="button" class="size-btn" data-s="' + s + '" data-i="' + i + '" data-z="' + z + '"' +
        ' aria-label="Add ' + esc(item.name) + ", " + esc(size) + ", " + rs(item.prices[z]) + '">' +
        '<span class="size-name">' + esc(size) + "</span>" +
        '<span class="size-price">' + rs(item.prices[z]) + "</span></button>"
      ).join("") + "</div>";
    } else {
      actions =
        '<div class="single">' +
        '<span class="price">' + rs(item.price) + "</span>" +
        '<button type="button" class="add-btn" data-s="' + s + '" data-i="' + i + '" data-z="0"' +
        ' aria-label="Add ' + esc(item.name) + '">Add</button></div>';
    }
    const isDeal = section.id === "deals";
    return (
      '<article class="card' + (isDeal ? " card-deal" : "") + (item.featured ? " card-featured" : "") + '">' +
      (item.featured ? '<span class="tag">Best for families</span>' : "") +
      "<h3>" + esc(item.name) + "</h3>" +
      (item.desc ? '<p class="desc">' + esc(item.desc) + "</p>" : "") +
      actions + "</article>"
    );
  }

  function renderMenu() {
    $("catNav").innerHTML = MENU.map((section) =>
      '<a href="#' + esc(section.id) + '" data-for="' + esc(section.id) + '">' + esc(section.title) + "</a>"
    ).join("");

    $("catTiles").innerHTML = MENU.map((section) =>
      '<a class="tile" href="#' + esc(section.id) + '">' +
      '<span class="tile-img"><img src="' + esc(section.image) + '" alt="" loading="lazy" decoding="async" width="80" height="80"></span>' +
      '<span class="tile-name">' + esc(section.title) + "</span></a>"
    ).join("");

    $("menu").innerHTML = MENU.map((section, s) => {
      // Featured items (e.g. Family Deal) lead their row
      const order = section.items.map((item, i) => i)
        .sort((a, b) => (section.items[b].featured ? 1 : 0) - (section.items[a].featured ? 1 : 0));
      const cards = order.map((i) => renderCard(section, s, section.items[i], i)).join("");
      const minPrice = Math.min.apply(null, section.items.map((item) => fromPrice(section, item)));
      const count = section.items.length;

      return (
        '<section class="row" id="' + esc(section.id) + '" aria-labelledby="h-' + esc(section.id) + '">' +
          '<header class="row-head">' +
            '<img class="row-img" src="' + esc(section.image) + '" alt="" loading="lazy" decoding="async" width="800" height="350">' +
            '<div class="row-title">' +
              '<h2 id="h-' + esc(section.id) + '">' + esc(section.title) + "</h2>" +
              '<p class="row-meta">' + count + (count === 1 ? " item" : " items") + " · from " + rs(minPrice) + "</p>" +
            "</div>" +
            '<div class="row-arrows">' +
              '<button type="button" class="arrow" data-dir="-1" aria-label="Scroll ' + esc(section.title) + ' left" disabled>‹</button>' +
              '<button type="button" class="arrow" data-dir="1" aria-label="Scroll ' + esc(section.title) + ' right">›</button>' +
            "</div>" +
          "</header>" +
          '<div class="scroller" tabindex="0" role="group" aria-label="' + esc(section.title) + ' items">' + cards + "</div>" +
        "</section>"
      );
    }).join("");
  }

  // ---------- Row scrolling ----------
  function updateArrows(row) {
    const sc = row.querySelector(".scroller");
    const max = sc.scrollWidth - sc.clientWidth;
    const [prev, next] = row.querySelectorAll(".arrow");
    prev.disabled = sc.scrollLeft <= 4;
    next.disabled = sc.scrollLeft >= max - 4;
    row.classList.toggle("fits", max <= 4);
    sc.classList.toggle("at-end", sc.scrollLeft >= max - 4);
  }

  function initRows() {
    document.querySelectorAll(".row").forEach((row) => {
      const sc = row.querySelector(".scroller");
      sc.addEventListener("scroll", () => updateArrows(row), { passive: true });
      row.querySelectorAll(".arrow").forEach((btn) => {
        btn.addEventListener("click", () => {
          sc.scrollBy({ left: +btn.dataset.dir * sc.clientWidth * 0.85, behavior: "smooth" });
        });
      });
      updateArrows(row);
    });
    window.addEventListener("resize", () => document.querySelectorAll(".row").forEach(updateArrows));
  }

  // Highlight the category chip for the row in view
  function initActiveChip() {
    const nav = $("catNav");
    const bar = document.querySelector(".cats");
    const rows = [...document.querySelectorAll(".row")];
    const chips = new Map([...nav.querySelectorAll("a")].map((a) => [a.dataset.for, a]));
    let current = null;
    let queued = false;

    function update() {
      queued = false;
      // The active row is the last one whose top has passed the bottom of the sticky bars
      const line = bar.getBoundingClientRect().bottom + 24;
      let active = null;
      rows.forEach((row) => { if (row.getBoundingClientRect().top <= line) active = row; });
      const chip = active ? chips.get(active.id) : null;
      if (chip === current) return;
      if (current) current.classList.remove("active");
      if (chip) {
        chip.classList.add("active");
        // Keep the active chip visible without moving the page
        nav.scrollTo({ left: chip.offsetLeft - nav.clientWidth / 2 + chip.clientWidth / 2, behavior: "smooth" });
      }
      current = chip;
    }

    window.addEventListener("scroll", () => {
      if (!queued) { queued = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
  }

  // ---------- Cart ----------
  function findRow(key) { return cart.find((row) => row[0] === key); }

  function changeQty(key, delta) {
    const row = findRow(key);
    if (row) {
      row[1] += delta;
      if (row[1] <= 0) cart = cart.filter((r) => r !== row);
    } else if (delta > 0) {
      cart.push([key, delta]);
    }
    save(STORE_CART, cart);
    renderCart();
  }

  function totals() {
    let count = 0;
    let total = 0;
    cart.forEach(([key, qty]) => {
      count += qty;
      total += catalog.get(key).price * qty;
    });
    return { count, total };
  }

  function linesHtml() {
    return cart.map(([key, qty]) => {
      const entry = catalog.get(key);
      return (
        '<li class="line">' +
        '<div class="line-info"><span class="line-name">' + esc(entry.label) + "</span>" +
        '<span class="line-price">' + rs(entry.price) + " each</span></div>" +
        '<div class="stepper">' +
        '<button type="button" class="step" data-key="' + esc(key) + '" data-d="-1" aria-label="One less ' + esc(entry.label) + '">−</button>' +
        '<span class="qty" aria-label="Quantity">' + qty + "</span>" +
        '<button type="button" class="step" data-key="' + esc(key) + '" data-d="1" aria-label="One more ' + esc(entry.label) + '">+</button>' +
        "</div>" +
        '<span class="line-total">' + rs(entry.price * qty) + "</span>" +
        "</li>"
      );
    }).join("");
  }

  function renderCart() {
    const { count, total } = totals();
    const html = linesHtml();

    $("cartbar").hidden = count === 0;
    document.body.classList.toggle("has-cart", count > 0);
    $("barCount").textContent = count + (count === 1 ? " item" : " items");
    $("barTotal").textContent = rs(total);

    $("cartLines").innerHTML = html;
    $("cartEmpty").hidden = count > 0;
    $("cartTotal").textContent = rs(total);

    $("sideLines").innerHTML = html;
    $("sideEmpty").hidden = count > 0;
    $("sideTotal").textContent = rs(total);
    $("sideCheckout").disabled = count === 0;
  }

  // ---------- Toast ----------
  let toastTimer;
  function toast(text) {
    const el = $("toast");
    el.textContent = text;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 1600);
  }

  // ---------- Opening hours (Pakistan time) ----------
  function hourLabel(h) {
    const suffix = h < 12 ? " AM" : " PM";
    return (h % 12 || 12) + suffix;
  }

  function isOpenNow() {
    let hour;
    try {
      hour = +new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Karachi", hour: "numeric", hourCycle: "h23" }).format(new Date());
    } catch (e) {
      return null; // unknown: show nothing
    }
    return SHOP.closes > SHOP.opens
      ? hour >= SHOP.opens && hour < SHOP.closes
      : hour >= SHOP.opens || hour < SHOP.closes; // closes after midnight
  }

  function renderStatus() {
    const open = isOpenNow();
    if (open === null) return;
    const text = open
      ? "Open now · until " + hourLabel(SHOP.closes)
      : "Closed now · opens at " + hourLabel(SHOP.opens);
    ["openStatus", "openStatusTop"].forEach((id) => {
      const el = $(id);
      el.hidden = false;
      el.classList.toggle("is-open", open);
      el.textContent = id === "openStatusTop" ? (open ? "Open now" : "Closed") : text;
    });
    $("closedNote").hidden = open;
  }

  // ---------- Checkout ----------
  function phoneOk(value) {
    const digits = value.replace(/\D/g, "");
    return digits.length >= 10 && digits.length <= 13;
  }

  function buildMessage(d) {
    const { total } = totals();
    const lines = [
      "*New order: Fresh Pan Pizza*",
      "",
      "Name: " + d.name,
      "Phone: " + d.phone,
      "Address: " + d.address,
      "",
      "*Items*"
    ];
    cart.forEach(([key, qty]) => {
      const entry = catalog.get(key);
      lines.push(qty + " x " + entry.label + " = " + rs(entry.price * qty));
    });
    lines.push("", "*Total: " + rs(total) + "*");
    if (d.notes) lines.push("", "Notes: " + d.notes);
    return lines.join("\n");
  }

  function submitOrder(event) {
    event.preventDefault();
    const d = {
      name: $("custName").value.trim(),
      phone: $("custPhone").value.trim(),
      address: $("custAddress").value.trim(),
      notes: $("custNotes").value.trim()
    };
    save(STORE_DETAILS, { name: d.name, phone: d.phone, address: d.address });

    let error = "";
    let field = null;
    if (!cart.length) error = "Your order is empty. Add something from the menu first.";
    else if (!d.name) { error = "Please enter your name."; field = "custName"; }
    else if (!phoneOk(d.phone)) { error = "Please enter a valid phone number, e.g. 0300-1234567."; field = "custPhone"; }
    else if (!d.address) { error = "Please enter your delivery address."; field = "custAddress"; }

    $("formError").textContent = error;
    if (error) {
      if (field) $(field).focus();
      return;
    }

    const url = "https://api.whatsapp.com/send?phone=" + SHOP.whatsapp +
      "&text=" + encodeURIComponent(buildMessage(d));
    // Open WhatsApp exactly once. window.open() with "noopener" always returns null,
    // so it can't tell a blocked popup apart; open normally and cut the opener link instead.
    const win = window.open(url, "_blank");
    if (win) win.opener = null;
    else window.location.href = url; // popup blocked: go there in this tab
  }

  // ---------- Wire up ----------
  function init() {
    renderMenu();
    renderCart();
    renderStatus();
    setInterval(renderStatus, 60000);
    initRows();
    initActiveChip();

    $("shopAddress").textContent = SHOP.address;
    $("mapLink").href = SHOP.mapsUrl;
    $("shopPhones").innerHTML = SHOP.phones.map((p) =>
      '<li><a href="tel:+92' + p.replace(/\D/g, "").replace(/^0/, "") + '">' + esc(p) + "</a></li>"
    ).join("");
    $("year").textContent = new Date().getFullYear();

    const saved = load(STORE_DETAILS, {});
    // Also pick up details saved by the old site (it stored "name" and "phone" as plain strings).
    let oldName = null, oldPhone = null;
    try { oldName = localStorage.getItem("name"); oldPhone = localStorage.getItem("phone"); } catch (e) { /* ignore */ }
    $("custName").value = saved.name || oldName || "";
    $("custPhone").value = saved.phone || oldPhone || "";
    $("custAddress").value = saved.address || "";

    $("menu").addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-s]");
      if (!btn) return;
      const key = keyFor(+btn.dataset.s, +btn.dataset.i, +btn.dataset.z);
      changeQty(key, 1);
      btn.classList.remove("added");
      void btn.offsetWidth; // restart the animation
      btn.classList.add("added");
      toast("Added " + catalog.get(key).label.split(":")[0]);
    });

    const onStep = (e) => {
      const btn = e.target.closest("button[data-key]");
      if (btn) changeQty(btn.dataset.key, +btn.dataset.d);
    };
    $("cartLines").addEventListener("click", onStep);
    $("sideLines").addEventListener("click", onStep);

    const panel = $("cartPanel");
    const openPanel = () => {
      $("formError").textContent = "";
      if (typeof panel.showModal === "function") panel.showModal();
      else panel.setAttribute("open", "");
    };
    $("openCart").addEventListener("click", openPanel);
    $("sideCheckout").addEventListener("click", openPanel);
    // Close when tapping the backdrop
    panel.addEventListener("click", (e) => { if (e.target === panel) panel.close(); });

    $("details").addEventListener("submit", submitOrder);
  }

  init();
})();
