import { removeEmpty } from "../lib/json.js";
import type {
  AsyncResponse,
  BusinessesGetParams,
  BusinessesSearchPayload,
  BookingReviewsParams,
  CompanyInsightsParams,
  EmailValidatorParams,
  EmailsAndContactsParams,
  GoogleMapsPhotosParams,
  GoogleMapsReviewsParams,
  GoogleMapsSearchParams,
  GoogleSearchImagesParams,
  GoogleSearchParams,
  IndeedSearchParams,
  PhonesEnricherParams,
  TripadvisorReviewsParams,
  TripadvisorSearchParams,
  TrustpilotDataParams,
  TrustpilotReviewsParams,
  YellowpagesSearchParams,
  YelpReviewsParams,
} from "./types.js";

export class OutscraperApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly payload: unknown,
  ) {
    super(message);
    this.name = "OutscraperApiError";
  }
}

export class OutscraperClient {
  constructor(
    private readonly apiKey: string,
    private readonly apiBaseUrl: string,
  ) {}

  async businessesSearch(payload: BusinessesSearchPayload): Promise<unknown> {
    return this.post("/businesses", payload);
  }

  async businessesGet(
    businessId: string,
    params: BusinessesGetParams,
  ): Promise<unknown> {
    return this.get(`/businesses/${encodeURIComponent(businessId)}`, params);
  }

  async getRequestArchive(requestId: string): Promise<AsyncResponse> {
    return this.get(`/requests/${encodeURIComponent(requestId)}`);
  }

  async deleteRequestArchive(requestId: string): Promise<unknown> {
    return this.delete(`/requests/${encodeURIComponent(requestId)}`);
  }

  async getRequestsHistory(type?: string): Promise<unknown> {
    return this.get("/requests", removeEmpty({ type }));
  }

  async getProfileBalance(): Promise<unknown> {
    return this.get("/profile/balance");
  }

  async googleMapsSearch(params: GoogleMapsSearchParams): Promise<unknown> {
    return this.get("/google-maps-search", params);
  }

  async googleMapsReviews(params: GoogleMapsReviewsParams): Promise<unknown> {
    return this.get("/google-maps-reviews", params);
  }

  async companyInsights(params: CompanyInsightsParams): Promise<unknown> {
    return this.get("/company-insights", params);
  }

  async emailsAndContacts(params: EmailsAndContactsParams): Promise<unknown> {
    return this.get("/emails-and-contacts", params);
  }

  async emailValidator(params: EmailValidatorParams): Promise<unknown> {
    return this.get("/email-validator", params);
  }

  async googleMapsPhotos(params: GoogleMapsPhotosParams): Promise<unknown> {
    return this.get("/google-maps-photos", params);
  }

  async yellowpagesSearch(params: YellowpagesSearchParams): Promise<unknown> {
    return this.get("/yellowpages-search", params);
  }

  async bookingReviews(params: BookingReviewsParams): Promise<unknown> {
    return this.get("/booking-reviews", params);
  }

  async phonesEnricher(params: PhonesEnricherParams): Promise<unknown> {
    return this.get("/phones-enricher", params);
  }

  async yelpReviews(params: YelpReviewsParams): Promise<unknown> {
    return this.get("/yelp-reviews", params);
  }

  async tripadvisorReviews(params: TripadvisorReviewsParams): Promise<unknown> {
    return this.get("/tripadvisor-reviews", params);
  }

  async tripadvisorSearch(params: TripadvisorSearchParams): Promise<unknown> {
    return this.get("/tripadvisor-search", params);
  }

  async googleSearch(params: GoogleSearchParams): Promise<unknown> {
    return this.get("/google-search", params);
  }

  async googleSearchImages(params: GoogleSearchImagesParams): Promise<unknown> {
    return this.get("/google-search-images", params);
  }

  async indeedSearch(params: IndeedSearchParams): Promise<unknown> {
    return this.get("/indeed-search", params);
  }

  async trustpilotData(params: TrustpilotDataParams): Promise<unknown> {
    return this.get("/trustpilot", params);
  }

  async trustpilotReviews(params: TrustpilotReviewsParams): Promise<unknown> {
    return this.get("/trustpilot-reviews", params);
  }

  private async get(path: string, params?: object): Promise<any> {
    const url = new URL(path, this.apiBaseUrl);

    if (params) {
      for (const [key, rawValue] of Object.entries(removeEmpty(params))) {
        if (Array.isArray(rawValue)) {
          for (const item of rawValue) {
            url.searchParams.append(key, String(item));
          }
        } else {
          url.searchParams.set(key, String(rawValue));
        }
      }
    }

    return this.request(url, { method: "GET" });
  }

  private async post(path: string, payload?: object): Promise<any> {
    const url = new URL(path, this.apiBaseUrl);

    return this.request(url, {
      method: "POST",
      body: JSON.stringify(removeEmpty(payload ?? {})),
      headers: {
        "content-type": "application/json",
      },
    });
  }

  private async delete(path: string): Promise<any> {
    const url = new URL(path, this.apiBaseUrl);

    return this.request(url, { method: "DELETE" });
  }

  private async request(url: URL, init: RequestInit): Promise<any> {
    const response = await fetch(url, {
      ...init,
      headers: {
        "x-api-key": this.apiKey,
        client: "outscraper-mcp",
        ...(init.headers ?? {}),
      },
    });

    const text = await response.text();
    const payload = text ? safeJsonParse(text) : null;

    if (!response.ok) {
      const message =
        getErrorMessage(payload) ||
        `Outscraper API request failed with status ${response.status}`;

      throw new OutscraperApiError(message, response.status, payload);
    }

    return payload;
  }
}

function safeJsonParse(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function getErrorMessage(payload: unknown): string | undefined {
  if (!payload || typeof payload !== "object") {
    return undefined;
  }

  const error = (payload as Record<string, unknown>).error;
  const errorMessage = (payload as Record<string, unknown>).errorMessage;

  if (typeof errorMessage === "string" && errorMessage.length > 0) {
    return errorMessage;
  }

  if (typeof error === "string" && error.length > 0) {
    return error;
  }

  return undefined;
}
