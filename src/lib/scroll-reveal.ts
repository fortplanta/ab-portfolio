/**
 * Subtle, one-time entrance for non-hero sections as they first scroll into
 * view. Skipped entirely under reduced motion, and the hidden "pre-reveal"
 * state is only ever added here — never present by default — so content
 * stays fully visible if JavaScript doesn't run at all.
 */
function init() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const revealEls = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
  if (revealEls.length === 0) return;

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.remove("pre-reveal");
        observer.unobserve(entry.target);
      }
    },
    { rootMargin: "0px 0px -10% 0px", threshold: 0 },
  );

  for (const el of revealEls) {
    const rect = el.getBoundingClientRect();
    const alreadyVisible = rect.top < window.innerHeight && rect.bottom > 0;
    if (alreadyVisible) continue; // already on screen at load — nothing to animate in
    el.classList.add("pre-reveal");
    observer.observe(el);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
