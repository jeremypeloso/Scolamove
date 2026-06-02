"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

type Destination = {
  id: string;
  title: string;
  image: string;
  link: string | null;
};

const CACHE_KEY = "scolamove-destinations-cache";

export default function DestinationCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDestinations = useCallback(async () => {
    const cached = sessionStorage.getItem(CACHE_KEY);

    if (cached) {
      setItems(JSON.parse(cached));
      setLoading(false);
    }

    const { data, error } = await supabase
      .from("destinations")
      .select("*")
      .eq("active", true)
      .order("position", { ascending: true });

    if (!error && data) {
      setItems(data);
      sessionStorage.setItem(CACHE_KEY, JSON.stringify(data));
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    loadDestinations();

    function handlePageShow() {
      setLoading(false);
      loadDestinations();
      trackRef.current?.scrollTo({ left: 0, behavior: "auto" });
    }

    window.addEventListener("pageshow", handlePageShow);

    return () => {
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, [loadDestinations]);

  function scroll(direction: "left" | "right") {
    trackRef.current?.scrollBy({
      left: direction === "left" ? -320 : 320,
      behavior: "smooth",
    });
  }

  if (loading && !items.length) {
    return null;
  }

  if (!items.length) return null;

  return (
    <section className="destination-section" id="destinations">
      <div className="container">
        <div className="destination-head">
          <div>
            <h2>Où partir avec Scolamove ?</h2>
            <p>
              Choisissez un pays et découvrez nos séjours scolaires disponibles,
              conçus pour les enseignants et adaptés aux groupes.
            </p>
          </div>
        </div>

        <div className="destination-carousel">
          <button type="button" onClick={() => scroll("left")} aria-label="Voir les destinations précédentes">
            ←
          </button>

          <div className="destination-track" ref={trackRef}>
            {items.map((item) => (
              <a
                className="destination-card"
                href={item.link || "/sejours"}
                key={item.id}
              >
                <img src={item.image} alt={item.title} />
                <span className="destination-label">
                  <i aria-hidden="true" />
                  {item.title}
                </span>
              </a>
            ))}
          </div>

          <button type="button" onClick={() => scroll("right")} aria-label="Voir les destinations suivantes">
            →
          </button>
        </div>
      </div>
    </section>
  );
}
