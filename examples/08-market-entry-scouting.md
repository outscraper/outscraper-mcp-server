# Market Entry Scouting

## Use Case

Evaluate a new city or region by combining place discovery, ratings, and review volume.

## Natural-Language Prompt

Find the top-rated cafes in Warsaw with at least 200 reviews, then identify patterns in customer expectations and market density.

## Recommended Tool Sequence

- `google_maps_search`
- `google_maps_reviews`

## Step 1. Discover Businesses

```json
{
  "query": ["cafes warsaw poland"],
  "limit": 25,
  "language": "en",
  "region": "pl",
  "fields": ["name", "full_address", "rating", "reviews", "place_id"],
  "execution_mode": "sync"
}
```

## Step 2. Review Selected Places

```json
{
  "query": ["PLACE_ID_1", "PLACE_ID_2"],
  "reviews_limit": 40,
  "sort": "most_relevant",
  "language": "en",
  "execution_mode": "sync"
}
```

## Why This Is Useful

- place discovery shows market supply
- ratings and review counts show relative quality and visibility
- review text helps surface unmet demand and service expectations
