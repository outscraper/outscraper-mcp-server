# Competitor Landscape

Prompt: "Research competitors in local SEO data enrichment, then enrich the relevant company domains and summarize positioning differences. Explain pricing and agree on the scope of each stage."

Follow the [paid-service workflow](./README.md#before-paid-work) for every stage, reusing authorization that already covers the work.

## Search

If `google_search` is advertised directly, call:

```json
{
  "query": ["local seo lead generation data enrichment competitors"],
  "pages_per_query": 1
}
```

Read completed results with `requests_get`. Check the returned billing unit when pricing; pages and result records are not interchangeable units.

## Enrich the Shortlist

Select actual relevant domains from the results. Inspect and price `company_insights`, then call it with an array of those domains:

```json
{"query": ["<selected domain 1>", "<selected domain 2>"]}
```

Read that request's results before comparing companies. If homepage messaging is needed, discover `ai_scraper` and use the [company profile example](./05-ai-scraper-company-profile.md) as a separately priced step. Distinguish source claims from your analysis.
