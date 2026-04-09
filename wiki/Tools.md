# Tools

## Business Tools

### `businesses_search`

Use for structured business discovery with filters and pagination.

### `businesses_get`

Use when you already have a business ID.

## Google Maps Tools

### `google_maps_search`

Search for places and place data from Google Maps.

### `google_maps_reviews`

Fetch reviews for Google Maps places.

### `google_maps_photos`

Fetch photos for places, including menu, latest, and owner-tagged photos.

### `chain_info`

Returns chain detection data using the documented chain enrichment on top of Google Maps search.

## Company and Contact Tools

### `company_insights`

Firmographic and company profile enrichment.

### `emails_and_contacts`

Find emails, contacts, socials, and related company contact data.

### `emails_validator`

Validate whether email addresses are deliverable.

### `phones_enricher`

Validate and enrich phone numbers.

## Search Tools

### `google_search`

Fetch Google web search results.

### `google_search_images`

Fetch Google image search results.

### `yellowpages_search`

Search Yellow Pages business listings.

### `indeed_search`

Fetch job listings from Indeed.

### `tripadvisor_search`

Search Tripadvisor results.

## Review and Directory Tools

### `booking_reviews`

Fetch Booking.com reviews.

### `yelp_reviews`

Fetch Yelp reviews.

### `tripadvisor_reviews`

Fetch Tripadvisor reviews.

### `tp_data`

Fetch Trustpilot business data.

### `tp_reviews`

Fetch Trustpilot reviews.

## Account and Request Tools

### `balance_get`

Returns account balance and status.

### `requests_list`

List async requests.

### `requests_get`

Get the status and archive for a request.

### `requests_delete`

Terminate a request.

## Response Shape

All tools return a normalized result envelope:

```json
{
  "data": {},
  "meta": {
    "service": "service_name",
    "operation": "operation_name"
  },
  "async": {
    "id": "request-id",
    "status": "Pending",
    "results_location": "https://api.outscraper.cloud/requests/request-id",
    "is_async_submission": true,
    "next_step": "Call requests_get with request_id=\"request-id\" to check progress."
  }
}
```
