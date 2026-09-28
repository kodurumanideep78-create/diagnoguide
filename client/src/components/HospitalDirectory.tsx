import { useMemo, useState } from "react";
import { ArrowUpRight, Building2, Clock3, MapPin, Search, Star } from "lucide-react";
import { filterHospitalListings, hospitalListings, type FacilityFilter } from "@/lib/hospitalListings";

const hospitalCount = hospitalListings.filter((listing) => listing.group === "hospital").length;
const diagnosticCount = hospitalListings.length - hospitalCount;

function mapsSearchUrl(name: string, location: string) {
  const query = encodeURIComponent(`${name}, ${location}`);
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

export default function HospitalDirectory() {
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState<FacilityFilter>("all");
  const listings = useMemo(() => filterHospitalListings(query, group), [query, group]);

  const filters: { id: FacilityFilter; label: string; count: number }[] = [
    { id: "all", label: "All listings", count: hospitalListings.length },
    { id: "hospital", label: "Hospitals", count: hospitalCount },
    { id: "diagnostic", label: "Diagnostics", count: diagnosticCount },
  ];

  return (
    <section className="facility-directory" id="hospitals" aria-labelledby="facility-directory-title">
      <div className="facility-directory-inner">
        <div className="section-kicker">HOSPITALS & DIAGNOSTICS <span>— DIRECTORY</span></div>
        <div className="facility-heading-row">
          <div className="facility-heading-copy">
            <h2 id="facility-directory-title">Care options, <em>at a glance.</em></h2>
            <p>Browse the hospitals and diagnostic centers from the list you shared. Search by name or location, or filter by type.</p>
          </div>
          <div className="facility-total" aria-label={`${hospitalListings.length} listings in this directory`}>
            <strong>{hospitalListings.length}</strong>
            <span>places in<br />your directory</span>
          </div>
        </div>

        <div className="facility-toolbar">
          <label className="facility-search" htmlFor="facility-search-input">
            <Search size={17} aria-hidden="true" />
            <span className="sr-only">Search by facility name, type, or location</span>
            <input
              id="facility-search-input"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search name or location"
              autoComplete="off"
            />
          </label>
          <div className="facility-filters" role="group" aria-label="Filter facilities by type">
            {filters.map((filter) => (
              <button
                className={group === filter.id ? "facility-filter is-active" : "facility-filter"}
                key={filter.id}
                type="button"
                aria-pressed={group === filter.id}
                onClick={() => setGroup(filter.id)}
              >
                {filter.label}<span>{filter.count}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="facility-results-count" aria-live="polite">
          Showing {listings.length} {listings.length === 1 ? "listing" : "listings"}
        </div>

        {listings.length > 0 ? (
          <div className="facility-grid">
            {listings.map((listing) => (
              <article className="facility-card" key={listing.id}>
                <div className="facility-card-topline">
                  <span className={`facility-category${listing.group === "diagnostic" ? " is-diagnostic" : ""}`}>
                    <Building2 size={13} aria-hidden="true" />
                    {listing.type}
                  </span>
                  <span className="facility-rating" aria-label={`${listing.rating.toFixed(1)} rating, ${listing.reviewCount} reviews`}>
                    <Star size={14} fill="currentColor" aria-hidden="true" />
                    <strong>{listing.rating.toFixed(1)}</strong>
                    <span>({listing.reviewCount})</span>
                  </span>
                </div>
                <h3>{listing.name}</h3>
                <div className="facility-facts">
                  <p><MapPin size={14} aria-hidden="true" /><span>{listing.location}</span></p>
                  <p><Clock3 size={14} aria-hidden="true" /><span>{listing.hours}</span></p>
                </div>
                {listing.tags?.length ? (
                  <div className="facility-tags" aria-label="Listed services">
                    {listing.tags.map((tag) => <span key={tag}>{tag}</span>)}
                  </div>
                ) : null}
                {listing.quote ? <blockquote>“{listing.quote}”</blockquote> : <div className="facility-quote-empty" aria-hidden="true" />}
                <a
                  className="facility-map-link"
                  href={mapsSearchUrl(listing.name, listing.location)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Search Maps for ${listing.name}, ${listing.location}`}
                >
                  Search directions <ArrowUpRight size={14} aria-hidden="true" />
                </a>
              </article>
            ))}
          </div>
        ) : (
          <div className="facility-empty" role="status">No listings match that search. Try another name or location.</div>
        )}

        <p className="facility-source-note">
          Ratings, review counts, hours, and comments are reproduced from the list you supplied and have not been independently verified. Please confirm current details with the facility. Map links open a search and may show multiple branches; official website URLs were not included in the source list.
        </p>
      </div>
    </section>
  );
}
