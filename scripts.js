/* ==========================================================================
   KZN Collectibles & TCG - Master JavaScript Engine (Part 3 Final)
   Module: Web Development (WEDE5020 / XHAW5112 / CONE5112)
   Student Number: ST10476298
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
    initScheduleTabs();
    initFaqAccordion();
    initLightboxGallery();
    initCatalogueFilterAndSort();
    initInteractiveMap();
    initEnquiryFormValidation();
    initContactFormValidation();
});

/* --------------------------------------------------------------------------
   1. INTERACTIVE TABS (index.html)
   -------------------------------------------------------------------------- */
function initScheduleTabs() {
    const tabButtons = document.querySelectorAll(".tab-btn");
    const tabPanels = document.querySelectorAll(".tab-panel");
    if (tabButtons.length === 0) return;

    tabButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
            const targetId = btn.getAttribute("data-tab");

            tabButtons.forEach((b) => {
                b.classList.remove("active");
                b.setAttribute("aria-selected", "false");
            });
            tabPanels.forEach((p) => p.classList.remove("active"));

            btn.classList.add("active");
            btn.setAttribute("aria-selected", "true");
            const targetPanel = document.getElementById(targetId);
            if (targetPanel) targetPanel.classList.add("active");
        });
    });
}

/* --------------------------------------------------------------------------
   2. INTERACTIVE FAQ ACCORDION (about.html)
   -------------------------------------------------------------------------- */
function initFaqAccordion() {
    const headers = document.querySelectorAll(".accordion-header");
    if (headers.length === 0) return;

    headers.forEach((header) => {
        header.addEventListener("click", () => {
            const item = header.parentElement;
            const icon = header.querySelector(".accordion-icon");
            const isOpen = item.classList.contains("open");

            // Close all items first for clean UX
            document.querySelectorAll(".accordion-item").forEach((el) => {
                el.classList.remove("open");
                const btn = el.querySelector(".accordion-header");
                const icn = el.querySelector(".accordion-icon");
                if (btn) btn.setAttribute("aria-expanded", "false");
                if (icn) icn.textContent = "+";
            });

            if (!isOpen) {
                item.classList.add("open");
                header.setAttribute("aria-expanded", "true");
                if (icon) icon.textContent = "−";
            }
        });
    });
}

/* --------------------------------------------------------------------------
   3. GALLERY LIGHTBOX MODAL (index.html & products.html)
   -------------------------------------------------------------------------- */
function initLightboxGallery() {
    const triggers = Array.from(document.querySelectorAll(".lightbox-trigger"));
    const modal = document.getElementById("lightboxModal");
    const modalImg = document.getElementById("lightboxImage");
    const modalCaption = document.getElementById("lightboxCaption");
    const closeBtn = document.getElementById("lightboxClose");
    const prevBtn = document.getElementById("lightboxPrev");
    const nextBtn = document.getElementById("lightboxNext");

    if (triggers.length === 0 || !modal) return;
    let currentIndex = 0;

    function showImage(index) {
        if (index < 0) index = triggers.length - 1;
        if (index >= triggers.length) index = 0;
        currentIndex = index;

        const activeImg = triggers[currentIndex];
        modalImg.src = activeImg.src;
        modalImg.alt = activeImg.alt;
        modalCaption.textContent = activeImg.getAttribute("data-caption") || activeImg.alt;
        modal.classList.add("active");
        modal.setAttribute("aria-hidden", "false");
    }

    function closeModal() {
        modal.classList.remove("active");
        modal.setAttribute("aria-hidden", "true");
    }

    triggers.forEach((img, idx) => {
        img.addEventListener("click", () => showImage(idx));
    });

    if (closeBtn) closeBtn.addEventListener("click", closeModal);
    if (prevBtn) prevBtn.addEventListener("click", () => showImage(currentIndex - 1));
    if (nextBtn) nextBtn.addEventListener("click", () => showImage(currentIndex + 1));

    modal.addEventListener("click", (e) => {
        if (e.target === modal) closeModal();
    });

    document.addEventListener("keydown", (e) => {
        if (!modal.classList.contains("active")) return;
        if (e.key === "Escape") closeModal();
        if (e.key === "ArrowLeft") showImage(currentIndex - 1);
        if (e.key === "ArrowRight") showImage(currentIndex + 1);
    });
}

/* --------------------------------------------------------------------------
   4. DYNAMIC PRODUCT SEARCH, FILTER & SORT (products.html)
   -------------------------------------------------------------------------- */
