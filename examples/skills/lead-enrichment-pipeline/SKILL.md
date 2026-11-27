---
name: lead-enrichment-pipeline
description: Build an authorized business research brief using Outscraper catalog discovery, company data and contact enrichment with live pricing and asynchronous result reads.
---

# Lead Enrichment Pipeline

Use this workflow for company research or account planning. Follow the user's task and existing authorization; do not add paid enrichment merely because it is available.

## Workflow

1. Inspect the connected tools. For geography/category requests, begin with a small `search_businesses` masked preview. If the user already provided domains, skip discovery.
2. If full catalog records are needed, price `search_businesses_full` and requested catalog enrichments. Obtain approval or use the agreed scope and budget. Select actual returned catalog IDs with `filters.os_ids`; never infer masked contact details.
3. For standalone domain research, discover and inspect `company_insights` or `emails_and_contacts`. Price each requested service using its returned billing units before execution.
4. Submit once through an advertised direct tool or `run_service` with the current schema version. Save each returned `id` and read results with `requests_get` using bounded polling and pagination.
5. If website messaging is part of the task, discover `ai_scraper`, inspect its schema and price that additional step before running it.
6. Combine returned evidence into one account brief with company facts, contact availability, source claims and data limitations.

An advertised `emails_and_contacts` tool accepts, after pricing and authorization:

```json
{
  "query": ["outscraper.com"],
  "preferred_contacts": ["technical", "decision makers"]
}
```

Contact availability is not proof of deliverability. Service result counts and enrichment billing units may differ from input counts. Estimates do not enforce a spending cap. Never retry a paid submission automatically after an ambiguous failure.

Targetron exposes catalog, catalog pricing and balance only. Use supported catalog enrichments there when authorized; do not attempt service discovery or scraping through that endpoint.
