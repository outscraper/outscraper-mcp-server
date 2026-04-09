# Release Process

## Pre-Release Checks

Run:

```bash
npm run build
npm run check
npm pack --dry-run
```

Also verify:

- README is accurate
- package metadata is correct
- new tools are visible in `listTools`
- at least one live MCP smoke test passed for changed services

## npm Publish

The project is configured for npm publication.

Typical flow:

1. bump version
2. create release commit
3. publish to npm
4. verify install with `npx -y outscraper-mcp`

## GitHub Release

After publishing:

1. create a GitHub release
2. include notable additions and fixes
3. mention newly added tools or behavior changes

## MCP Registry

If publishing to the MCP Registry, make sure metadata stays aligned with the registry naming and package configuration.
