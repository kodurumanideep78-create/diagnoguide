import { describe, expect, it } from "vitest";
import { filterHospitalListings, hospitalListings } from "../client/src/lib/hospitalListings";

describe("hospital directory data", () => {
  it("includes all twenty supplied listings with unique IDs", () => {
    expect(hospitalListings).toHaveLength(20);
    expect(new Set(hospitalListings.map((listing) => listing.id)).size).toBe(20);
    expect(hospitalListings.every((listing) => listing.name && listing.location && listing.hours)).toBe(true);
  });

  it("keeps hospital and diagnostic-center groups complete", () => {
    expect(hospitalListings.filter((listing) => listing.group === "hospital")).toHaveLength(11);
    expect(hospitalListings.filter((listing) => listing.group === "diagnostic")).toHaveLength(9);
  });

  it("filters by category and case-insensitive location or name", () => {
    expect(filterHospitalListings("", "hospital")).toHaveLength(11);
    expect(filterHospitalListings("", "diagnostic")).toHaveLength(9);
    expect(filterHospitalListings("GUNTUR", "all").map((listing) => listing.id)).toEqual([
      "ma-advanced-diagnostic-guntur",
      "aster-ramesh-guntur",
    ]);
    expect(filterHospitalListings("apollo", "diagnostic")[0]?.id).toBe("apollo-diagnostics-ayodhya-nagar");
    expect(filterHospitalListings("apollo", "hospital")).toHaveLength(0);
  });
});
