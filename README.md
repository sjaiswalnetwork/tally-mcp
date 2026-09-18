# TallyPrime Connector for Claude

One-click, **read-only** connection between Claude Desktop and TallyPrime / Tally.ERP 9.
No Python, no config files. Your data stays on your PC.

**Made by Shashank** ([sjaiswalnetwork](https://github.com/sjaiswalnetwork)).

---

## What this is, in one minute

Tally is the software where your shop or company keeps its accounts. Claude is an AI you can chat with on your computer. Normally Claude cannot see what is inside Tally.

The TallyPrime Connector is a small bridge between the two. Once it is installed, you can ask Claude questions in normal language, like *"How much does Sharma Traders owe us?"* or *"What did we sell last week?"*, and Claude reads the answer straight out of your Tally.

Three things to know so you feel safe:

- **It can only read.** It can never add, change or delete anything in Tally. Think of it as a window, not a door.
- **Nothing leaves your computer.** Tally and Claude talk to each other inside your own PC.
- **It is free and open.** Anyone can download it from the link below.

## Who can use it

Anyone who has these two things on a Windows PC:

1. TallyPrime (or the older Tally.ERP 9) with a company opened in it.
2. The Claude Desktop app, a free download from [claude.ai/download](https://claude.ai/download).

No coding, no typing commands, nothing to configure.

## Install in 4 easy steps

### Step 1. Tell Tally it is allowed to talk (only once)

1. Open Tally.
2. Press the **F1** key on your keyboard.
3. Click **Settings**, then **Connectivity**, then **Client/Server configuration**.
4. Find *TallyPrime acts as* and choose **Both**.
5. Find *Port* and make sure it says **9000**.
6. Press **Ctrl+A** to save.

To check it worked, open any web browser and type `localhost:9000` in the address bar. If it says **"TallyPrime Server is Running"**, this step is done.

### Step 2. Download the connector

Go to the [Releases page](../../releases/latest) and click the file named **TallyPrime-Connector.mcpb**.

### Step 3. Install it

Find the downloaded file, usually in your **Downloads** folder, and **double-click** it. Claude Desktop will open and show an **Install** button. Click it. That's it.

### Step 4. Try it

Keep Tally open with your company loaded. Open Claude and type:

> Check the Tally connection.

If Claude says it is connected, start asking your questions.

## Things you can ask Claude

- "Which companies are open in Tally?"
- "Show me all my ledgers with their balances."
- "What is the closing balance of Cash?"
- "Give me the trial balance."
- "How much stock do I have and what is it worth?"
- "List all the vouchers from 1 April to 30 April."

## If something goes wrong

- **Claude says it cannot reach Tally.** Tally is closed, no company is loaded, or Step 1 was not saved. Open Tally, load a company, and check `localhost:9000` in your browser again.
- **Claude gives an empty answer.** The company you have open simply has no data for that question.

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
