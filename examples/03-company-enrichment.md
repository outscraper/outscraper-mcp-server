# Company Enrichment

## Use Case

Enrich a shortlist of companies with structured company metadata for research or lead qualification.

## Natural-Language Prompt

Enrich these domains and return company descriptions, industry, employee count, location, and social links.

## Recommended Tool

- `company_insights`

## Example Arguments

```json
{
  "query": ["outscraper.com", "stripe.com", "notion.so"],
  "fields": ["name", "description", "industry", "employees", "location", "social_profiles"],
  "execution_mode": "async"
}
```

## Why Async Helps

- enrichment across multiple domains can take longer
- async mode returns a request id that can be polled with `requests_get`
