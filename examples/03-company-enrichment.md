# Company Enrichment

Prompt: "Research these company domains and summarize their descriptions, industries, employee counts and locations. Explain pricing before starting."

Follow the [paid-service workflow](./README.md#before-paid-work). Inspect `company_insights` and price its returned billing unit. If advertised directly, call:

```json
{
  "query": ["outscraper.com", "stripe.com", "notion.so"]
}
```

Use `requests_get` with the submission's `id` to read results. Summarize only returned fields and identify missing or partial company data. This is a standalone asynchronous service, separate from adding `company_insights` to a catalog full-data request's enrichments.
