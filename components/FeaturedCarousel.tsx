"use client";

import { useEffect, useRef, useState } from "react";
import type { Sejour } from "@/lib/sejours";

type Highlight = {
  title: string;
  subtitle: string;
  image: string;
  badge: string;
  link: string;
};

type FeaturedCarouselProps = {
  sejours: Sejour[];
};

export default function FeaturedCarousel({ sejours }: FeaturedCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [adminHighlights, setAdminHighlights] = useState<Highlight[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("scolamove-highlights");

    if (saved) {
      setAdminHighlights(JSON.parse(saved));
    }
  }, []);

  function scroll(direction: "left" | "right") {
    if (!trackRef.current) return;

    trackRef.current.scrollBy({
      left: direction === "left" ? -320 : 320,
      behavior: "smooth",
    });
  }

  const cards =
    adminHighlights.length > 0
      ? adminHighlights
      : sejours.map((sejour) => ({
          title: sejour.title,
          subtitle: sejour.description,
          image: sejour.image,
          badge: sejour.badge,
          link: "/#devis",
        }));

  return (
    <div className="news-carousel">
      <button
        className="news-arrow news-arrow-left"
        type="button"
        onClick={() => scroll("left")}
        aria-label="Actualités précédentes"
      >
        ‹
      </button>

      <div className="news-track" ref={trackRef}>
  {cards.map((card, index) => (
    <a className="news-card" href={card.link || "/#devis"} key={`${card.title}-${index}`}>
      <div className="news-img" style={{ backgroundImage: `url(${card.image})` }}>
      </div>

      <div className="news-body">
  <h3>{card.title}</h3>
</div>
    </a>
  ))}
</div>

      <button
        className="news-arrow news-arrow-right"
        type="button"
        onClick={() => scroll("right")}
        aria-label="Actualités suivantes"
      >
        ›
      </button>
    </div>
  );
}