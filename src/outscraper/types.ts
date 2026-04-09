export interface AsyncResponse {
  id?: string;
  status?: string;
  results_location?: string;
  error?: string;
  errorMessage?: string;
  [key: string]: unknown;
}

export interface BusinessesSearchPayload {
  filters?: Record<string, unknown>;
  limit?: number;
  include_total?: boolean;
  cursor?: string;
  fields?: string[];
  query?: string;
}

export interface BusinessesGetParams {
  fields?: string;
}

export interface GoogleMapsSearchParams {
  query: string[];
  limit?: number;
  language?: string;
  region?: string;
  skipPlaces?: number;
  dropDuplicates?: boolean;
  enrichment?: string[];
  fields?: string;
  coordinates?: string;
  async?: boolean;
  webhook?: string;
}

export interface GoogleMapsReviewsParams {
  query: string[];
  reviewsLimit?: number;
  reviewsQuery?: string;
  limit?: number;
  sort?: string;
  lastPaginationId?: string;
  start?: string;
  cutoff?: string;
  cutoffRating?: number;
  ignoreEmpty?: boolean;
  source?: string;
  language?: string;
  region?: string;
  fields?: string;
  async?: boolean;
  webhook?: string;
}

export interface CompanyInsightsParams {
  query: string[];
  fields?: string;
  enrichment?: string[];
  async?: boolean;
  webhook?: string;
}

export interface EmailsAndContactsParams {
  query: string[];
  preferredContacts?: string[];
  async?: boolean;
  webhook?: string;
}