function initCatalogueFilterAndSort() {
    const searchInput = document.getElementById("productSearch");
    const categorySelect = document.getElementById("categoryFilter");
    const priceSort = document.getElementById("priceSort");
    const productGrid = document.getElementById("productGrid");
    const countLabel = document.getElementById("catalogueCount");

    if (!searchInput || !categorySelect || !priceSort || !productGrid) return;

    const allItems = Array.from(productGrid.querySelectorAll(".catalogue-item"));

    function updateCatalogue() {
        const query = searchInput.value.trim().toLowerCase();
        const category = categorySelect.value;
        const sortOrder = priceSort.value;

        let visibleItems = allItems.filter((item) => {
            const itemTitle = (item.getAttribute("data-title") || "").toLowerCase();
            const itemText = item.textContent.toLowerCase();
            const itemCategory = item.getAttribute("data-category");

            const matchesSearch = itemTitle.includes(query) || itemText.includes(query);
            const matchesCategory = category === "all" || itemCategory === category;

            if (matchesSearch && matchesCategory) {
                item.style.display = "flex";
                return true;
            } else {
                item.style.display = "none";
                return false;
            }
        });

        if (sortOrder === "low-high") {
            visibleItems.sort((a, b) => Number(a.dataset.price) - Number(b.dataset.price));
        } else if (sortOrder === "high-low") {
            visibleItems.sort((a, b) => Number(b.dataset.price) - Number(a.dataset.price));
        }

        visibleItems.forEach((item) => productGrid.appendChild(item));

        if (countLabel) {
            countLabel.textContent = `Showing ${visibleItems.length} of ${allItems.length} products`;
        }
    }

    searchInput.addEventListener("input", updateCatalogue);
    categorySelect.addEventListener("change", updateCatalogue);
    priceSort.addEventListener("change", updateCatalogue);
}

/* --------------------------------------------------------------------------
   5. INTERACTIVE LEAFLET.JS MAP (contact.html)
   -------------------------------------------------------------------------- */
function initInteractiveMap() {
    const mapElement = document.getElementById("storeMap");
    if (!mapElement) return;

    if (typeof L === "undefined") {
        mapElement.innerHTML = `
            <div style="padding: 2rem; text-align: center;">
                <h3>Interactive Map Coordinates (Offline Preview)</h3>
                <p><strong>PMB Flagship Store:</strong> 15 Chief Albert Luthuli Rd, Pietermaritzburg (-29.6006, 30.3794)</p>
                <p><strong>Hilton Express Outlet:</strong> 8 Hilton Ave, Hilton (-29.5547, 30.3014)</p>
            </div>`;
        return;
    }

    mapElement.innerHTML = "";
    const map = L.map("storeMap").setView([-29.5800, 30.3450], 12);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors"
    }).addTo(map);

    const pmbMarker = L.marker([-29.6006, 30.3794]).addTo(map)
        .bindPopup("<strong>KZN Collectibles — PMB Flagship</strong><br>15 Chief Albert Luthuli Rd, Pietermaritzburg<br>Tel: +27 33 555 1234")
        .openPopup();

    const hiltonMarker = L.marker([-29.5547, 30.3014]).addTo(map)
        .bindPopup("<strong>KZN Collectibles — Hilton Express</strong><br>8 Hilton Ave, Hilton Village<br>Tel: +27 33 555 5678");

    document.querySelectorAll(".map-focus-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            const lat = parseFloat(btn.getAttribute("data-lat"));
            const lng = parseFloat(btn.getAttribute("data-lng"));
            const branch = btn.getAttribute("data-branch");
            map.setView([lat, lng], 15);
            if (branch === "pmb") pmbMarker.openPopup();
            if (branch === "hilton") hiltonMarker.openPopup();
        });
    });
}

/* --------------------------------------------------------------------------
   6. ENQUIRY FORM VALIDATION & INSTANT QUOTE CALCULATOR (enquiry.html)
   -------------------------------------------------------------------------- */
