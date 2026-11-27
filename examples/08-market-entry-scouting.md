# Market Entry Scouting

Prompt: "Find cafes in Warsaw with at least 200 reviews, then assess a small shortlist's customer feedback. Explain pricing before paid retrieval."

## Preview the Catalog

Call `search_businesses`:

```json
{
  "filters": {
    "country_code": "PL",
    "cities": ["warsaw"],
    "types": ["cafe"],
    "reviews": "200+"
  },
  "limit": 5
}
```

Inspect masked previews with the user. Full catalog retrieval requires its own pricing lookup and authorization. A limited catalog sample does not establish market density or an exhaustive ranking.

## Collect Review Evidence

On a service-capable organization, follow the [paid-service workflow](./README.md#before-paid-work) for `google_maps_reviews`. Use actual Google place IDs supplied by the user or available in authorized full results; an Outscraper catalog ID is not a Google place ID.

```json
{
  "query": ["<actual Google place ID>"],
  "reviews_limit": 40,
  "sort": "most_relevant",
  "language": "en"
}
```

Read the submitted request with `requests_get`. Describe review themes and sampling limits. Targetron supports the catalog steps only; report that limitation rather than attempting scraping through its endpoint.
