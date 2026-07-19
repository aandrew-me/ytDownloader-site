// ---- Theme Switcher Logic ----
const themeButtons = document.querySelectorAll(".theme-btn");
let currentTheme = localStorage.getItem("theme") || "system";

function applyTheme(theme) {
	let resolvedTheme = theme;
	if (theme === "system") {
		resolvedTheme = window.matchMedia("(prefers-color-scheme: dark)")
			.matches
			? "dark"
			: "light";
	}
	document.documentElement.setAttribute("data-theme", resolvedTheme);

	themeButtons.forEach((btn) => {
		btn.classList.toggle("active", btn.dataset.themeChoice === theme);
	});
}

// Listen for system theme changes
window
	.matchMedia("(prefers-color-scheme: dark)")
	.addEventListener("change", (e) => {
		if (
			localStorage.getItem("theme") === "system" ||
			!localStorage.getItem("theme")
		) {
			applyTheme("system");
		}
	});

themeButtons.forEach((btn) => {
	btn.addEventListener("click", () => {
		const choice = btn.dataset.themeChoice;
		localStorage.setItem("theme", choice);
		applyTheme(choice);
	});
});

// Initial apply to set active states correctly
applyTheme(currentTheme);

// ---- Platform Detection ----
function detectPlatform() {
	const platform = (
		navigator.userAgentData?.platform ||
		navigator.platform ||
		""
	).toLowerCase();
	const ua = navigator.userAgent.toLowerCase();
	if (platform.includes("win") || ua.includes("win")) return "windows";
	if (platform.includes("mac") || ua.includes("mac")) return "macos";
	if (platform.includes("linux") || ua.includes("linux")) return "linux";

	return "windows";
}

const platformLinks = {
	windows: {
		url: "https://github.com/aandrew-me/ytDownloader/releases/latest/download/YTDownloader_Win.exe",
		name: "Windows",
		icon: "fa-windows",
	},
	macos: {
		url: "https://github.com/aandrew-me/ytDownloader/releases/latest/download/YTDownloader_Mac_arm64.dmg",
		name: "macOS",
		icon: "fa-apple",
	},
	linux: {
		url: "https://github.com/aandrew-me/ytDownloader/releases/latest/download/YTDownloader_Linux.AppImage",
		name: "Linux",
		icon: "fa-linux",
	},
};

const detected = detectPlatform();
const link = platformLinks[detected];

// Update hero CTA
document.getElementById("hero-platform").textContent = link.name;
document.getElementById("hero-icon").className = `fab ${link.icon} text-2xl`;

// Activate detected platform tab
document.querySelectorAll(".tab-btn").forEach((btn) => {
	btn.classList.toggle("active", btn.dataset.tab === detected);
});
document.querySelectorAll(".tab-content").forEach((c) => {
	c.classList.toggle("active", c.dataset.content === detected);
});

// Tab switching
document.querySelectorAll(".tab-btn").forEach((btn) => {
	btn.addEventListener("click", () => {
		document
			.querySelectorAll(".tab-btn")
			.forEach((b) => b.classList.remove("active"));
		btn.classList.add("active");
		const target = btn.dataset.tab;
		document.querySelectorAll(".tab-content").forEach((c) => {
			c.classList.remove("active");
		});
		// Force reflow for animation
		requestAnimationFrame(() => {
			document
				.querySelector(`.tab-content[data-content="${target}"]`)
				.classList.add("active");
		});
	});
});

// Toast & Copy Logic
const toast = document.getElementById("toast");
const toastMsg = document.getElementById("toast-msg");
let toastTimer;
function showToast(msg) {
	toastMsg.textContent = msg;
	toast.classList.add("show");
	clearTimeout(toastTimer);
	toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
}

document.querySelectorAll(".copy-btn").forEach((btn) => {
	btn.addEventListener("click", async (e) => {
		e.preventDefault();
		const text = btn.dataset.copy;
		const icon = btn.querySelector("i");
		const span = btn.querySelector("span");
		const originalIconClass = icon.className;
		const originalText = span.textContent;

		try {
			await navigator.clipboard.writeText(text);
			btn.classList.add("copied");
			span.textContent = "Copied!";
			icon.className = "fas fa-check";
			showToast("Command copied to clipboard");
			setTimeout(() => {
				btn.classList.remove("copied");
				span.textContent = originalText;
				icon.className = originalIconClass;
			}, 2200);
		} catch (err) {
			// Fallback for older browsers
			const textarea = document.createElement("textarea");
			textarea.value = text;
			textarea.style.position = "fixed";
			textarea.style.opacity = "0";
			document.body.appendChild(textarea);
			textarea.select();
			try {
				document.execCommand("copy");
				btn.classList.add("copied");
				span.textContent = "Copied!";
				icon.className = "fas fa-check";
				showToast("Command copied to clipboard");
				setTimeout(() => {
					btn.classList.remove("copied");
					span.textContent = originalText;
					icon.className = originalIconClass;
				}, 2200);
			} catch (e2) {
				showToast("Copy failed — please copy manually");
			}
			document.body.removeChild(textarea);
		}
	});
});

// ---- Scroll Reveal ----
const io = new IntersectionObserver(
	(entries) => {
		entries.forEach((e) => {
			if (e.isIntersecting) {
				e.target.classList.add("in");
				io.unobserve(e.target);
			}
		});
	},
	{threshold: 0.12, rootMargin: "0px 0px -60px 0px"},
);

document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

// Mac Architecture Detection
if (
	detected === "macos" &&
	navigator.userAgentData &&
	navigator.userAgentData.getHighEntropyValues
) {
	navigator.userAgentData
		.getHighEntropyValues(["architecture"])
		.then((data) => {
			if (
				data.architecture &&
				(data.architecture.includes("x86") ||
					data.architecture.includes("amd"))
			) {
				platformLinks.macos.url =
					"https://github.com/aandrew-me/ytDownloader/releases/latest/download/YTDownloader_Mac_x64.dmg";
				document.getElementById("hero-download").href =
					platformLinks.macos.url;
			}
		})
		.catch(() => {});
}

// ---- Smooth Scrolling ----
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
	anchor.addEventListener("click", function (e) {
		const target = document.querySelector(this.getAttribute("href"));
		if (target) {
			e.preventDefault();
			target.scrollIntoView({behavior: "smooth", block: "start"});
		}
	});
});
