# AI Scraper Company Profile

## Use Case

Extract a compact structured company profile from one landing page or documentation page.

## Natural-Language Prompt

Extract the company name, product description, key people mentioned, and notable claims from this page.

## Recommended Tool

- `ai_scraper`

## Example Arguments

```json
{
  "query": "https://outscraper.com",
  "prompt": "Extract company name, company description, notable claims, and people mentioned on the page.",
  "schema": {
    "type": "object",
    "required": [],
    "properties": {
      "company_name": { "type": "string" },
      "company_description": { "type": "string" },
      "notable_claims": {
        "type": "array",
        "items": { "type": "string" }
      },
      "people": {
        "type": "array",
        "items": { "type": "string" }
      }
    }
  },
  "execution_mode": "sync"
}
```

## Notes

- this tool is best for extracting structured data from a single page
- `schema` describes the shape of the output you want back
- `execution_mode: "async"` returns a request id for polling with `requests_get`
