# Review Monitoring

## Use Case

Track recent reviews for a hospitality business and surface themes from the newest feedback.

## Natural-Language Prompt

Fetch the newest 50 Google reviews for this place and summarize recurring praise, complaints, and quick action items.

## Recommended Tool

- `google_maps_reviews`

## Example Arguments

```json
{
  "query": ["ChIJrc9T9fpYwokRdvjYRHT8nI4"],
  "reviews_limit": 50,
  "sort": "newest",
  "language": "en",
  "execution_mode": "sync"
}
```

## Useful Follow-Up

- use `cutoff` or `start` for rolling monitoring windows
- use `reviews_query` if you want reviews mentioning a topic like service, price, or wait time
