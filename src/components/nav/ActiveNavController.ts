/**
 * Drives the persistent project nav from scroll position.
 *
 * Core rule: a project is "active" while an invisible horizontal line near
 * the top of the viewport falls within its <section>'s bounding box. This
 * is monotonic in scroll position (unlike "largest visible %"), which is
 * what keeps it correct across wildly different project heights.
 *
 * Queries [data-project-slug] so the archive section (#all-projects) is
 * tracked alongside project sections without needing the project-section class.
 *
 * Uses AbortController cleanup so re-initialisation on every astro:page-load
 * event (required for Astro View Transitions) doesn't accumulate duplicate
 * listeners or observers.
 */

const ACTIVE_LINE_BUFFER_PX = 24;

/** Pure so the easy-to-flip rootMargin sign convention stays checkable in isolation. */
export function computeRootMargin(viewportHeight: number, activeLinePx: number): string {
  const bottom = Math.max(0, viewportHeight - activeLinePx);
  return `-${activeLinePx}px 0px -${bottom}px 0px`;
}

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

let abortController: AbortController | undefined;

function init() {
  // Clean up any previous initialisation (handles astro:page-load re-fires).
  abortController?.abort();
  abortController = undefined;

  const navEl = document.getElementById("site-nav");
  const projectEls = Array.from(document.querySelectorAll<HTMLElement>("[data-project-slug]"));
  const navLinks = Array.from(document.querySelectorAll<HTMLAnchorElement>("[data-nav-link]"));
  const sectionEls = Array.from(document.querySelectorAll<HTMLElement>("[data-section-id]"));

  if (!navEl || projectEls.length === 0) return;

  abortController = new AbortController();
  const signal = abortController.signal;

  let activeLinePx = ACTIVE_LINE_BUFFER_PX;
  let viewportHeight = window.innerHeight;

  const projectIntersecting = new Map<Element, boolean>(projectEls.map((el) => [el, false]));
  const sectionIntersecting = new Map<Element, boolean>(sectionEls.map((el) => [el, false]));

  let projectObserver: IntersectionObserver | undefined;
  let sectionObserver: IntersectionObserver | undefined;
  let currentActiveSlug: string | undefined;

  signal.addEventListener("abort", () => {
    projectObserver?.disconnect();
    sectionObserver?.disconnect();
  });

  /** Nav's own occlusion of the viewport's top edge, however it's currently laid out. */
  function getNavOcclusionPx(): number {
    const rect = navEl!.getBoundingClientRect();
    return rect.top <= 0 ? Math.max(0, rect.bottom) : 0;
  }

  function pickActive<T extends Element>(els: T[], intersecting: Map<Element, boolean>): T {
    for (let i = els.length - 1; i >= 0; i--) {
      if (intersecting.get(els[i])) return els[i];
    }
    return window.scrollY < 10 ? els[0] : els[els.length - 1];
  }

  function applyActiveProject(slug: string) {
    if (slug === currentActiveSlug) return;
    currentActiveSlug = slug;
    for (const link of navLinks) {
      if (link.dataset.slug === slug) {
        link.setAttribute("aria-current", "true");
      } else {
        link.removeAttribute("aria-current");
      }
    }
  }

  function applyActiveContrast(contrast: string | undefined) {
    if (!contrast) return;
    document.documentElement.dataset.navContrast = contrast;
  }

  function recomputeFromRects() {
    for (const el of projectEls) {
      const rect = el.getBoundingClientRect();
      projectIntersecting.set(el, rect.top <= activeLinePx && rect.bottom > activeLinePx);
    }
    for (const el of sectionEls) {
      const rect = el.getBoundingClientRect();
      sectionIntersecting.set(el, rect.top <= activeLinePx && rect.bottom > activeLinePx);
    }
    const activeProjectEl = pickActive(projectEls, projectIntersecting);
    applyActiveProject(activeProjectEl.dataset.projectSlug!);
    const activeSectionEl = pickActive(sectionEls, sectionIntersecting);
    applyActiveContrast(activeSectionEl?.dataset.navContrast);
  }

  function buildObservers() {
    projectObserver?.disconnect();
    sectionObserver?.disconnect();

    const rootMargin = computeRootMargin(viewportHeight, activeLinePx);

    projectObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          projectIntersecting.set(entry.target, entry.isIntersecting);
        }
        const activeEl = pickActive(projectEls, projectIntersecting);
        applyActiveProject(activeEl.dataset.projectSlug!);
        if (currentActiveSlug) {
          history.replaceState(null, "", `#${currentActiveSlug}`);
        }
      },
      { root: null, rootMargin, threshold: 0 },
    );
    for (const el of projectEls) projectObserver.observe(el);

    sectionObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          sectionIntersecting.set(entry.target, entry.isIntersecting);
        }
        const activeEl = pickActive(sectionEls, sectionIntersecting);
        applyActiveContrast(activeEl?.dataset.navContrast);
      },
      { root: null, rootMargin, threshold: 0 },
    );
    for (const el of sectionEls) sectionObserver.observe(el);
  }

  function recomputeActiveLine() {
    viewportHeight = window.innerHeight;
    const navOcclusion = getNavOcclusionPx();
    activeLinePx = navOcclusion + ACTIVE_LINE_BUFFER_PX;
    document.documentElement.style.scrollPaddingTop = `${navOcclusion}px`;
    buildObservers();
    recomputeFromRects();
  }

  // --- Resize / layout-shift handling -------------------------------------

  let resizeTimer: number | undefined;
  window.addEventListener(
    "resize",
    () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(recomputeActiveLine, 150);
    },
    { signal },
  );

  let resizeObserverFrame: number | undefined;
  const bodyResizeObserver = new ResizeObserver(() => {
    if (resizeObserverFrame) return;
    resizeObserverFrame = requestAnimationFrame(() => {
      resizeObserverFrame = undefined;
      recomputeActiveLine();
    });
  });
  bodyResizeObserver.observe(document.body);
  signal.addEventListener("abort", () => bodyResizeObserver.disconnect());

  // --- Click-to-navigate ---------------------------------------------------

  function scrollToProject(
    targetEl: HTMLElement,
    slug: string,
    opts: { updateHistory: "push" | "none"; instant?: boolean },
  ) {
    const targetY = Math.max(
      0,
      targetEl.getBoundingClientRect().top + window.scrollY - getNavOcclusionPx(),
    );

    if (opts.updateHistory === "push") {
      history.pushState(null, "", `#${slug}`);
    }
    applyActiveProject(slug);
    const instant = opts.instant || prefersReducedMotion();
    window.scrollTo({ top: targetY, behavior: instant ? "auto" : "smooth" });
  }

  navEl.addEventListener(
    "click",
    (event) => {
      const target = event.target as Element;
      const link = target.closest<HTMLAnchorElement>("a[data-nav-link]");
      if (!link) return;
      const slug = link.dataset.slug;
      if (!slug) return;
      const targetEl = document.getElementById(slug);
      if (!targetEl) return;

      event.preventDefault();
      const isKeyboardActivation = (event as MouseEvent).detail === 0;
      scrollToProject(targetEl, slug, { updateHistory: "push", instant: isKeyboardActivation });
    },
    { signal },
  );

  window.addEventListener(
    "popstate",
    () => {
      const slug = location.hash.slice(1);
      const targetEl = slug ? document.getElementById(slug) : projectEls[0];
      const targetSlug = slug || projectEls[0].dataset.projectSlug!;
      // Use dataset.projectSlug presence instead of class check so the archive
      // section (#all-projects) participates in back/forward navigation too.
      if (targetEl && "projectSlug" in targetEl.dataset) {
        scrollToProject(targetEl, targetSlug, { updateHistory: "none", instant: true });
      }
    },
    { signal },
  );

  // --- Initial state ---------------------------------------------------

  recomputeActiveLine();

  const initialSlug = location.hash.slice(1);
  const initialTarget = initialSlug ? document.getElementById(initialSlug) : null;
  if (initialTarget && "projectSlug" in initialTarget.dataset) {
    scrollToProject(initialTarget, initialSlug, { updateHistory: "none", instant: true });
  }
}

if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}

// astro:page-load fires on every navigation (initial load + View Transitions).
// The AbortController inside init() cleans up the previous run's listeners
// and observers before setting up new ones.
document.addEventListener("astro:page-load", init);

// Fallback for environments without View Transitions (astro:page-load might
// still fire, but this ensures we initialise even if it doesn't).
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init, { once: true });
} else {
  init();
}
