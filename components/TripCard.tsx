import type { SupabaseSejour } from "@/lib/sejours-supabase";

type TripCardProps = {
  sejour: SupabaseSejour;
};

export default function TripCard({ sejour }: TripCardProps) {
  return (
    <article className="trip-card">
      <div
        className="trip-img"
        style={{ backgroundImage: `url(${sejour.image})` }}
      >
        {sejour.badge && <span className="ribbon">{sejour.badge}</span>}
      </div>

      <div className="trip-body">
        {sejour.theme && <span className="trip-kicker">{sejour.theme}</span>}

        <h3>{sejour.title}</h3>

        <p>{sejour.description}</p>

        <div className="trip-meta">
          <span>{sejour.duration}</span>
          <span>{sejour.level}</span>
          <span>{sejour.accommodation}</span>
          <span>{sejour.transport}</span>
        </div>

        <div className="price-line">
          <div>
            <small>à partir de</small>
            <strong>{sejour.price.replace("À partir de ", "")}</strong>
          </div>

          <a href={`/sejours/${sejour.slug}`} className="btn btn-blue">
            Je découvre
          </a>
        </div>
      </div>
    </article>
  );
}
