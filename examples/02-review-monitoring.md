# Review Monitoring

Prompt: "Fetch up to 50 recent Google reviews for this place and summarize recurring praise, complaints and action items. Explain pricing before starting."

Follow the [paid-service workflow](./README.md#before-paid-work). Use the actual place ID supplied by the user or returned by place discovery. Call the advertised `google_maps_reviews` tool with:

```json
{
  "query": ["<actual place ID>"],
  "reviews_limit": 50,
  "sort": "newest",
  "language": "en"
}
```

Read the returned request `id` with `requests_get`. Fewer reviews may be returned; report the observed count and period covered.

For rolling monitoring, inspect the current `start`, `cutoff` and `reviews_query` semantics before adding filters. Timestamp filters use Unix seconds and can affect sorting. Do not apply filters that the user did not request.
