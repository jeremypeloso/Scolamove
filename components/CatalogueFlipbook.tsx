"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import HTMLFlipBook from "react-pageflip";

const PDF_URL = "/catalogue/voyages-scolaires-2026-2027.pdf";
const MANIFEST_URL = "/catalogue/pages/manifest.json";
const FALLBACK_PAGES = 71;

const pageSrc = (n: number) =>
  `/catalogue/pages/page-${String(n).padStart(2, "0")}.webp`;

// Ratio A3 portrait (largeur / hauteur)
const PAGE_WIDTH = 500;
const PAGE_HEIGHT = 707;

const ZOOM_MIN = 1;
const ZOOM_MAX = 3.5;

type FlipBookApi = {
  pageFlip: () => {
    flipNext: () => void;
    flipPrev: () => void;
    turnToPage: (page: number) => void;
    getCurrentPageIndex: () => number;
  };
};

/* ============================================================
   Visionneuse zoom (molette, pincement, déplacement)
   ============================================================ */

function ZoomViewer({
  page,
  totalPages,
  onChangePage,
  onClose,
}: {
  page: number;
  totalPages: number;
  onChangePage: (p: number) => void;
  onClose: () => void;
}) {
  const [scale, setScale] = useState(1.4);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const drag = useRef<{
    active: boolean;
    startX: number;
    startY: number;
    baseX: number;
    baseY: number;
  }>({ active: false, startX: 0, startY: 0, baseX: 0, baseY: 0 });
  const pinch = useRef<{ dist: number; scale: number } | null>(null);

  const clampScale = (s: number) =>
    Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, s));

  const resetView = useCallback(() => {
    setScale(1.4);
    setOffset({ x: 0, y: 0 });
  }, []);

  const zoomBy = useCallback((factor: number) => {
    setScale((s) => clampScale(s * factor));
  }, []);

  // Fermeture avec Échap + navigation flèches
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight" && page < totalPages - 1) {
        e.preventDefault();
        onChangePage(page + 1);
      }
      if (e.key === "ArrowLeft" && page > 0) {
        e.preventDefault();
        onChangePage(page - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, onChangePage, page, totalPages]);

  // Bloquer le scroll du body pendant le zoom
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // Recentrer à chaque changement de page
  useEffect(() => {
    resetView();
  }, [page, resetView]);

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    zoomBy(e.deltaY < 0 ? 1.15 : 1 / 1.15);
  };

  const startDrag = (x: number, y: number) => {
    drag.current = {
      active: true,
      startX: x,
      startY: y,
      baseX: offset.x,
      baseY: offset.y,
    };
  };

  const moveDrag = (x: number, y: number) => {
    if (!drag.current.active) return;
    setOffset({
      x: drag.current.baseX + (x - drag.current.startX),
      y: drag.current.baseY + (y - drag.current.startY),
    });
  };

  const endDrag = () => {
    drag.current.active = false;
    pinch.current = null;
  };

  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const d = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      pinch.current = { dist: d, scale };
      drag.current.active = false;
    } else if (e.touches.length === 1) {
      startDrag(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (pinch.current && e.touches.length === 2) {
      const d = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      setScale(clampScale((pinch.current.scale * d) / pinch.current.dist));
    } else if (e.touches.length === 1) {
      moveDrag(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  return (
    <div className="zoom-overlay" role="dialog" aria-label="Zoom sur la page">
      <div
        className="zoom-canvas"
        onWheel={onWheel}
        onMouseDown={(e) => {
          e.preventDefault();
          startDrag(e.clientX, e.clientY);
        }}
        onMouseMove={(e) => moveDrag(e.clientX, e.clientY)}
        onMouseUp={endDrag}
        onMouseLeave={endDrag}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={endDrag}
        onDoubleClick={() =>
          scale > 1.5 ? resetView() : setScale(clampScale(scale * 1.8))
        }
      >
        <img
          src={pageSrc(page + 1)}
          alt={`Catalogue — page ${page + 1} (zoom)`}
          draggable={false}
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
          }}
        />
      </div>

      <button
        type="button"
        className="zoom-close"
        onClick={onClose}
        aria-label="Fermer le zoom"
      >
        ✕
      </button>

      <button
        type="button"
        className="zoom-nav zoom-nav-left"
        onClick={() => onChangePage(page - 1)}
        disabled={page === 0}
        aria-label="Page précédente"
      >
        ‹
      </button>
      <button
        type="button"
        className="zoom-nav zoom-nav-right"
        onClick={() => onChangePage(page + 1)}
        disabled={page >= totalPages - 1}
        aria-label="Page suivante"
      >
        ›
      </button>

      <div className="zoom-toolbar">
        <button type="button" onClick={() => zoomBy(1 / 1.3)} aria-label="Réduire">
          −
        </button>
        <span>{Math.round(scale * 100)}%</span>
        <button type="button" onClick={() => zoomBy(1.3)} aria-label="Agrandir">
          +
        </button>
        <button type="button" onClick={resetView} className="zoom-reset">
          Recentrer
        </button>
        <span className="zoom-page-indicator">
          Page {page + 1} / {totalPages}
        </span>
      </div>
    </div>
  );
}

/* ============================================================
   Flipbook principal
   ============================================================ */

export default function CatalogueFlipbook() {
  const bookRef = useRef<FlipBookApi | null>(null);
  const shellRef = useRef<HTMLDivElement | null>(null);
  const [totalPages, setTotalPages] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [ready, setReady] = useState(false);
  const [zoomPage, setZoomPage] = useState<number | null>(null);

  // Nombre de pages lu depuis le manifest généré par le script
  useEffect(() => {
    fetch(MANIFEST_URL)
      .then((r) => (r.ok ? r.json() : null))
      .then((m) => setTotalPages(m?.totalPages ?? FALLBACK_PAGES))
      .catch(() => setTotalPages(FALLBACK_PAGES));
  }, []);

  const flipNext = useCallback(() => {
    bookRef.current?.pageFlip()?.flipNext();
  }, []);

  const flipPrev = useCallback(() => {
    bookRef.current?.pageFlip()?.flipPrev();
  }, []);

  const goToPage = useCallback((page: number) => {
    bookRef.current?.pageFlip()?.turnToPage(page);
  }, []);

  // Navigation clavier (désactivée quand le zoom est ouvert)
  useEffect(() => {
    if (zoomPage !== null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        flipNext();
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        flipPrev();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [flipNext, flipPrev, zoomPage]);

  // Suivi du mode plein écran
  useEffect(() => {
    const onFsChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  const toggleFullscreen = useCallback(() => {
    const el = shellRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      el.requestFullscreen?.();
    }
  }, []);

  const closeZoom = useCallback(() => {
    setZoomPage((p) => {
      // Synchroniser le livre sur la page consultée en zoom
      if (p !== null) goToPage(p);
      return null;
    });
  }, [goToPage]);

  if (totalPages === null) {
    return (
      <div className="flipbook-loading">
        <div className="flipbook-loading-spinner" />
        <p>Chargement du catalogue…</p>
      </div>
    );
  }

  return (
    <div
      ref={shellRef}
      className={`flipbook-shell${isFullscreen ? " flipbook-fullscreen" : ""}`}
    >
      <div className="flipbook-stage">
        <button
          type="button"
          className="flipbook-arrow flipbook-arrow-left"
          onClick={flipPrev}
          aria-label="Page précédente"
          disabled={currentPage === 0}
        >
          ‹
        </button>

        <div className={`flipbook-book${ready ? " is-ready" : ""}`}>
          <HTMLFlipBook
            width={PAGE_WIDTH}
            height={PAGE_HEIGHT}
            size="stretch"
            minWidth={260}
            maxWidth={620}
            minHeight={368}
            maxHeight={877}
            showCover={true}
            usePortrait={true}
            mobileScrollSupport={false}
            drawShadow={true}
            maxShadowOpacity={0.45}
            flippingTime={700}
            onFlip={(e: { data: number }) => setCurrentPage(e.data)}
            onInit={() => setReady(true)}
            ref={bookRef}
            className="flipbook-instance"
            style={{}}
            startPage={0}
            startZIndex={0}
            autoSize={true}
            clickEventForward={true}
            useMouseEvents={true}
            swipeDistance={30}
            showPageCorners={true}
            disableFlipByClick={false}
          >
            {Array.from({ length: totalPages }, (_, i) => {
              const n = i + 1;
              return (
                <div className="flipbook-page" key={n}>
                  <img
                    src={pageSrc(n)}
                    alt={`Catalogue Scolamove — page ${n}`}
                    loading={n <= 4 ? "eager" : "lazy"}
                    draggable={false}
                  />
                </div>
              );
            })}
          </HTMLFlipBook>
        </div>

        <button
          type="button"
          className="flipbook-arrow flipbook-arrow-right"
          onClick={flipNext}
          aria-label="Page suivante"
          disabled={currentPage >= totalPages - 1}
        >
          ›
        </button>
      </div>

      <div className="flipbook-toolbar">
        <div className="flipbook-counter">
          Page {currentPage + 1} / {totalPages}
        </div>

        <input
          type="range"
          className="flipbook-slider"
          min={0}
          max={totalPages - 1}
          value={currentPage}
          onChange={(e) => goToPage(Number(e.target.value))}
          aria-label="Aller à la page"
        />

        <div className="flipbook-actions">
          <button
            type="button"
            className="flipbook-btn"
            onClick={() => setZoomPage(currentPage)}
          >
            🔍 Zoom
          </button>
          <button
            type="button"
            className="flipbook-btn"
            onClick={toggleFullscreen}
          >
            {isFullscreen ? "Quitter le plein écran" : "Plein écran"}
          </button>
          <a
            className="flipbook-btn flipbook-btn-primary"
            href={PDF_URL}
            download="catalogue-2026-2027.pdf"
          >
            Télécharger le PDF
          </a>
        </div>
      </div>

      {zoomPage !== null && (
        <ZoomViewer
          page={zoomPage}
          totalPages={totalPages}
          onChangePage={(p) => setZoomPage(p)}
          onClose={closeZoom}
        />
      )}
    </div>
  );
}
