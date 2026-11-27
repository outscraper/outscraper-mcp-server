# Async Research Workflow

Prompt: "Research these companies, check the job until it finishes within a reasonable wait, and summarize the returned data. Explain pricing before starting."

All scraping and enrichment services submit asynchronous requests. Follow the [pricing and authorization steps](./README.md#before-paid-work) before submission.

## Submit Once

For an advertised `company_insights` tool:

```json
{
  "query": ["outscraper.com", "shopify.com", "hubspot.com", "airtable.com"]
}
```

Save the returned `id`; `Pending` means the work has not completed.

## Read Results

Call `requests_get`:

```json
{"id": "<returned request id>", "limit": 50}
```

Poll at bounded intervals while status is `Pending`. If the wait budget expires, report the outstanding ID. When results arrive, follow `next_cursor` with the same ID and limit; preserve indexes and concatenate marked JSON fragments before parsing.

## Check History After an Ambiguous Submission

Call `requests_list` separately for `{"type":"running","limit":25}` and `{"type":"finished","limit":25}`. Page with `skip` when `has_more` is true. Reuse a known request ID. Missing history or prolonged `Pending` does not justify automatically submitting another paid request. There is no MCP cancellation or request-deletion tool in the current backend contract.
