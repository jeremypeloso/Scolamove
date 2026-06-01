"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

type Highlight = {
  id: string;
  title: string;
  image: string;
  link: string | null;
  position: number;
  active: boolean;
};

export default function FeaturedCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [cards, setCards] = useState<Highlight[]>([]);
  const [loading, setLoading] = useState(true);

  const loadHighlights = useCallback(async () => {
    const { data, error } = await supabase
      .from("highlights")
      .select("*")
      .eq("active", true)
      .order("position", { ascending: true })
      .order("created_at", { ascending: false });

    if (!error && data) {
      setCards(data as Highlight[]);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    localStorage.removeItem("scolamove-highlights");
    sessionStorage.removeItem("scolamove-highlights-cache");

    loadHighlights();

    function handlePageShow() {
      loadHighlights();
      trackRef.current?.scrollTo({ left: 0, behavior: "auto" });
    }

    window.addEventListener("pageshow", handlePageShow);

    return () => {
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, [loadHighlights]);

  function scroll(direction: "left" | "right") {
    trackRef.current?.scrollBy({
      left: direction === "left" ? -320 : 320,
      behavior: "smooth",
    });
  }

  if (loading) return null;
  if (!cards.length) return null;

  return (
    <div className="news-carousel">
      <button
        type="button"
        className="news-arrow news-arrow-left"
        onClick={() => scroll("left")}
        aria-label="Voir les cartes précédentes"
      >
        ←
      </button>

      <div className="news-track" ref={trackRef}>
        {cards.map((card) => (
          <a
            className="news-card"
            href={card.link || "/sejours"}
            key={card.id}
          >
            <div
              className="news-img"
              style={{ backgroundImage: `url(${card.image})` }}
            />

            <div className="news-body">
              <h3>{card.title}</h3>
            </div>
          </a>
        ))}
      </div>

      <button
        type="button"
        className="news-arrow news-arrow-right"
        onClick={() => scroll("right")}
        aria-label="Voir les cartes suivantes"
      >
        →
      </button>
    </div>
  );
}