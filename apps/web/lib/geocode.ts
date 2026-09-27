/**
 * Address autocomplete via Photon (komoot) — OpenStreetMap data, no API key.
 * https://photon.komoot.io — results are biased towards Istanbul; names come back in the local language (Turkish).
 */

export type Place = {
  id: string;
  name: string;
  address: string;
  /** Short label shown on invitations before RSVP: "Caferağa, Kadıköy". */
  district?: string;
  lat: number;
  lng: number;
};

type PhotonFeature = {
  geometry: { coordinates: [number, number] };
  properties: {
    osm_id?: number;
    name?: string;
    street?: string;
    housenumber?: string;
    district?: string;
    locality?: string;
    city?: string;
    county?: string;
    state?: string;
    country?: string;
    osm_value?: string;
  };
};

const ENDPOINT = "https://photon.komoot.io/api/";
const ISTANBUL = { lat: 41.02, lon: 29.0 };

export async function searchPlaces(q: string, signal?: AbortSignal): Promise<Place[]> {
  const query = q.trim();
  if (query.length < 2) return [];
  const url = `${ENDPOINT}?q=${encodeURIComponent(query)}&limit=6&lat=${ISTANBUL.lat}&lon=${ISTANBUL.lon}`;
  const res = await fetch(url, { signal, headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`photon ${res.status}`);
  const data = (await res.json()) as { features: PhotonFeature[] };
  return data.features.map(toPlace).filter((p, i, arr) => arr.findIndex((x) => x.name === p.name && x.address === p.address) === i);
}

function toPlace(f: PhotonFeature): Place {
  const p = f.properties;
  const street = [p.street, p.housenumber].filter(Boolean).join(" ");
  const name = p.name ?? street ?? p.district ?? p.city ?? "Konum";
  const town = p.county && p.county !== p.city ? p.county : p.city;
  const hood = p.district ?? p.locality;
  const address = [street && street !== name ? street : null, hood, town, p.city && p.city !== town ? p.city : null].filter(Boolean).join(", ");
  const district = hood && town ? `${hood}, ${town}` : (town ?? hood);
  return {
    id: String(p.osm_id ?? `${f.geometry.coordinates[0]},${f.geometry.coordinates[1]}`),
    name,
    address: address || name,
    district,
    lat: f.geometry.coordinates[1],
    lng: f.geometry.coordinates[0],
  };
}
