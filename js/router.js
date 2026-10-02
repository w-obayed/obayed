/**
 * ==========================================================================
 * OBAYED Agency - Lightweight Client-Side Router (Next.js Style)
 * ==========================================================================
 */

(function () {
  'use strict';

  // Route Definitions & Clean URL Mappings
  const ROUTE_MAP = [
    {
      clean: './index.html',
      file: 'index.html',
      aliases: ['/', '/index', '/index.html']
    },
    {
      clean: './service.html',
      file: 'service.html',
      aliases: ['/services', '/Services', '/service', '/service.html']
    },
    {
      clean: './obayed-crm.html',
      file: 'obayed-crm.html',
      aliases: ['/obayedcrm', '/obayedCRM', '/obayed-crm', '/obayed-crm.html']
    },
    {
      clean: './white-label-whatsapp-crm.html',
      file: 'white-label-whatsapp-crm.html',
      aliases: [
        '/white-label crm',
        '/White-Label CRM',
        '/white-label-crm',
        '/White-Label-CRM',
        '/white-label-whatsapp-crm',
        '/white-label-whatsapp-crm.html'
      ]
    },
    {
      clean: './cold-email-work.html',
      file: 'cold-email-work.html',
      aliases: [
        '/cold-email-work',
        '/cold-email-work.html',
        '/case-study',
        '/Case-Study'
      ]
    },
    {
      clean: '/terms-of-service-page',
      file: 'terms-of-service.html',
      aliases: [
        '/terms-of-service-page',
        '/terms-of-service',
        '/terms',
        '/terms-of-service.html'
      ]
    },
    {
      clean: '/privacy-policy-page',
      file: 'privacy-policy.html',
      aliases: [
        '/privacy-policy-page',
        '/privacy-policy',
        '/privacy',
        '/privacy-policy.html'
      ]
    }
  ];

  const PAGE_SPECIFIC_CSS = [
    'service.css',
    'obayed-crm.css',
    'white-label-whatsapp-crm.css',
    'cold-email-work.css',
    'legal-pages.css'
  ];

  let currentAbortController = null;
  let loadingTimer = null;

  /**
   * Helper: Normalize pathname to route info
   */
  function matchRoute(pathname) {
    const cleanPath = decodeURIComponent(pathname).toLowerCase().replace(/\/$/, '') || '/';
    for (const route of ROUTE_MAP) {
      for (const alias of route.aliases) {
        const normAlias = alias.toLowerCase().replace(/\/$/, '') || '/';
        if (cleanPath === normAlias) {
          return route;
        }
      }
    }
    return null;
  }

  /**
   * Resolve target HTML file and clean URL path
   */
  function resolveRoute(urlObj) {
    const route = matchRoute(urlObj.pathname);
    if (route) {
      // Build clean full path
      const isFileProto = window.location.protocol === 'file:';
      const cleanBase = isFileProto ? ('./' + route.file) : route.clean;
      const fullClean = cleanBase + urlObj.search + urlObj.hash;
      // Build target fetch URL
      const currentDir = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1);
      const fetchUrl = currentDir + route.file + urlObj.search;
      return { cleanUrl: cleanBase, fullCleanUrl: fullClean, fetchUrl, file: route.file };
    }

    // Default fallback for unmatched routes
    let cleanPath = urlObj.pathname.replace(/\.html$/, '');
    if (!cleanPath) cleanPath = '/';
    return {
      cleanUrl: cleanPath,
      fullCleanUrl: cleanPath + urlObj.search + urlObj.hash,
      fetchUrl: urlObj.pathname + urlObj.search,
      file: urlObj.pathname.split('/').pop() || 'index.html'
    };
  }

  /**
   * Show progress loading bar
   */
  function showLoading() {
    let bar = document.getElementById('router-loading-bar');
    if (!bar) {
      bar = document.createElement('div');
      bar.id = 'router-loading-bar';
      document.body.appendChild(bar);
    }
    bar.classList.add('loading');
    bar.style.width = '30%';

    if (loadingTimer) clearInterval(loadingTimer);
    loadingTimer = setInterval(() => {
      const currentWidth = parseFloat(bar.style.width) || 30;
      if (currentWidth < 85) {
        bar.style.width = (currentWidth + Math.random() * 12) + '%';
      }
    }, 80);

    const main = document.querySelector('main');
    if (main) main.classList.add('page-transitioning');
  }

  /**
   * Hide progress loading bar
   */
  function hideLoading() {
    const bar = document.getElementById('router-loading-bar');
    if (loadingTimer) clearInterval(loadingTimer);
    if (bar) {
      bar.style.width = '100%';
      setTimeout(() => {
        bar.classList.remove('loading');
        bar.style.width = '0%';
      }, 200);
    }
    const main = document.querySelector('main');
    if (main) main.classList.remove('page-transitioning');
  }

  /**
   * Update active nav link classes in persistent navigation header
   */
  function updateActiveNavLinks(targetFile) {
    const navLinks = document.querySelectorAll('#main-nav a, .nav-links a');
    navLinks.forEach((link) => {
      const href = link.getAttribute('href');
      if (!href) return;
      if (href.startsWith('#') || href.startsWith('tel:') || href.startsWith('mailto:')) return;

      try {
        const linkUrl = new URL(href, window.location.href);
        const matched = matchRoute(linkUrl.pathname);
        const linkFile = matched ? matched.file : linkUrl.pathname.split('/').pop();

        if (linkFile === targetFile && !linkUrl.hash) {
          link.classList.add('text-primary');
        } else {
          link.classList.remove('text-primary');
        }
      } catch (e) {
        // Ignore invalid URLs
      }
    });

    // Auto-close mobile menu if open
    if (typeof window.closeMobileMenu === 'function') {
      window.closeMobileMenu();
    } else {
      const navMenu = document.querySelector('.nav-links');
      const hamburger = document.querySelector('.hamburger-menu');
      if (navMenu && navMenu.classList.contains('active')) {
        navMenu.classList.remove('active', 'is-active');
        if (hamburger) {
          hamburger.classList.remove('is-active');
          hamburger.setAttribute('aria-expanded', 'false');
        }
      }
      document.body.classList.remove('nav-open');
    }
  }

  /**
   * Helper: Check if two stylesheet hrefs refer to the same resource
   */
  function isSameStylesheet(href1, href2) {
    if (!href1 || !href2) return false;
    if (href1 === href2) return true;
    try {
      return new URL(href1, window.location.href).href === new URL(href2, window.location.href).href;
    } catch (e) {
      return false;
    }
  }

  /**
   * Helper: Load a stylesheet and return a Promise that resolves when it is ready
   */
  function loadStylesheet(href, signal) {
    return new Promise((resolve) => {
      if (signal && signal.aborted) {
        resolve();
        return;
      }

      const currentLinks = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
      const exists = currentLinks.some((cl) => {
        const clHref = cl.getAttribute('href') || '';
        return isSameStylesheet(clHref, href) || isSameStylesheet(cl.href, href);
      });

      if (exists) {
        resolve();
        return;
      }

      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;

      let finished = false;
      let timeoutId = null;

      function cleanup() {
        if (timeoutId) clearTimeout(timeoutId);
        link.removeEventListener('load', onLoad);
        link.removeEventListener('error', onError);
        if (signal) {
          signal.removeEventListener('abort', onAbort);
        }
      }

      function onLoad() {
        if (finished) return;
        finished = true;
        cleanup();
        resolve();
      }

      function onError() {
        if (finished) return;
        finished = true;
        cleanup();
        // Resolve even on error so navigation is never permanently blocked
        resolve();
      }

      function onAbort() {
        if (finished) return;
        finished = true;
        cleanup();
        link.remove();
        resolve();
      }

      link.addEventListener('load', onLoad);
      link.addEventListener('error', onError);

      if (signal) {
        signal.addEventListener('abort', onAbort);
      }

      // Safety timeout to prevent navigation from hanging if a network request stalls
      timeoutId = setTimeout(onLoad, 2500);

      document.head.appendChild(link);

      // Check if stylesheet is already available synchronously (e.g. from memory cache)
      try {
        if (link.sheet && link.sheet.cssRules && link.sheet.cssRules.length > 0) {
          onLoad();
        }
      } catch (e) {
        // Cross-origin stylesheets may throw SecurityError on cssRules access; onLoad handles it via event
      }
    });
  }

  /**
   * Load all required head stylesheets for fetched document before rendering
   */
  async function loadRequiredStylesheets(fetchedDoc, signal) {
    const fetchedLinks = Array.from(fetchedDoc.querySelectorAll('link[rel="stylesheet"]'));
    const currentLinks = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));

    const loadPromises = [];

    fetchedLinks.forEach((link) => {
      const href = link.getAttribute('href');
      if (!href) return;
      const exists = currentLinks.some((cl) => {
        const clHref = cl.getAttribute('href') || '';
        return isSameStylesheet(clHref, href) || isSameStylesheet(cl.href, href);
      });

      if (!exists) {
        loadPromises.push(loadStylesheet(href, signal));
      }
    });

    if (loadPromises.length > 0) {
      await Promise.all(loadPromises);
    }
  }

  /**
   * Remove obsolete page-specific stylesheets no longer needed by fetched document
   */
  function removeObsoleteStylesheets(fetchedDoc) {
    const fetchedLinks = Array.from(fetchedDoc.querySelectorAll('link[rel="stylesheet"]'));
    const currentLinks = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
    const fetchedHrefs = fetchedLinks.map((l) => l.getAttribute('href') || '');

    currentLinks.forEach((link) => {
      const href = link.getAttribute('href') || '';
      const isPageSpecific = PAGE_SPECIFIC_CSS.some((cssName) => href.includes(cssName));
      if (isPageSpecific) {
        const cssFilename = href.split('?')[0].split('#')[0].split('/').pop();
        const stillNeeded = fetchedHrefs.some((fHref) => fHref.includes(cssFilename));
        if (!stillNeeded) {
          link.remove();
        }
      }
    });
  }

  /**
   * Synchronize page-specific head stylesheets (backward compatible wrapper)
   */
  async function syncHeadStylesheets(fetchedDoc, signal) {
    await loadRequiredStylesheets(fetchedDoc, signal);
    removeObsoleteStylesheets(fetchedDoc);
  }

  /**
   * Main Navigation Method
   */
  async function navigate(url, options = {}) {
    const { pushState = true, scroll = true, state = null } = options;

    let targetUrl;
    try {
      targetUrl = new URL(url, window.location.href);
    } catch (err) {
      window.location.href = url;
      return;
    }

    const currentUrl = new URL(window.location.href);
    const { cleanUrl, fullCleanUrl, fetchUrl, file: targetFile } = resolveRoute(targetUrl);

    // Abort previous request if pending
    if (currentAbortController) {
      currentAbortController.abort();
    }
    currentAbortController = new AbortController();

    showLoading();

    try {
      const response = await fetch(fetchUrl, {
        signal: currentAbortController.signal,
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
      });

      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}`);
      }

      const htmlText = await response.text();
      const parser = new DOMParser();
      const fetchedDoc = parser.parseFromString(htmlText, 'text/html');

      const newMain = fetchedDoc.querySelector('main');
      if (!newMain) {
        throw new Error('No <main> tag found in fetched document.');
      }

      // Ensure all required stylesheets are loaded and ready before displaying new HTML
      await loadRequiredStylesheets(fetchedDoc, currentAbortController.signal);

      if (currentAbortController.signal.aborted) {
        return;
      }

      // Save scroll position of current state before replacing
      if (history.state) {
        history.replaceState(
          { ...history.state, scrollX: window.scrollX, scrollY: window.scrollY },
          document.title
        );
      }

      // Update Title
      if (fetchedDoc.title) {
        document.title = fetchedDoc.title;
      }

      // Swap Main Element Content & Attributes
      const currentMain = document.querySelector('main');
      if (currentMain) {
        currentMain.innerHTML = newMain.innerHTML;
        // Copy attributes
        Array.from(newMain.attributes).forEach((attr) => {
          currentMain.setAttribute(attr.name, attr.value);
        });
      }

      // Remove obsolete page-specific stylesheets only after new page has rendered
      removeObsoleteStylesheets(fetchedDoc);

      // Push history state if requested
      if (pushState) {
        history.pushState(
          { path: fullCleanUrl, targetFile, scrollX: 0, scrollY: 0 },
          document.title,
          fullCleanUrl
        );
      }

      // Update Nav Active state
      updateActiveNavLinks(targetFile);

      // Handle Scroll Behavior
      if (scroll) {
        if (targetUrl.hash) {
          const hashId = targetUrl.hash.slice(1);
          const elem = document.getElementById(hashId) || document.querySelector(`[name="${hashId}"]`);
          if (elem) {
            elem.scrollIntoView({ behavior: 'smooth' });
          } else {
            window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
          }
        } else if (state && (state.scrollX !== undefined || state.scrollY !== undefined)) {
          window.scrollTo({ top: state.scrollY || 0, left: state.scrollX || 0, behavior: 'instant' });
        } else {
          window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        }
      }

      // Re-initialize dynamic page scripts
      if (typeof window.initPageScripts === 'function') {
        window.initPageScripts();
      }

      // Dispatch custom page transition event
      document.dispatchEvent(new CustomEvent('page:loaded', { detail: { url: fullCleanUrl, file: targetFile } }));
    } catch (err) {
      if (err.name === 'AbortError') {
        return; // Ignore aborts
      }
      console.warn('[Router] Navigation fetch failed, falling back to full load:', err);
      window.location.href = url;
    } finally {
      hideLoading();
    }
  }

  /**
   * Click Event Interceptor
   */
  function handleClick(e) {
    // Ignore non-primary or modified clicks
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.defaultPrevented) {
      return;
    }

    // Find closest anchor link
    const anchor = e.target.closest('a');
    if (!anchor) return;

    const href = anchor.getAttribute('href');
    if (!href) return;

    // Filter out bypassed link types
    if (
      anchor.target === '_blank' ||
      anchor.hasAttribute('download') ||
      anchor.hasAttribute('data-native') ||
      anchor.hasAttribute('data-no-routing') ||
      href.startsWith('mailto:') ||
      href.startsWith('tel:') ||
      href.startsWith('javascript:') ||
      href.startsWith('data:') ||
      href.includes('download')
    ) {
      return;
    }

    let targetUrl;
    try {
      targetUrl = new URL(href, window.location.href);
    } catch (err) {
      return;
    }

    // External domain check
    if (targetUrl.origin !== window.location.origin) {
      return;
    }

    // Check if it's a hash jump on the current page
    const currentUrl = new URL(window.location.href);
    const targetRoute = resolveRoute(targetUrl);
    const currentRoute = resolveRoute(currentUrl);

    if (targetRoute.file === currentRoute.file) {
      if (targetUrl.hash) {
        // Hash anchor on the same page
        e.preventDefault();
        const hashId = targetUrl.hash.slice(1);
        const elem = document.getElementById(hashId) || document.querySelector(`[name="${hashId}"]`);
        if (elem) {
          elem.scrollIntoView({ behavior: 'smooth' });
        }
        history.pushState(
          { path: currentRoute.fullCleanUrl, targetFile: currentRoute.file, scrollX: window.scrollX, scrollY: window.scrollY },
          document.title,
          targetRoute.cleanUrl + targetUrl.search + targetUrl.hash
        );
        return;
      }
      // Clicking link to current page without hash - scroll to top
      e.preventDefault();
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      return;
    }

    // Intercept client-side routing
    e.preventDefault();
    navigate(href, { pushState: true, scroll: true });
  }

  /**
   * Browser Back/Forward Popstate Handler
   */
  function handlePopState(e) {
    const fullUrl = window.location.pathname + window.location.search + window.location.hash;
    navigate(fullUrl, { pushState: false, scroll: true, state: e.state });
  }

  /**
   * Initialize Router
   */
  function init() {
    // Configure scroll restoration
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }

    // Intercept clicks
    document.addEventListener('click', handleClick);

    // Handle popstate
    window.addEventListener('popstate', handlePopState);

    // Initial URL cleanup (e.g. if loaded directly via /service.html -> clean up address bar to /Services)
    const currentUrl = new URL(window.location.href);
    const { cleanUrl, fullCleanUrl, file: targetFile } = resolveRoute(currentUrl);

    if (window.location.pathname.endsWith('.html')) {
      history.replaceState(
        { path: fullCleanUrl, targetFile, scrollX: window.scrollX, scrollY: window.scrollY },
        document.title,
        fullCleanUrl
      );
    } else if (!history.state) {
      history.replaceState(
        { path: fullCleanUrl, targetFile, scrollX: window.scrollX, scrollY: window.scrollY },
        document.title,
        fullCleanUrl
      );
    }

    // Set initial nav active state
    updateActiveNavLinks(targetFile);
  }

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Export public router object
  window.Router = {
    navigate,
    resolveRoute,
    loadRequiredStylesheets,
    removeObsoleteStylesheets,
    syncHeadStylesheets,
    init
  };
})();
