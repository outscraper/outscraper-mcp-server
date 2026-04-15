# Business Discovery

## Use Case

Find high-quality bars in Kyiv for outreach, partnerships, or local market research.

## Natural-Language Prompt

Find 20 bars in Kyiv with strong ratings and reviews. Return the name, address, phone, website, rating, and reviews count.

## Recommended Tool

- `google_maps_search`

## Example Arguments

```json
{
  "query": ["bars kyiv ukraine"],
  "limit": 20,
  "language": "en",
  "region": "ua",
  "fields": ["name", "full_address", "phone", "site", "rating", "reviews"],
  "execution_mode": "sync"
}
```

## When To Use Another Tool

- use `businesses_search` instead if you need structured geography and category filters
- use `google_maps_reviews` after discovery if you need sentiment or review text
