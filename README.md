# TallyPrime Connector for Claude

**Ask Claude questions about your Tally accounts, in plain English or Hindi.**
Free. Read-only. Your data never leaves your computer.

**Made by Shashank** ([sjaiswalnetwork](https://github.com/sjaiswalnetwork)).

---

## 👉 Download here (one click)

### [⬇️ Click to download TallyPrime-Connector.mcpb](https://github.com/sjaiswalnetwork/tally-mcp/releases/download/v1.0.0/TallyPrime-Connector.mcpb)

That is the only file you need. After it downloads, follow the 3 steps below.

If your browser shows a warning like *"This file is not commonly downloaded"*, click **Keep** or **Keep anyway**. The file is safe, it is a small Claude add-on and does not change anything on your computer.

---

## What is this?

Tally is where your shop or company keeps its accounts. Claude is an AI you can chat with on your computer.

This connector lets Claude look inside your Tally so you can simply ask things like:

- *"How much does Sharma Traders owe us?"*
- *"What is my cash balance today?"*
- *"Show me all bills from last month."*

Three things so you feel safe:

- **It can only read.** It can never add, change or delete anything in Tally.
- **Nothing goes to the internet.** Tally and Claude talk to each other inside your own PC.
- **It is free.** Made by Shashank, for anyone.

---

## Before you start, you need two things

1. **Tally** on your PC (TallyPrime or Tally.ERP 9), with your company opened.
2. **Claude Desktop** on your PC. Don't have it? Get it free here: **[claude.ai/download](https://claude.ai/download)**. Install it like any normal app and sign in.

---

## Set up in 3 steps

### Step 1: Turn on Tally's "talk" switch (do this only once)

1. Open Tally.
2. Press the **F1** key on your keyboard.
3. Click **Settings**.
4. Click **Connectivity**.
5. Click **Client/Server configuration**.
6. Where it says **TallyPrime acts as**, choose **Both**.
7. Where it says **Port**, make sure it is **9000**.
8. Press **Ctrl + A** to save.

**Quick check:** open Chrome or any browser and type `localhost:9000` at the top, then press Enter.
If you see the words **"TallyPrime Server is Running"**, Step 1 is done. 🎉

### Step 2: Install the connector

1. Open your **Downloads** folder.
2. Find the file **TallyPrime-Connector.mcpb** (the one you downloaded from the link at the top).
3. **Double-click** it.
4. Claude Desktop opens and shows an **Install** button. Click **Install**.

Done. You do not need to type anything or change any settings.

### Step 3: Try it

1. Make sure Tally is open with your company loaded.
2. Open Claude Desktop.
3. Type this and press Enter:

> Check the Tally connection.

If Claude says it is connected, you are ready. Start asking questions.

---

## Things you can ask Claude

- "Which companies are open in Tally?"
- "Show me all my ledgers with their balances."
- "What is the closing balance of Cash?"
- "Give me the trial balance."
- "How much stock do I have and what is it worth?"
- "List all the vouchers from 1 April to 30 April."
- "Which customers owe me the most money?"

You can ask in your own words. Claude understands.

---

## Something not working?

**Claude says it cannot reach Tally.**
One of these is the reason:
- Tally is closed. Open it.
- No company is loaded in Tally. Load your company.
- Step 1 was not saved. Do Step 1 again and check `localhost:9000` in your browser.

**Claude gives an empty answer.**
Your company has no data for that question. Try a different question or date range.

**Claude Desktop did not open when I double-clicked the file.**
Install Claude Desktop first from [claude.ai/download](https://claude.ai/download), then double-click the file again.

---

## For developers

### Tools

| Tool | What it does |
|------|--------------|
| `tally_status` | Confirms Claude can reach Tally |
| `list_companies` | Companies currently open in Tally |
| `list_ledgers` | All ledgers with group and closing balance |
| `get_ledger_balance` | Opening and closing balance for one ledger |
| `get_trial_balance` | Flat trial balance |
| `get_stock_summary` | Stock items with closing quantity and value |
| `get_day_book` | Vouchers between two dates |

### Settings (optional)

Claude Desktop > Settings > Extensions > TallyPrime Connector: gateway URL, company name to lock to, timeout.

### Build from source

```
npm install --omit=dev
npx @anthropic-ai/mcpb pack . TallyPrime-Connector.mcpb
```

### Safety

Read-only. The server only sends Tally `Export` requests and never creates, alters or deletes data.

MIT License. Made by Shashank. Not affiliated with Tally Solutions or Anthropic.
