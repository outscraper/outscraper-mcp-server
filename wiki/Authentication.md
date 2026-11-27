# Authentication

## Local stdio and Private HTTP

Set `OUTSCRAPER_API_KEY` in the client's private environment or local `.env`. With `CLOUD_SERVICE=false`, HTTP callers also use that configured key; keep that mode private because all callers use the same account.

## Hosted HTTP

Set `CLOUD_SERVICE=true`. Each request must provide a key using one of:

- `X-OUTSCRAPER-API-KEY: <API_KEY>`
- `X-API-KEY: <API_KEY>`
- `Authorization: Bearer <API_KEY>`
- `/v1/mcp/<API_KEY>` in the URL path

Headers take precedence over the path key. The configured environment key is not a fallback in hosted mode. Send the same key on every request in a stateful session.

Node checks for supplied credentials; the upstream keyed MCP endpoint validates the account and its organization when processing tool requests. The API host determines the organization. Using a service-capable Node process does not bypass Targetron's catalog-only restriction.

## Upstream Authentication

The bridge forwards tool requests to the configured API origin's `/mcp/<API_KEY>` endpoint. The main API's plain `/mcp` endpoint is OAuth-only; Node's support for API-key headers must not be confused with accepting API keys as OAuth tokens there.

Treat key-bearing URLs as credentials. Use HTTPS for public connections and redact keys from access logs, errors and tracing on every proxy and API layer. Even when the caller uses a header to Node, the bridge's upstream URL contains the key. Rotate exposed keys and never put real credentials in examples or support messages.
