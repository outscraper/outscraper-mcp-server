# Agent Skills Examples

This folder contains example skills for AI agents that use multiple Outscraper MCP tools to achieve a business result.

These are example skill folders, not auto-installed skills. Copy them into your skill directory if you want an agent runtime to discover them as actual skills.

## Why These Skill Examples Exist

They show how to package:

- multi-tool workflows
- orchestration guidance
- async submit-and-poll behavior
- business-oriented prompts instead of endpoint-oriented prompts

## Architecture Notes

These examples follow a few modern agent patterns that are broadly consistent with current guidance from OpenAI and the wider agent tooling ecosystem:

- start with a single agent when one agent can hold the context and choose among a manageable toolset
- use a manager-style workflow when one orchestrator should control the user interaction while calling specialized steps
- use async submit-poll-summarize loops for long-running jobs instead of blocking every request
- split into multiple specialized agents only when tool selection or instruction following becomes unreliable in a single-agent setup

In practice:

- one skill can describe a single-agent workflow that calls several tools
- several skills can represent specialist workflows in a manager-worker design
- request lifecycle tools like `requests_get` become part of the skill when async operations are expected

## Included Skill Examples

- [local-market-scout](./local-market-scout/SKILL.md)
- [lead-enrichment-pipeline](./lead-enrichment-pipeline/SKILL.md)
- [async-company-research](./async-company-research/SKILL.md)

## Suggested Agent Patterns

### Single-Agent First

Use one agent with one skill when:

- the workflow is linear
- the toolset is small and clear
- the agent can keep enough context in one pass

### Manager Pattern

Use a manager plus specialist skills when:

- the workflow mixes discovery, enrichment, and synthesis
- tasks are separable
- you want one agent to own the user interaction and final answer

Suggested split:

- scouting skill for discovery
- enrichment skill for company/contact lookup
- extraction skill for one-page `ai_scraper` tasks

### Async Loop Pattern

Use an async workflow skill when:

- the upstream task may take noticeable time
- the API returns a request id
- the agent should submit, poll, then summarize

## References

Architecture inspiration:

- OpenAI practical guide to building agents: manager pattern, tools, instructions, and when to use agents
- OpenAI guidance on workflows, single-agent systems, and multi-agent architectures

Sources:

- https://openai.com/business/guides-and-resources/a-practical-guide-to-building-ai-agents/
- https://developers.openai.com/api/docs/guides/evaluation-best-practices
