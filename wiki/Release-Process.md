# Release Process

## Pre-Release Checks

```bash
npm ci
npm run check
npm test
npm run build
npm pack --dry-run
```

Confirm that documentation and examples match the current bridge behavior. Check package and MCP registry metadata together when changing release versions.

Deploy Rashida's API-key MCP endpoint before this bridge release. Against the intended staging or production API host, compare tool discovery and an authorized read-only call through Node with the direct keyed endpoint. Verify organization boundaries and the actual public proxy route. `/health` is not an upstream readiness check.

If retaining old public Node addresses, confirm they still route to the Node process; an npm release does not restore DNS or hosting. Ensure credential-bearing paths are redacted throughout the proxy and tracing stack.

## Publication

Follow the repository's existing npm and Docker release workflows after the release is authorized. Keep `package.json`, lockfile metadata and `server.json` versions aligned when bumping the version. Inspect the package contents before publishing.

This release changes the tool contract to match Rashida. Release notes must tell existing users to refresh tools and update fixed workflows for current catalog names, asynchronous submissions, `requests_get.id` and backend result content. Existing connection paths and API keys remain supported by the Node application.

After publication, verify installation of the published version and the configured remote connection. Announce only capabilities verified on the deployed backend. New backend tools do not independently require a Node package release.
