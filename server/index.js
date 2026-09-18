#!/usr/bin/env node
// TallyPrime MCP Server (read-only) — Node.js port for one-click .mcpb install
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { XMLParser } from "fast-xml-parser";
import { z } from "zod";

const clean = (v) => (v && !String(v).startsWith("${") ? String(v).trim() : "");
const TALLY_URL = (clean(process.env.TALLY_URL) || "http://localhost:9000").replace(/\/+$/, "");
const TALLY_COMPANY = clean(process.env.TALLY_COMPANY);
const TIMEOUT_MS = (parseFloat(clean(process.env.TALLY_TIMEOUT)) || 60) * 1000;

const parser = new XMLParser({
  ignoreAttributes: false, attributeNamePrefix: "@_", textNodeName: "#text",
  parseTagValue: false, parseAttributeValue: false, trimValues: true, processEntities: true,
});

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

async function post(xml) {
  const res = await fetch(TALLY_URL, {
    method: "POST", body: xml,
    headers: { "Content-Type": "text/xml;charset=utf-8" },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`Tally returned HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  let text;
  if (buf.length >= 2 && ((buf[0] === 0xff && buf[1] === 0xfe) || (buf[1] === 0x00 && buf[0] !== 0x00))) {
    text = new TextDecoder("utf-16le").decode(buf);
  } else {
    try { text = new TextDecoder("utf-8", { fatal: true }).decode(buf); }
    catch { text = new TextDecoder("latin1").decode(buf); }
  }
  // Strip control chars and invalid numeric char refs (e.g. &#4;) that Tally emits
  return text.replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, "").replace(/&#(?:[0-8]|1[124-9]|2\d|3[01]);/g, "");
}

function findAll(node, tag, out = []) {
  if (Array.isArray(node)) { for (const n of node) findAll(n, tag, out); return out; }
  if (node && typeof node === "object") {
    for (const [k, v] of Object.entries(node)) {
      if (k === tag) { for (const item of Array.isArray(v) ? v : [v]) out.push(item); }
      else findAll(v, tag, out);
    }
  }
  return out;
}

function textOf(v) {
  if (v == null) return null;
  if (Array.isArray(v)) v = v[0];
  if (typeof v === "object") v = v["#text"];
  if (v == null) return null;
  const s = String(v).trim();
  return s || null;
}

function staticVars(extra) {
  const parts = ["<SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT>"];
  if (TALLY_COMPANY) parts.push(`<SVCURRENTCOMPANY>${esc(TALLY_COMPANY)}</SVCURRENTCOMPANY>`);
  for (const [k, v] of Object.entries(extra || {})) parts.push(`<${k}>${esc(v)}</${k}>`);
  return parts.join("");
}

async function collection(collName, objType, methods, extra) {
  const methodXml = methods.map((m) => `<NATIVEMETHOD>${m}</NATIVEMETHOD>`).join("");
  const xml = `<ENVELOPE><HEADER><VERSION>1</VERSION><TALLYREQUEST>Export</TALLYREQUEST><TYPE>Collection</TYPE><ID>${collName}</ID></HEADER><BODY><DESC><STATICVARIABLES>${staticVars(extra)}</STATICVARIABLES><TDL><TDLMESSAGE><COLLECTION NAME="${collName}" ISMODIFY="No" ISFIXED="No" ISINITIALIZE="No" ISOPTION="No" ISINTERNAL="No"><TYPE>${objType}</TYPE>${methodXml}</COLLECTION></TDLMESSAGE></TDL></DESC></BODY></ENVELOPE>`;
  const root = parser.parse(await post(xml));
  const tag = objType.toUpperCase().replace(/ /g, "");
  const rows = [];
  for (const el of findAll(root, tag)) {
    if (!el || typeof el !== "object") continue;
    const name = el["@_NAME"] || el["@_Name"] || "";
    const row = { name };
    let hasValue = false;
    for (const m of methods) {
      const val = textOf(el[m.toUpperCase().replace(/\./g, "")]);
      row[m] = val;
      if (val) hasValue = true;
    }
    if (!name && !hasValue) continue;
    rows.push(row);
  }
  return rows;
}

function num(v) {
  if (v == null) return null;
  const m = String(v).replace(/,/g, "").match(/-?\d+(?:\.\d+)?/);
  return m ? parseFloat(m[0]) : null;
}

function tallyDate(value) {
  const v = value.trim();
  if (/^\d{8}$/.test(v)) return v;
  let m;
  if ((m = v.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/))) return m[1] + m[2].padStart(2, "0") + m[3].padStart(2, "0");
  if ((m = v.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/))) return m[3] + m[2].padStart(2, "0") + m[1].padStart(2, "0");
  if ((m = v.match(/^(\d{1,2})-([A-Za-z]+)-(\d{4})$/))) {
    const i = ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"].indexOf(m[2].slice(0, 3).toLowerCase());
    if (i >= 0) return m[3] + String(i + 1).padStart(2, "0") + m[1].padStart(2, "0");
  }
  throw new Error(`Could not understand date '${value}'. Use YYYY-MM-DD.`);
}

const HINT = "Make sure TallyPrime is open with a company loaded and the gateway is enabled (F1 > Settings > Connectivity > Client/Server configuration: acts as Both, port 9000).";
const wrap = (fn) => async (args) => {
  try {
    return { content: [{ type: "text", text: JSON.stringify(await fn(args || {}), null, 2) }] };
  } catch (e) {
    return { content: [{ type: "text", text: JSON.stringify({ error: String(e?.message || e), hint: HINT }, null, 2) }], isError: true };
  }
};

const server = new McpServer({ name: "tally", version: "1.0.0" });
const group = { group: z.string().optional().describe('Optional group filter, e.g. "Sundry Debtors"') };

server.tool("tally_status", "Check that the Tally gateway is reachable. Use this first if anything else fails.", {}, wrap(async () => {
  try {
    const r = await fetch(TALLY_URL, { signal: AbortSignal.timeout(TIMEOUT_MS) });
    return { url: TALLY_URL, reachable: true, status_code: r.status, server: (await r.text()).trim().slice(0, 200), company: TALLY_COMPANY || "(currently active company in Tally)" };
  } catch (e) {
    return { url: TALLY_URL, reachable: false, error: String(e?.cause?.message || e?.message || e), hint: HINT };
  }
}));

server.tool("list_companies", "List the companies currently open in Tally.", {}, wrap(async () =>
  (await collection("CompColl", "Company", ["Name", "StartingFrom", "EndingAt"]))
    .map((r) => ({ name: r.name || r.Name, books_from: r.StartingFrom, books_to: r.EndingAt }))));

const ledgerList = (coll) => wrap(async ({ group }) =>
  (await collection(coll, "Ledger", ["Name", "Parent", "ClosingBalance"]))
    .map((r) => ({ ledger: r.name || r.Name, group: r.Parent, closing_balance: num(r.ClosingBalance) }))
    .filter((i) => !group || (i.group || "").toLowerCase() === group.toLowerCase()));

server.tool("list_ledgers", "List all ledgers with their group and closing balance. Optionally filter to one group.", group, ledgerList("LedColl"));
server.tool("get_trial_balance", "Every ledger with its group and closing balance — a flat trial balance. Optionally filter to one group.", group, ledgerList("TBColl"));

server.tool("get_ledger_balance", "Opening and closing balance for one ledger by name (case-insensitive).",
  { ledger_name: z.string().describe("Exact ledger name") }, wrap(async ({ ledger_name }) => {
    const rows = await collection("LedBalColl", "Ledger", ["Name", "Parent", "OpeningBalance", "ClosingBalance"]);
    const r = rows.find((x) => (x.name || x.Name || "").toLowerCase() === ledger_name.toLowerCase());
    if (!r) return { error: `Ledger '${ledger_name}' not found. Use list_ledgers to see available names.` };
    return { ledger: r.name || r.Name, group: r.Parent, opening_balance: num(r.OpeningBalance), closing_balance: num(r.ClosingBalance) };
  }));

server.tool("get_stock_summary", "Stock items with closing quantity and closing value.", {}, wrap(async () =>
  (await collection("StkColl", "StockItem", ["Name", "Parent", "ClosingBalance", "ClosingValue"]))
    .map((r) => ({ item: r.name || r.Name, group: r.Parent, closing_qty: r.ClosingBalance, closing_value: num(r.ClosingValue) }))));

server.tool("get_day_book", "List vouchers between two dates (inclusive). Dates as YYYY-MM-DD.",
  { from_date: z.string().describe("YYYY-MM-DD"), to_date: z.string().describe("YYYY-MM-DD") },
  wrap(async ({ from_date, to_date }) =>
    (await collection("DayBookColl", "Voucher", ["Date", "VoucherTypeName", "VoucherNumber", "PartyLedgerName", "Amount"],
      { SVFROMDATE: tallyDate(from_date), SVTODATE: tallyDate(to_date) }))
      .map((r) => ({ date: r.Date, voucher_type: r.VoucherTypeName, voucher_number: r.VoucherNumber, party: r.PartyLedgerName, amount: num(r.Amount) }))));

await server.connect(new StdioServerTransport());
