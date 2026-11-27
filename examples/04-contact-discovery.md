# Contact Discovery

Prompt: "Find company contact details for these domains, prioritizing technical and decision-maker contacts. Explain pricing before starting."

Follow the [paid-service workflow](./README.md#before-paid-work). Inspect `emails_and_contacts`, including its billing unit; do not assume each input domain incurs exactly one contact unit. If advertised directly, call:

```json
{
  "query": ["outscraper.com", "vercel.com"],
  "preferred_contacts": ["technical", "decision makers"]
}
```

Read results with `requests_get` using the returned `id`. Distinguish company contacts from named people, and do not infer email deliverability from availability. If verification is requested, discover the email-validation service and price that separate step before execution.
