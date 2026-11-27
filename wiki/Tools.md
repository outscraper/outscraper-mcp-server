# Tools

The Node bridge returns tool definitions from the configured Rashida MCP deployment. Names, descriptions, input schemas, annotations and result content are shared with that backend. Inspect `tools/list` after connecting; do not rely on a fixed local catalog.

## Business Catalog

- `search`: natural-language discovery with a small result set.
- `fetch`: masked preview of one returned business ID.
- `search_businesses`: structured filters, masked previews and cursor pagination.
- `search_businesses_full`: paid full records and requested catalog enrichments.

Start with a small preview unless paid retrieval is already authorized. Masked fields remain masked after sign-in. Catalog reads are not fresh scraping requests.

## Pricing and Account

- `pricing_get`: current organization/account rates, recorded allowances and optional estimates.
- `balance_get`: account billing data and the billing-dashboard link.

Check pricing before paid work. Do not assume fixed free allowances or treat estimates as enforced spending caps.

## Services

- `discover_services`: compact discovery across all enabled services, including upfront tools.
- `get_service_schema`: one service's parameters and current schema version.
- `run_service`: asynchronous execution using that version and its parameters.

Common services also appear as direct tools. They use the same parameters and paid-use rules. New services and priority changes are controlled by the backend, so a service need not be listed upfront to be discoverable and runnable.

## Requests

- `requests_get`: read status and paginated results using the returned request `id`.
- `requests_list`: account history using `type` (`running` or `finished`), `skip` and `limit`.

Result pages preserve indexes and can contain JSON-text fragments. Follow the live descriptions and [Execution Workflow](Execution-Modes). There is no cancellation or request-deletion tool in the current contract.

## Organizations and Results

Targetron exposes only catalog, catalog pricing and balance. Other organizations receive the capabilities enabled by their backend policy. API keys must match the chosen API host's organization.

Results retain the backend's MCP content and errors. Node does not add its previous `data`, `meta` or `async` envelope. Refresh cached tools and update fixed workflows after migrating from an older Node release.
