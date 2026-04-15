# Examples

This folder contains task-oriented examples for using Outscraper through MCP.

The structure is inspired by how teams like Firecrawl present usage: practical workflows first, API details second.

Use these examples when you want to:

- copy a prompt directly into an MCP client
- understand which tool to use for a business task
- see when to use sync versus async execution
- combine discovery, enrichment, and polling into one workflow

Included examples:

- [01-business-discovery.md](./01-business-discovery.md)
- [02-review-monitoring.md](./02-review-monitoring.md)
- [03-company-enrichment.md](./03-company-enrichment.md)
- [04-contact-discovery.md](./04-contact-discovery.md)
- [05-ai-scraper-company-profile.md](./05-ai-scraper-company-profile.md)
- [06-async-research-workflow.md](./06-async-research-workflow.md)
- [07-competitor-landscape.md](./07-competitor-landscape.md)
- [08-market-entry-scouting.md](./08-market-entry-scouting.md)

Agent skill examples:

- [skills/README.md](./skills/README.md)

## How To Read These Examples

Each example includes:

- a real business use case
- a natural-language prompt for an MCP-capable assistant
- the recommended Outscraper tool or tool sequence
- sample arguments you can adapt

## Common Patterns

### 1. Discovery

Use:

- `google_maps_search` for ad hoc place discovery
- `businesses_search` for structured business filtering

### 2. Enrichment

Use:

- `company_insights` for firmographics
- `emails_and_contacts` for contact discovery
- `ai_scraper` for one-page structured extraction

### 3. Reviews and Media

Use:

- `google_maps_reviews`
- `google_maps_photos`
- `booking_reviews`
- `tripadvisor_reviews`
- `yelp_reviews`

### 4. Async Workflows

Use:

- `execution_mode: "async"` when a task may be long-running
- `requests_get` to poll by `request_id`
- `requests_list` and `requests_delete` for async job management
