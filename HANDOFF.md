# HANDOFF — TallyPrime Connector (for Claude Code)

## Goal
Publish this folder to GitHub as a public repo and attach the built `.mcpb` as release v1.0.0, so anyone with TallyPrime + Claude Desktop can install with one double-click.

## State
| Item | Status |
|---|---|
| Node.js MCP server (`server/index.js`), 7 read-only tools | Done |
| `manifest.json` (MCPB manifest v0.3, user_config form) | Done, `mcpb validate` passes |
| Tested against a mock Tally gateway (all 7 tools) | Pass |
| Tested against a real TallyPrime | NOT DONE |
| README, LICENSE (MIT), .gitignore, .mcpbignore | Done |
| GitHub repo + release | NOT DONE (this handoff) |

## Files
```
manifest.json        MCPB manifest: name, tools, user_config (tally_url, tally_company, tally_timeout)
package.json         type=module; deps: @modelcontextprotocol/sdk, fast-xml-parser, zod
server/index.js      The whole server. stdio transport. Only sends Tally "Export" requests.
README.md            End-user install steps; download link points to ../../releases/latest
LICENSE              MIT
.gitignore           node_modules/, *.mcpb
.mcpbignore          package-lock.json, *.map
```
`TallyPrime-Connector.mcpb` (3.2 MB, prebuilt) is delivered separately. It is a release asset, not a committed file.

## Tasks for Claude Code
Ask the user for: GitHub username, repo name (suggest `tally-mcp`), public or private (public is needed for others to download).

1. Check tooling: `git --version`, `gh --version`, `gh auth status`. If `gh` is not logged in, have the user run `gh auth login` themselves.
2. In this folder:
   ```
   git init -b main
   git add -A
   git commit -m "TallyPrime Connector v1.0.0"
   gh repo create <name> --public --source . --push --description "One-click read-only TallyPrime connector for Claude Desktop"
   ```
3. Rebuild the bundle (or use the prebuilt one if present):
   ```
   npm install --omit=dev
   npx @anthropic-ai/mcpb validate manifest.json
   npx @anthropic-ai/mcpb pack . TallyPrime-Connector.mcpb
   ```
4. Release:
   ```
   gh release create v1.0.0 TallyPrime-Connector.mcpb --title "v1.0.0" --notes "First release. Read-only. Requires TallyPrime gateway on port 9000 and Claude Desktop."
   ```
5. Verify: open the repo, confirm README renders and the Releases link downloads the `.mcpb`.
6. Optional: update `author` in `manifest.json` and the copyright line in `LICENSE` to the user's preferred public name, and add `"repository": {"type":"git","url":"https://github.com/<user>/<name>"}` to `manifest.json`. If changed, bump to 1.0.1, repack, re-release.

## Test on a real Tally before announcing (10 min)
1. TallyPrime open, company loaded, gateway on: F1 > Settings > Connectivity > acts as Both, port 9000. `http://localhost:9000` must show "TallyPrime Server is Running".
2. If an old `"tally"` entry exists in `claude_desktop_config.json` (the earlier Python version), remove it and restart Claude Desktop.
3. Double-click `TallyPrime-Connector.mcpb` > Install.
4. In Claude Desktop ask: "Check the Tally connection", "List companies", "List ledgers in Sundry Debtors", "Day book for the last 7 days", "Stock summary".

## Known risks to check on real data
| Risk | Where | What to look for |
|---|---|---|
| `list_companies` returns empty | `collection("CompColl","Company",...)` | Real Tally may nest COMPANY differently; mock did not cover it |
| Debit/credit sign | `num()` | Tally shows debit balances as negative in XML; decide whether to add a `dr_cr` field |
| Day book date range ignored | `get_day_book` | Some Tally versions need a TDL filter on `$Date` rather than SVFROMDATE/SVTODATE |
| Large companies | `get_day_book`, `list_ledgers` | Slow or huge output; raise timeout in extension settings, consider a `limit` param |
| Voucher `Amount` empty | `get_day_book` | May need `AllLedgerEntries` instead of header Amount |

Local debugging without Claude: `TALLY_URL=http://localhost:9000 npx @modelcontextprotocol/inspector node server/index.js`

## Design decisions (do not undo without reason)
- Node, not Python: Claude Desktop ships Node, so end users install nothing.
- Read-only by construction: only `TALLYREQUEST=Export`. Do not add Import/alter tools to this extension.
- Unfilled `${user_config.*}` placeholders are treated as blank (`clean()` in `index.js`).
- Response cleaning strips control chars and invalid `&#n;` refs that Tally emits.

## Later (not now)
- Outstanding receivables/payables, GST registers, P&L and balance sheet tools
- Sign the bundle (`mcpb sign`) to remove the unsigned-extension warning
- Submit to the Claude Desktop extensions directory
