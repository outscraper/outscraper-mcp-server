# Async Research Workflow

## Use Case

Run a larger research job, then poll until the result is ready.

## Natural-Language Prompt

Submit a large enrichment job asynchronously, then keep checking until it completes and summarize the final result.

## Recommended Tools

- `company_insights`
- `requests_get`

## Step 1. Submit Async Job

```json
{
  "query": ["outscraper.com", "shopify.com", "hubspot.com", "airtable.com"],
  "fields": ["name", "description", "industry", "employees"],
  "execution_mode": "async"
}
```

## Step 2. Poll By Request ID

```json
{
  "request_id": "REQUEST_ID_FROM_STEP_1"
}
```

## Optional Tools

- `requests_list` to inspect recent jobs
- `requests_delete` if a queued job is no longer needed
