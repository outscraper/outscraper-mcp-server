# AI Scraper Company Profile

Prompt: "Extract the company name, product description and notable claims from this page. Explain pricing before starting."

AI Scraper may be available through discovery without being an upfront tool. Call `discover_services` with `{"query":"AI scraper","limit":5}`, then `get_service_schema` for the returned service ID. Follow the [paid-service workflow](./README.md#before-paid-work).

Call `run_service` with the exact returned schema version:

```json
{
  "service_id": "ai_scraper",
  "schema_version": "<returned schema_version>",
  "parameters": {
    "query": "https://outscraper.com",
    "prompt": "Extract the company name, product description and notable claims from this page.",
    "schema": {
      "type": "object",
      "properties": {
        "company_name": {"type": "string"},
        "product_description": {"type": "string"},
        "notable_claims": {"type": "array", "items": {"type": "string"}}
      }
    }
  }
}
```

Save the returned `id` and read the asynchronous results with `requests_get`. The schema describes requested extraction fields; missing source information may leave them incomplete. Treat website claims as source statements, not independently verified facts.
