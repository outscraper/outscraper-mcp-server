---
name: local-market-scout
description: Discover and compare local businesses with Outscraper catalog previews or authorized Google Maps extraction and review analysis, using current MCP schemas and pricing.
---

# Local Market Scout

Use this workflow for local business research. Establish the user's geography, categories, qualification criteria and intended output; do not add restrictive filters without a reason grounded in the request.

## Workflow

1. Inspect available tools. Use a small `search_businesses` preview for stored catalog data, preserving masked fields. Use Google Maps extraction when the task calls for fresh service results and the organization supports services.
2. For paid catalog retrieval or service execution, call `pricing_get`, explain billing units and estimate limitations, and obtain approval or reuse the agreed scope and budget.
3. Inspect the chosen service schema. An advertised `google_maps_search` tool accepts `{"query":["bars kyiv ukraine"],"limit":20}`; the limit applies per query. Otherwise use discovery and `run_service` with the returned schema version.
4. Save the submitted request `id` and read `requests_get` results with bounded polling and pagination before selecting a shortlist.
5. If review analysis is requested, inspect and price `google_maps_reviews`. Use actual Google place IDs from the user or previous results, not catalog IDs. A direct call can use `{"query":["<actual place ID>"],"reviews_limit":40,"sort":"newest"}`.
6. Summarize the observed candidates, review themes and sampling limitations. A bounded sample is not an exhaustive market census or ranking.

Do not duplicate paid requests after a timeout. Preserve result indexes and concatenate marked JSON fragments before parsing. Report outstanding or missing data clearly.

Targetron supports catalog, catalog pricing and balance only. Complete the supported catalog work and explain when the requested review-scraping step is unavailable.
