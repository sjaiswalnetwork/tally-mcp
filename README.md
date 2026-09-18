# TallyPrime Connector for Claude

One-click, **read-only** connection between Claude Desktop and TallyPrime / Tally.ERP 9.
No Python, no config files. Your data stays on your PC.

## Install (2 minutes)

1. **Enable Tally's gateway (once):** in TallyPrime press `F1` > Settings > Connectivity > Client/Server configuration. Set *TallyPrime acts as* = **Both**, *Port* = **9000**. Check by opening http://localhost:9000 in a browser: it should say "TallyPrime Server is Running".
2. **Download** `TallyPrime-Connector.mcpb` from the [Releases](../../releases/latest) page.
3. **Double-click** the file. Claude Desktop opens. Click **Install**.
4. With Tally open and a company loaded, ask Claude: *"Check the Tally connection."*

## Tools

| Tool | What it does |
|------|--------------|
| `tally_status` | Confirms Claude can reach Tally |
| `list_companies` | Companies currently open in Tally |
| `list_ledgers` | All ledgers with group and closing balance |
| `get_ledger_balance` | Opening and closing balance for one ledger |
| `get_trial_balance` | Flat trial balance |
| `get_stock_summary` | Stock items with closing quantity and value |
| `get_day_book` | Vouchers between two dates |

## Settings (optional)

Claude Desktop > Settings > Extensions > TallyPrime Connector: gateway URL, company name to lock to, timeout.

## Troubleshooting

- **Not reachable:** Tally is closed, no company is loaded, or the gateway is off. Recheck http://localhost:9000.
- **Empty results:** the open company has no data for that query.

## Build from source

```
npm install --omit=dev
npx @anthropic-ai/mcpb pack . TallyPrime-Connector.mcpb
```

## Safety

Read-only. The server only sends Tally `Export` requests and never creates, alters or deletes data.

MIT License. Not affiliated with Tally Solutions or Anthropic.
