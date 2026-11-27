# Execution Workflow

The current contract has one asynchronous execution flow for scraping and enrichment services. There is no `auto`, `sync` or `async` mode selector. Business catalog previews/full retrieval are separate tools.

## Submit and Read

1. Discover a service and inspect its current schema.
2. Call `pricing_get`. Explain rates, billing units and estimate limitations, and obtain authorization or continue within an agreed scope and budget.
3. Submit once through a direct tool or `run_service` with its `schema_version` and `parameters`.
4. Save the returned `id` and `status: "Pending"`.
5. Call `requests_get` with that ID and a bounded page limit, polling within a reasonable wait budget.
6. Follow `next_cursor` using the same ID and limit once results are available.

For an advertised `company_insights` tool, after pricing and authorization:

```json
{"query": ["outscraper.com"]}
```

Read its submission with `requests_get`:

```json
{"id": "<returned request id>", "limit": 50}
```

Preserve query and record indexes and empty groups. Concatenate `json_text` fragments in cursor order before parsing the complete JSON. `Success` and `Failure` are backend completion statuses.

## Ambiguous Outcomes

The bridge does not retry paid requests. A timeout or canceled HTTP wait does not cancel an already-submitted service. Use a known request ID; if submission was ambiguous, inspect both running and finished history through `requests_list`. Missing history does not prove no work started.

Missing or expired results may also return `Pending`. Report an outstanding request when the wait budget ends instead of polling forever or submitting again. There is no MCP cancellation tool in this release.
