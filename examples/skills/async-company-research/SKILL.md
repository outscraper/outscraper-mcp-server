---
name: async-company-research
description: Submit authorized Outscraper research services, poll within a bounded wait budget, and summarize completed results using the current MCP schemas.
---

# Async Company Research

Use this workflow when the user requests company research that needs asynchronous scraping or enrichment. Follow the user's authorization; this skill alone does not authorize a paid request.

## Workflow

1. Inspect available tools. Use `discover_services` and `get_service_schema` to identify one relevant service and read its parameters, billing guidance and schema version. If service tools are unavailable on this organization, report that limitation.
2. Call `pricing_get`, explain units, rates and estimate limitations, and obtain approval or reuse the agreed scope and budget. Do not assume a universal free allowance or that each input is one billable unit.
3. Submit once with the advertised direct tool or `run_service` using the returned schema version. All services run asynchronously; choose one execution path.
4. Save the returned `id`. Call `requests_get` with `{"id":"<returned request id>","limit":50}` and poll at bounded intervals within the client's wait budget.
5. Follow result `next_cursor` values with the same ID and limit. Preserve query/record indexes and empty groups. Concatenate marked `json_text` fragments before parsing.
6. Summarize only completed results. Report missing data, failures, or an outstanding request ID accurately.

For example, after pricing and authorization, an advertised `company_insights` tool accepts:

```json
{"query": ["outscraper.com", "stripe.com", "notion.so"]}
```

After an ambiguous submission, inspect both `requests_list` history types (`running` and `finished`). Missing history or prolonged `Pending` does not prove work never started. Never automatically repeat a paid request or imply that stopping polling cancels it.
