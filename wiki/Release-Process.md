# Release Process

## Release 0.3.0

This release makes the Node package a bridge to Rashida's MCP tools. The tool
contract changes from 0.2.x, so use the 0.3.0 release notes in `CHANGELOG.md` and
tell users to refresh tools and update saved workflows.

The public setup page is https://mcp.outscraper.com/. The registry advertises
the hosted OAuth endpoint at `https://api.outscraper.com/mcp` and retains the
optional npm bridge. API-key connections use
`https://api.outscraper.com/mcp/<API_KEY>`; that URL must not be confused with
OAuth or the Node bridge's own HTTP header authentication.

## Pre-Release Checks

```bash
npm ci
npm run check
npm test
npm run build
npm pack --dry-run
```

Confirm that documentation and examples match the current bridge behavior. Check package and MCP registry metadata together when changing release versions.

Confirm that Rashida's API-key MCP endpoint is deployed before this bridge release. Against the intended staging or production API host, compare tool discovery and an authorized read-only call through Node with the direct keyed endpoint. Verify organization boundaries and the actual public proxy route. `/health` is not an upstream readiness check.

If retaining old public Node addresses, confirm they still route to the Node process; an npm release does not restore DNS or hosting. Ensure credential-bearing paths are redacted throughout the proxy and tracing stack.

Keep these values aligned before creating the release:

| Field | Release value |
| --- | --- |
| `package.json.version` | `0.3.0` |
| `package-lock.json.version` and `packages[""].version` | `0.3.0` |
| `server.json.version` and npm package version | `0.3.0` |
| `package.json.mcpName` and `server.json.name` | `io.github.outscraper/outscraper-mcp-server` |
| Package homepage and registry website | `https://mcp.outscraper.com/` (a trailing slash is optional) |

Install the official [MCP publisher](https://modelcontextprotocol.io/registry/quickstart#step-3-install-the-mcp-publisher-cli)
and validate the maintained file. On macOS, `brew install mcp-publisher` installs
it; use `brew upgrade mcp-publisher` if it is already installed.

```bash
mcp-publisher validate server.json
```

Validation checks the metadata, not production authentication or package
ownership. Keep the existing registry name and `mcpName`; do not run
`mcp-publisher init` over this file or create a second listing for this migration.

## 1. Publish the npm Release

1. Copy the reviewed local changes to the repository, including the lockfile.
2. Remove `(Unreleased)` from the 0.3.0 changelog heading when making the release,
   then commit and push all release changes together.
3. Create and publish a GitHub release tagged `v0.3.0` from that exact commit.
   Use the 0.3.0 changelog section as its release notes.
4. Wait for [Publish npm](../.github/workflows/publish-npm.yml) to succeed. It
   runs the checks and publishes using the existing repository secret
   `npm_token`. The separate Docker workflow also runs on release publication.
5. Verify the exact published package before continuing:

```bash
npm view outscraper-mcp@0.3.0 version mcpName homepage --json
```

The result must report version `0.3.0`, the existing `mcpName`, and the MCP setup
website. The registry checks the referenced npm package, so npm must succeed
first. Publishing a GitHub release already invokes npm publication; do not also
run `npm publish` for the same version.

## 2. Publish the MCP Registry Metadata

The current workflows publish npm and Docker, not the MCP Registry. Updating
GitHub's `server.json` alone does not update the public registry.

For manual publication under `io.github.outscraper/*`, use an Outscraper GitHub
organization **Owner's** personal access token. The current interactive
`mcp-publisher login github` device flow cannot grant organization namespaces.
The token needs classic `read:org`, or fine-grained Organization permissions >
Members > Read-only for Outscraper; repository permissions are not required.
See the [official organization authentication requirements](https://modelcontextprotocol.io/registry/authentication#personal-vs-organization-namespaces).

Supply that token securely as `MCP_REGISTRY_GITHUB_TOKEN` in the publishing
terminal, then run from the repository root:

```bash
mcp-publisher login github --token "$MCP_REGISTRY_GITHUB_TOKEN"
mcp-publisher publish server.json
```

Never put the token in a tracked file, copied commands with a literal secret,
or release notes. GitHub Actions OIDC is an alternative if registry publishing
is later added to the workflow; it is not configured by this release.

## 3. Verify the Published Entry and Refresh Listings

```bash
curl -fsS 'https://registry.modelcontextprotocol.io/v0.1/servers/io.github.outscraper%2Foutscraper-mcp-server/versions/0.3.0'
```

Confirm the response has the existing name, version `0.3.0`, npm version
`0.3.0`, the setup website, and the OAuth remote URL. The OAuth remote must not
require the old `X-OUTSCRAPER-API-KEY` header. Also check the
[public registry search](https://registry.modelcontextprotocol.io/?q=outscraper)
shows 0.3.0 as the latest version. Published version metadata is immutable;
corrections require a new unique registry version.

Refresh owned Glama, MCP.so, and PulseMCP listings so they point to the setup
website and distinguish the hosted service from the optional Node bridge.
Mark listings of the earlier Python implementation as legacy. Directory
refreshes are separate from this repository's release; verify their visible
instructions after updating them.

After publication, verify installation of the published version and the configured remote connection. Announce only capabilities verified on the deployed backend. New backend tools do not independently require a Node package release.
