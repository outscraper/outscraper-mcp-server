# Business Discovery

Find bars in Kyiv for partnerships or local market research. Decide whether the task needs a stored catalog preview or fresh Google Maps extraction.

## Free Catalog Preview

Call `search_businesses`:

```json
{
  "filters": {
    "country_code": "UA",
    "cities": ["kyiv"],
    "types": ["bar"]
  },
  "limit": 5
}
```

Preserve masked fields. If the user wants full catalog records, price `search_businesses_full`, obtain authorization and select actual returned IDs with `filters.os_ids`. Catalog lookup is not a fresh scrape.

## Google Maps Extraction

Prompt: "Find up to 20 bars in Kyiv, then summarize their ratings and review counts. Explain pricing before starting."

Follow the [paid-service workflow](./README.md#before-paid-work). For an advertised `google_maps_search` direct tool, use:

```json
{
  "query": ["bars kyiv ukraine"],
  "limit": 20,
  "language": "en",
  "region": "ua"
}
```

The limit applies per query. Submission returns a request `id`; read the results with `requests_get`. Add rating or review requirements only when requested, and do not claim this small sample covers the entire market.
