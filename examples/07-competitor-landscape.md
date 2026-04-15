# Competitor Landscape

## Use Case

Build a quick competitor landscape from web search plus company enrichment.

## Natural-Language Prompt

Search for top competitors in local SEO data enrichment, then enrich the most relevant company domains and summarize positioning differences.

## Recommended Tool Sequence

- `google_search`
- `company_insights`
- optionally `ai_scraper`

## Step 1. Search

```json
{
  "query": ["local seo lead generation data enrichment competitors"],
  "pages_per_query": 1,
  "execution_mode": "sync"
}
```

## Step 2. Enrich Shortlisted Domains

```json
{
  "query": ["outscraper.com", "apollo.io", "zoominfo.com"],
  "fields": ["name", "description", "industry"],
  "execution_mode": "sync"
}
```

## Optional Step 3. Extract Structured Messaging

Use `ai_scraper` on each homepage if you want structured feature or messaging comparison.
