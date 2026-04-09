# Execution Modes

Async-capable tools support:

- `auto`
- `sync`
- `async`

## `auto`

The server chooses the best mode.

Typical behavior:

- small requests stay sync
- larger, batched, or heavier requests may switch to async

## `sync`

The tool waits for the direct response and returns data immediately.

Use this when:

- the request is small
- you want a direct answer
- deterministic immediate output is preferred

## `async`

The tool submits a request and returns async metadata.

Use this when:

- the request is large
- you expect longer processing
- you want better reliability for heavier endpoints

## Async Workflow

1. Call a tool with `execution_mode: "async"` or `execution_mode: "auto"`.
2. Receive async metadata with request ID.
3. Poll status with `requests_get`.
4. Use `requests_list` to inspect running or finished requests.
5. Use `requests_delete` if you want to stop a request.

Example:

```json
{
  "query": ["outscraper.com"],
  "execution_mode": "async"
}
```
