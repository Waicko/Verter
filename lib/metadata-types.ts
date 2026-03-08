/** Source, origin, rights and verification metadata types */

export const SOURCE_TYPES = [
  "team",
  "organizer",
  "community",
  "third_party",
  "editorial",
] as const;
export type SourceType = (typeof SOURCE_TYPES)[number];

export const RIGHTS_BASIS_VALUES = [
  "own",
  "permission",
  "licensed",
  "public_linked_only",
  "unknown",
] as const;
export type RightsBasis = (typeof RIGHTS_BASIS_VALUES)[number];

export const VERIFICATION_STATUSES = [
  "unverified",
  "verified_by_team",
  "organizer_confirmed",
] as const;
export type VerificationStatus = (typeof VERIFICATION_STATUSES)[number];

export const ROUTE_ORIGIN_TYPES = [
  "team_route",
  "race_route",
  "organizer_route",
  "community_route",
  "imported",
] as const;
export type RouteOriginType = (typeof ROUTE_ORIGIN_TYPES)[number];

export type SourceRightsMetadata = {
  source_type: SourceType | string | null;
  source_name: string | null;
  source_url: string | null;
  submitted_by_name: string | null;
  submitted_by_email: string | null;
  rights_basis: RightsBasis | string | null;
  license_name: string | null;
  license_url: string | null;
  verification_status: VerificationStatus | string | null;
};

export type RouteOriginMetadata = {
  route_origin_type: RouteOriginType | string | null;
  route_origin_name: string | null;
  route_origin_url: string | null;
};