function sanitizeHTML(str) {
    return String(str).replace(/[&<>"']/g, (char) => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[char]));
}

function initEnquiryFormValidation() {
    const form = document.getElementById("enquiryForm");
    const responseBox = document.getElementById("enquiryResponseBox");
    if (!form || !responseBox) return;

    const pricingTable = {
        "tournament-friday": { name: "Friday Night Casual League Entry", unitPrice: 80, availability: "24 Seats Available" },
        "tournament-saturday": { name: "Saturday Modern Championship Entry", unitPrice: 150, availability: "14 Seats Remaining" },
        "preorder-etb": { name: "Obsidian Flames Elite Trainer Box", unitPrice: 1100, availability: "In Stock (Immediate Allocation)" },
        "preorder-booster": { name: "Factory Sealed 36-Pack Booster Box", unitPrice: 2450, availability: "8 Boxes Available in Vault" },
        "card-sourcing": { name: "Rare Single Card Valuation & Sourcing Deposit", unitPrice: 50, availability: "Specialist Appraisal Slot Open" },
        "sponsor-volunteer": { name: "Volunteer Judge / Event Sponsorship Application", unitPrice: 0, availability: "Priority Community Review" }
    };

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        let isValid = true;

        const fullName = document.getElementById("fullName");
        const email = document.getElementById("email");
        const phone = document.getElementById("contactNumber");
        const enquiryType = document.getElementById("enquiryType");
        const quantity = document.getElementById("quantity");
        const preferredDate = document.getElementById("preferredDate");
        const branch = document.getElementById("branchSelect");
        const details = document.getElementById("requestDetails");

        // Validate Full Name
        if (fullName.value.trim().length < 3) {
            setFieldError(fullName, "fullNameError", "Please enter your full name and surname (at least 3 characters).");
            isValid = false;
        } else {
            clearFieldError(fullName, "fullNameError");
        }

        // Validate Email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.value.trim())) {
            setFieldError(email, "emailError", "Please enter a valid email address (e.g. name@domain.co.za).");
            isValid = false;
        } else {
            clearFieldError(email, "emailError");
        }

        // Validate SA Phone Number (10 digits or +27)
        const cleanPhone = phone.value.replace(/\s+/g, "");
        const phoneRegex = /^(\+27|0)[0-9]{9}$/;
        if (!phoneRegex.test(cleanPhone)) {
            setFieldError(phone, "contactNumberError", "Enter a valid 10-digit South African phone number (e.g. 0821234567).");
            isValid = false;
        } else {
            clearFieldError(phone, "contactNumberError");
        }

        // Validate Enquiry Type
        if (!enquiryType.value) {
            setFieldError(enquiryType, "enquiryTypeError", "Please select an enquiry category from the list.");
            isValid = false;
        } else {
            clearFieldError(enquiryType, "enquiryTypeError");
        }

        // Validate Quantity
        const qtyVal = parseInt(quantity.value, 10);
        if (isNaN(qtyVal) || qtyVal < 1 || qtyVal > 20) {
            setFieldError(quantity, "quantityError", "Please enter a valid quantity between 1 and 20.");
            isValid = false;
        } else {
            clearFieldError(quantity, "quantityError");
        }

        // Validate Date
        if (!preferredDate.value) {
            setFieldError(preferredDate, "preferredDateError", "Please select your preferred event or collection date.");
            isValid = false;
        } else {
            clearFieldError(preferredDate, "preferredDateError");
        }

        // Validate Details
        if (details.value.trim().length < 10) {
            setFieldError(details, "requestDetailsError", "Please provide at least 10 characters of detail for your request.");
            isValid = false;
        } else {
            clearFieldError(details, "requestDetailsError");
        }

        if (!isValid) {
            responseBox.hidden = true;
            return;
        }

        // Calculate Cost & Availability Response
        const selected = pricingTable[enquiryType.value];
        const totalCost = selected.unitPrice * qtyVal;
        const refNumber = "KZN-" + Math.floor(100000 + Math.random() * 900000);

        responseBox.innerHTML = `
            <h3>Instant Enquiry Quote &amp; Availability Confirmation</h3>
            <p><strong>Reference Code:</strong> ${refNumber} | <strong>Customer:</strong> ${sanitizeHTML(fullName.value)}</p>
            <p><strong>Selected Item / Service:</strong> ${selected.name}</p>
            <p><strong>Live Availability Status:</strong> <span style="color:#FBC02D;font-weight:bold;">${selected.availability}</span></p>
            <p><strong>Preferred Branch &amp; Date:</strong> ${sanitizeHTML(branch.value)} on ${sanitizeHTML(preferredDate.value)}</p>
            <p><strong>Estimated Cost Breakdown:</strong> ${qtyVal} &times; R${selected.unitPrice.toFixed(2)} = <strong style="color:#4CAF50;font-size:1.2rem;">R${totalCost.toFixed(2)} ZAR</strong></p>
            <p><em>A copy of this quote has been logged for ${sanitizeHTML(email.value)}. Present reference <strong>${refNumber}</strong> in-store to finalise your booking.</em></p>
        `;
        responseBox.hidden = false;
        responseBox.scrollIntoView({ behavior: "smooth" });
    });

    const resetBtn = document.getElementById("resetEnquiryBtn");
    if (resetBtn) {
        resetBtn.addEventListener("click", () => {
            responseBox.hidden = true;
            form.querySelectorAll(".error-msg").forEach((el) => (el.textContent = ""));
            form.querySelectorAll(".input-error, .input-valid").forEach((el) => {
                el.classList.remove("input-error", "input-valid");
            });
        });
    }
}

