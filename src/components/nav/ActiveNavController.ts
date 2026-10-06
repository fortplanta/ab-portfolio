/**
 * Drives the persistent project nav from scroll position.
 *
 * Core rule: a project is "active" while an invisible horizontal line near
 * the top of the viewport falls within its <section>'s bounding box. This
 * is monotonic in scroll position (unlike "largest visible %"), which is
 * what keeps it correct across wildly different project heights.
 *
 * See /Users/anton/.claude/plans/federated-wondering-sifakis.md for the
 * full design rationale.
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

function init() {
  const navEl = document.getElementById("site-nav");
  const projectEls = Array.from(document.querySelectorAll<HTMLElement>(".project-section"));
  const navLinks = Array.from(document.querySelectorAll<HTMLAnchorElement>("[data-nav-link]"));
  const sectionEls = Array.from(document.querySelectorAll<HTMLElement>("[data-section-id]"));

  if (!navEl || projectEls.length === 0) return;

  let activeLinePx = ACTIVE_LINE_BUFFER_PX;
  let viewportHeight = window.innerHeight;

  const projectIntersecting = new Map<Element, boolean>(projectEls.map((el) => [el, false]));
  const sectionIntersecting = new Map<Element, boolean>(sectionEls.map((el) => [el, false]));

  let projectObserver: IntersectionObserver | undefined;
  let sectionObserver: IntersectionObserver | undefined;
  let currentActiveSlug: string | undefined;
  const indicatorEl = document.getElementById("nav-indicator");

  /**
   * One element sliding/resizing to the active link, instead of each pill
   * independently transitioning its own background-color. Two separate
   * elements fading between colors reads as two objects swapping; a single
   * element moving reads as one continuous thing — same idea as the design
   * skill's "duplicate + clip" tab technique, achieved here by moving a
   * shared element instead of clipping a second copy of the tab list.
   */
  function positionIndicator(linkEl: HTMLElement | undefined, instant: boolean) {
    if (!indicatorEl || !linkEl) return;
    const navRect = navEl!.getBoundingClientRect();
    const linkRect = linkEl.getBoundingClientRect();
    if (instant) indicatorEl.classList.add("no-transition");
    indicatorEl.style.width = `${linkRect.width}px`;
    indicatorEl.style.height = `${linkRect.height}px`;
    indicatorEl.style.transform = `translate(${linkRect.left - navRect.left}px, ${linkRect.top - navRect.top}px)`;
    if (instant) {
      void indicatorEl.offsetWidth; // flush the instant position before re-enabling transitions
      indicatorEl.classList.remove("no-transition");
    }
  }

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

  function applyActiveProject(slug: string, instant = false) {
    if (slug !== currentActiveSlug) {
      currentActiveSlug = slug;
      for (const link of navLinks) {
        if (link.dataset.slug === slug) {
          link.setAttribute("aria-current", "true");
        } else {
          link.removeAttribute("aria-current");
        }
      }
    }
    positionIndicator(
      navLinks.find((link) => link.dataset.slug === slug),
      instant,
    );
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
    applyActiveProject(activeProjectEl.dataset.projectSlug!, true);
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
    // Keeps native CSS scroll-snap's landing position in agreement with
    // scrollToProject()'s own nav-occlusion-aware target. Without this,
    // snapping lands a project's raw top at scrollY=0 (under the nav) while
    // clicking a nav link lands it just below the nav — two different
    // "resting" positions for the same project, which is what made snap
    // feel inconsistent with ordinary scrolling.
    document.documentElement.style.scrollPaddingTop = `${navOcclusion}px`;
    buildObservers();
    recomputeFromRects();
  }

  // --- Resize / layout-shift handling -------------------------------------

  let resizeTimer: number | undefined;
  window.addEventListener("resize", () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(recomputeActiveLine, 150);
  });

  let resizeObserverFrame: number | undefined;
  const bodyResizeObserver = new ResizeObserver(() => {
    if (resizeObserverFrame) return;
    resizeObserverFrame = requestAnimationFrame(() => {
      resizeObserverFrame = undefined;
      recomputeActiveLine();
    });
  });
  bodyResizeObserver.observe(document.body);

  // --- Click-to-navigate ---------------------------------------------------

  /**
   * No custom "is the scroll done yet" bookkeeping here: the passive-scroll
   * IntersectionObserver set up in buildObservers() is already watching
   * every project boundary continuously, so it naturally tracks aria-current
   * and the URL through a native smooth-scroll animation exactly as it
   * would through an ordinary wheel scroll, and converges on the right
   * project the moment the animation actually settles — whatever its real
   * duration turns out to be. Trying to out-guess that with our own
   * arrival/stability heuristics only reintroduces bugs a plain IO callback
   * already avoids.
   */
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
    const instant = opts.instant || prefersReducedMotion();
    applyActiveProject(slug, instant);
    window.scrollTo({ top: targetY, behavior: instant ? "auto" : "smooth" });
  }

  navEl.addEventListener("click", (event) => {
    const target = event.target as Element;
    const link = target.closest<HTMLAnchorElement>("a[data-nav-link]");
    if (!link) return;
    const slug = link.dataset.slug;
    if (!slug) return;
    const targetEl = document.getElementById(slug);
    if (!targetEl) return;

    event.preventDefault();
    // event.detail === 0 reliably indicates a keyboard/synthetic activation
    // (Enter/Space on a focused link) rather than a real mouse click; the
    // brief requires keyboard-triggered navigation to be immediate.
    const isKeyboardActivation = (event as MouseEvent).detail === 0;
    scrollToProject(targetEl, slug, { updateHistory: "push", instant: isKeyboardActivation });
  });

  // `history.scrollRestoration = "manual"` (set below) stops the browser
  // from auto-scrolling on back/forward, so we have to do it ourselves. An
  // empty hash means "back to the un-hashed root", which defaults to the
  // first project — same as a fresh, hash-less initial load.
  window.addEventListener("popstate", () => {
    const slug = location.hash.slice(1);
    const targetEl = slug ? document.getElementById(slug) : projectEls[0];
    const targetSlug = slug || projectEls[0].dataset.projectSlug!;
    if (targetEl && targetEl.classList.contains("project-section")) {
      scrollToProject(targetEl, targetSlug, { updateHistory: "none", instant: true });
    }
  });

  // --- Initial state ---------------------------------------------------

  recomputeActiveLine();

  const initialSlug = location.hash.slice(1);
  const initialTarget = initialSlug ? document.getElementById(initialSlug) : null;
  if (initialTarget && initialTarget.classList.contains("project-section")) {
    scrollToProject(initialTarget, initialSlug, { updateHistory: "none", instant: true });
  }
}

if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
