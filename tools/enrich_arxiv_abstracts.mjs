import fs from "node:fs/promises";

const candidatesPath = "cv_top100_candidates.json";
const candidates = JSON.parse(await fs.readFile(candidatesPath, "utf8"));
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function arxivId(paper) {
  if (paper.arxiv) return paper.arxiv;
  const text = `${paper.pdf ?? ""} ${paper.url ?? ""}`;
  const match = text.match(/arxiv\.org\/(?:abs|pdf)\/([0-9]{4}\.[0-9]{4,5})(?:v[0-9]+)?/i);
  return match?.[1] ?? "";
}

function decodeXml(value) {
  return String(value ?? "")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&apos;", "'");
}

async function fetchArxivAbstract(id) {
  const url = `https://export.arxiv.org/api/query?id_list=${encodeURIComponent(id)}`;
  const response = await fetch(url, {
    headers: { "User-Agent": "computational-imaging-frontier/1.0" },
  });
  if (!response.ok) throw new Error(`arXiv ${id}: HTTP ${response.status}`);
  const xml = await response.text();
  const match = xml.match(/<summary>([\s\S]*?)<\/summary>/);
  return decodeXml(match?.[1] ?? "").replace(/\s+/g, " ").trim();
}

let updated = 0;
for (const paper of candidates) {
  if (paper.abstract) continue;
  const id = arxivId(paper);
  if (!id) continue;
  console.log(`Fetching arXiv abstract ${id}: ${paper.title}`);
  const abstract = await fetchArxivAbstract(id);
  if (abstract) {
    paper.abstract = abstract;
    if (!paper.arxiv) paper.arxiv = id;
    updated += 1;
  }
  await sleep(350);
}

await fs.writeFile(candidatesPath, JSON.stringify(candidates, null, 2) + "\n", "utf8");
console.log(`Updated ${updated} missing abstracts`);
