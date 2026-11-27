# Agent Skill Examples

These example skills describe workflows using the current Outscraper MCP contract. They are repository examples, not automatically installed skills. Adapt and copy one into your agent runtime's skill directory if needed.

- [Local Market Scout](./local-market-scout/SKILL.md)
- [Lead Enrichment Pipeline](./lead-enrichment-pipeline/SKILL.md)
- [Async Company Research](./async-company-research/SKILL.md)

Each workflow inspects live schemas, checks pricing before paid work, stays within user authorization, and reads asynchronous results by returned `id`. Availability follows the connected organization. Targetron supports catalog, catalog pricing and balance only.

Use the [shared execution guidance](../README.md#before-paid-work) and current tool descriptions. A skill does not authorize account access or paid execution by itself. Keep keys in the client's private configuration rather than skill text.
