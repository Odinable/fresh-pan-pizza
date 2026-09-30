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
  function renderMenu() {
    $("catNav").innerHTML = MENU.map((section) =>
      '<a href="#' + esc(section.id) + '">' + esc(section.title) + "</a>"
    ).join("");

    $("menu").innerHTML = MENU.map((section, s) => {
      const title = "<h2>" + esc(section.title) + "</h2>" +
        (section.note ? '<span class="section-note">' + esc(section.note) + "</span>" : "");
      const head = section.image
        ? '<div class="banner"><img src="' + esc(section.image) + '" alt="" loading="lazy" decoding="async" width="800" height="350">' +
          '<div class="banner-title">' + title + "</div></div>"
        : '<div class="section-head">' + title + "</div>";

      const cards = section.items.map((item, i) => {
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
        return (
          '<article class="card' + (section.id === "deals" ? " card-deal" : "") + (item.featured ? " card-featured" : "") + '">' +
          "<h3>" + esc(item.name) + "</h3>" +
          (item.desc ? '<p class="desc">' + esc(item.desc) + "</p>" : "") +
          actions + "</article>"
        );
      }).join("");

      return '<section class="menu-section" id="' + esc(section.id) + '">' + head +
        '<div class="grid' + (section.sizes ? " grid-sized" : "") + '">' + cards + "</div></section>";
    }).join("");
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

  function renderCart() {
    const { count, total } = totals();

    $("cartbar").hidden = count === 0;
    document.body.classList.toggle("has-cart", count > 0);
    $("barCount").textContent = count + (count === 1 ? " item" : " items");
    $("barTotal").textContent = rs(total);

    $("cartLines").innerHTML = cart.map(([key, qty]) => {
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

    $("cartEmpty").hidden = count > 0;
    $("cartTotal").textContent = rs(total);
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
    const el = $("openStatus");
    if (open === null) return;
    el.hidden = false;
    el.classList.toggle("is-open", open);
    el.textContent = open
      ? "Open now · until " + hourLabel(SHOP.closes)
      : "Closed now · opens at " + hourLabel(SHOP.opens);
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
    const win = window.open(url, "_blank", "noopener");
    if (!win) window.location.href = url;
  }

  // ---------- Wire up ----------
  function init() {
    renderMenu();
    renderCart();
    renderStatus();
    setInterval(renderStatus, 60000);

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
      toast("Added " + catalog.get(key).label.split(":")[0]);
    });

    $("cartLines").addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-key]");
      if (btn) changeQty(btn.dataset.key, +btn.dataset.d);
    });

    const panel = $("cartPanel");
    $("openCart").addEventListener("click", () => {
      $("formError").textContent = "";
      if (typeof panel.showModal === "function") panel.showModal();
      else panel.setAttribute("open", "");
    });
    // Close when tapping the backdrop
    panel.addEventListener("click", (e) => { if (e.target === panel) panel.close(); });

    $("details").addEventListener("submit", submitOrder);
  }

  init();
})();
