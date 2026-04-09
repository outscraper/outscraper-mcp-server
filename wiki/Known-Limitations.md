# Known Limitations

## `businesses_search` Free-Form Query Behavior

`businesses_search` works reliably with structured `filters`.

Free-form `query` values on `/businesses` may fail with:

```text
Could not parse query into a valid request format.
```

For reliable usage, prefer structured filters.

## `chain_info`

`chain_info` is implemented using the documented chain enrichment on top of Google Maps search.

It is not exposed as a separate standalone endpoint.

## `builtwith`

A dedicated BuiltWith endpoint is not currently exposed as a tool.

## `execution_mode="auto"`

`auto` is heuristic-based.

If you need deterministic behavior, explicitly use:

- `sync`
- `async`

## Hosted HTTP Auth

When `CLOUD_SERVICE=true`, callers must send valid auth headers.
