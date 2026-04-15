export interface AsyncResponse {
  id?: string;
  status?: string;
  results_location?: string;
  error?: string;
  errorMessage?: string;
  [key: string]: unknown;
}

export interface AiScraperPayload {
  query: string;
  prompt?: string;
  schema?: Record<string, unknown>;
  async?: boolean;
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

export interface EmailValidatorParams {
  query: string[];
  async?: boolean;
  webhook?: string;
}

export interface GoogleMapsPhotosParams {
  query: string[];
  photosLimit?: number;
  limit?: number;
  tag?: "all" | "latest" | "menu" | "by_owner";
  language?: string;
  region?: string;
  fields?: string;
  async?: boolean;
  webhook?: string;
}

export interface YellowpagesSearchParams {
  query: string[];
  location?: string[];
  limit?: number;
  region?: string;
  enrichment?: string[];
  fields?: string;
  async?: boolean;
  webhook?: string;
}

export interface BookingReviewsParams {
  query: string[];
  reviewsLimit?: number;
  skip?: number;
  sort?: string;
  cutoff?: string;
  language?: string;
  region?: string;
  fields?: string;
  async?: boolean;
  webhook?: string;
}

export interface PhonesEnricherParams {
  query: string[];
}

export interface YelpReviewsParams {
  query: string[];
  reviewsLimit?: number;
  cursor?: string;
  sort?: string;
  cutoff?: string;
  fields?: string;
  async?: boolean;
  webhook?: string;
}

export interface TripadvisorReviewsParams {
  query: string[];
  reviewsLimit?: number;
  cutoff?: string;
  language?: string;
  fields?: string;
  async?: boolean;
  webhook?: string;
}

export interface TripadvisorSearchParams {
  query: string[];
  SearchType?: string;
  limit?: number;
  skip?: number;
  fields?: string;
  async?: boolean;
  webhook?: string;
}

export interface GoogleSearchParams {
  query: string[];
  pagesPerQuery?: number;
  uule?: string;
  language?: string;
  region?: string;
  tbs?: string;
  skip?: number;
  enrichment?: string[];
  fields?: string;
  async?: boolean;
  webhook?: string;
}

export interface GoogleSearchImagesParams {
  query: string[];
  limit?: number;
  uule?: string;
  language?: string;
  region?: string;
  fields?: string;
  async?: boolean;
  webhook?: string;
}

export interface IndeedSearchParams {
  query: string[];
  limit?: number;
  enrichment?: string[];
  fields?: string;
  async?: boolean;
  webhook?: string;
}

export interface TrustpilotDataParams {
  query: string[];
  enrichment?: string[];
  fields?: string;
  async?: boolean;
  webhook?: string;
}

export interface TrustpilotReviewsParams {
  query: string[];
  reviewsLimit?: number;
  skip?: number;
  languages?: string[];
  fields?: string;
  async?: boolean;
  webhook?: string;
}
