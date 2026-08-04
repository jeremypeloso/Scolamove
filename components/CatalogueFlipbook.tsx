"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import HTMLFlipBook from "react-pageflip";

const PDF_URL = "/catalogue/voyages-scolaires-2026.pdf";
const MANIFEST_URL = "/catalogue/pages/manifest.json";
const FALLBACK_PAGES = 71;

const pageSrc = (n: number) =>
  `/catalogue/pages/page-${String(n).padStart(2, "0")}.webp`;

// Ratio A3 portrait (largeur / hauteur)
const PAGE_WIDTH = 500;
const PAGE_HEIGHT = 707;

type FlipBookApi = {
  pageFlip: () => {
    flipNext: () => void;
    flipPrev: () => void;
    turnToPage: (page: number) => void;
    getCurrentPageIndex: () => number;
  };
};

export default function CatalogueFlipbook() {
  const bookRef = useRef<FlipBookApi | null>(null);
  const shellRef = useRef<HTMLDivElement | null>(null);
  const [totalPages, setTotalPages] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [ready, setReady] = useState(false);

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

  // Navigation clavier
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") flipNext();
      if (e.key === "ArrowLeft") flipPrev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [flipNext, flipPrev]);

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
            mobileScrollSupport={true}
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
            onClick={toggleFullscreen}
          >
            {isFullscreen ? "Quitter le plein écran" : "Plein écran"}
          </button>
          <a className="flipbook-btn flipbook-btn-primary" href={PDF_URL} download>
            Télécharger le PDF
          </a>
        </div>
      </div>
    </div>
  );
}