/* --------------------------------------------------------------------------
   7. CONTACT FORM VALIDATION, AJAX SIMULATION & MAILTO COMPILER (contact.html)
   -------------------------------------------------------------------------- */
function initContactFormValidation() {
    const form = document.getElementById("contactForm");
    const responseBox = document.getElementById("contactResponseBox");
    if (!form || !responseBox) return;

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        let isValid = true;

        const name = document.getElementById("senderName");
        const email = document.getElementById("senderEmail");
        const phone = document.getElementById("senderPhone");
        const msgType = document.getElementById("messageType");
        const branchEmail = document.getElementById("preferredBranch");
        const message = document.getElementById("feedbackMsg");

        if (name.value.trim().length < 3) {
            setFieldError(name, "senderNameError", "Please enter your full name (minimum 3 characters).");
            isValid = false;
        } else {
            clearFieldError(name, "senderNameError");
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.value.trim())) {
            setFieldError(email, "senderEmailError", "Please enter a valid email address.");
            isValid = false;
        } else {
            clearFieldError(email, "senderEmailError");
        }

        const cleanPhone = phone.value.replace(/\s+/g, "");
        const phoneRegex = /^(\+27|0)[0-9]{9}$/;
        if (!phoneRegex.test(cleanPhone)) {
            setFieldError(phone, "senderPhoneError", "Please enter a valid 10-digit South African phone number.");
            isValid = false;
        } else {
            clearFieldError(phone, "senderPhoneError");
        }

        if (!msgType.value) {
            setFieldError(msgType, "messageTypeError", "Please select a message category.");
            isValid = false;
        } else {
            clearFieldError(msgType, "messageTypeError");
        }

        if (message.value.trim().length < 15) {
            setFieldError(message, "feedbackMsgError", "Please type a complete message (at least 15 characters).");
            isValid = false;
        } else {
            clearFieldError(message, "feedbackMsgError");
        }

        if (!isValid) {
            responseBox.hidden = true;
            return;
        }

        // Compile mailto URI for the selected recipient
        const recipient = branchEmail.value;
        const subject = encodeURIComponent(`[KZN Collectibles] ${msgType.value} - from ${name.value.trim()}`);
        const bodyText = `Sender Name: ${name.value.trim()}\nSender Email: ${email.value.trim()}\nContact Number: ${phone.value.trim()}\nCategory: ${msgType.value}\n\nMessage:\n${message.value.trim()}`;
        const mailtoURI = `mailto:${recipient}?subject=${subject}&body=${encodeURIComponent(bodyText)}`;

        form.setAttribute("action", `mailto:${recipient}`);

        responseBox.innerHTML = `
            <h3>Message Validated &amp; Compiled Successfully</h3>
            <p><strong>Recipient Branch:</strong> ${sanitizeHTML(recipient)}</p>
            <p><strong>Subject:</strong> [KZN Collectibles] ${sanitizeHTML(msgType.value)} - from ${sanitizeHTML(name.value)}</p>
            <p>Your message has been processed asynchronously. Click the button below to launch your email client with the pre-compiled email, or our system will open it automatically:</p>
            <p><a href="${mailtoURI}" class="btn btn-primary">Send Compiled Email to ${sanitizeHTML(recipient)}</a></p>
        `;
        responseBox.hidden = false;
        responseBox.scrollIntoView({ behavior: "smooth" });

        // Trigger mailto client
        window.location.href = mailtoURI;
    });
}

function setFieldError(inputEl, errorId, message) {
    inputEl.classList.add("input-error");
    inputEl.classList.remove("input-valid");
    const errEl = document.getElementById(errorId);
    if (errEl) errEl.textContent = message;
}

function clearFieldError(inputEl, errorId) {
    inputEl.classList.remove("input-error");
    inputEl.classList.add("input-valid");
    const errEl = document.getElementById(errorId);
    if (errEl) errEl.textContent = "";
}