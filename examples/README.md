# Examples

Task-oriented examples for the same MCP tools exposed by the main Outscraper backend. Inspect the connected server's tools and current schemas before using these examples; availability depends on the deployment and organization. Targetron supports business catalog, catalog pricing and balance only.

## Before Paid Work

1. Identify the service with `discover_services` and inspect it with `get_service_schema`. A direct tool may already be advertised; it uses the same service parameters.
2. Call `pricing_get` with the public service ID and a quantity only when the returned billing unit and requested limits justify it. Explain rates, allowances and estimate limitations, including requested enrichments.
3. Obtain paid-use authorization or continue within an existing agreed scope and budget. Quotes do not enforce a spending cap.
4. Submit once through the direct tool or `run_service` with the returned `schema_version` and `parameters`. These services always run asynchronously.
5. Save the returned `id` and call `requests_get` with `{"id":"<returned request id>","limit":50}`. Poll within a bounded wait budget, then follow any result `next_cursor` using the same ID and limit.

Preserve query and record indexes and empty result groups. Concatenate `json_text` fragments in cursor order before parsing. Do not retry a paid submission automatically after a timeout; inspect the running and finished request history first. Missing history does not prove it never started.

Free masked previews and paid full-data retrieval apply only to Business Catalog. A service's free usage allowance does not create a preview mode. Read current account rates instead of assuming a fixed free tier.

## Workflows

- [Business Discovery](./01-business-discovery.md)
- [Review Monitoring](./02-review-monitoring.md)
- [Company Enrichment](./03-company-enrichment.md)
- [Contact Discovery](./04-contact-discovery.md)
- [AI Scraper Company Profile](./05-ai-scraper-company-profile.md)
- [Async Research Workflow](./06-async-research-workflow.md)
- [Competitor Landscape](./07-competitor-landscape.md)
- [Market Entry Scouting](./08-market-entry-scouting.md)
- [Example Agent Skills](./skills/README.md)

JSON blocks contain MCP tool arguments, not REST request bodies. Replace placeholders with values returned by earlier steps. Never invent record IDs, service IDs or schema versions.
