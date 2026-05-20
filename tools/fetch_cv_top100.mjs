import fs from "node:fs/promises";

const venues = ["CVPR", "ICCV", "ECCV"];
const years = Array.from({ length: 10 }, (_, index) => 2016 + index);
const fields = [
  "paperId",
  "title",
  "authors",
  "year",
  "venue",
  "citationCount",
  "abstract",
  "url",
  "externalIds",
  "openAccessPdf",
].join(",");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function conferenceName(venue) {
  if (venue === "CVPR") return "CVPR";
  if (venue === "ICCV") return "ICCV";
  if (venue === "ECCV") return "ECCV";
  return venue;
}

function normalizeTitle(title) {
  return String(title ?? "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

async function fetchBatch(venue, year) {
  const url = new URL("https://api.semanticscholar.org/graph/v1/paper/search/bulk");
  url.searchParams.set("venue", venue);
  url.searchParams.set("year", String(year));
  url.searchParams.set("fields", fields);
  url.searchParams.set("sort", "citationCount:desc");

  const response = await fetch(url, {
    headers: {
      "User-Agent": "computational-imaging-frontier/1.0",
    },
  });

  if (!response.ok) {
    throw new Error(`${venue} ${year}: HTTP ${response.status} ${await response.text()}`);
  }

  const payload = await response.json();
  return (payload.data ?? []).map((paper) => ({
    ...paper,
    sourceVenueQuery: venue,
    sourceYearQuery: year,
    conference: conferenceName(venue),
  }));
}

const all = [];
for (const venue of venues) {
  for (const year of years) {
    console.log(`Fetching ${venue} ${year}`);
    all.push(...(await fetchBatch(venue, year)));
    await sleep(1200);
  }
}

const deduped = new Map();
for (const paper of all) {
  const key = paper.paperId || normalizeTitle(paper.title);
  const previous = deduped.get(key);
  if (!previous || Number(paper.citationCount ?? 0) > Number(previous.citationCount ?? 0)) {
    deduped.set(key, paper);
  }
}

const ranked = [...deduped.values()]
  .filter((paper) => paper.title && paper.year >= 2016 && paper.year <= 2025)
  .sort((a, b) => Number(b.citationCount ?? 0) - Number(a.citationCount ?? 0))
  .slice(0, 100)
  .map((paper, index) => ({
    rank: index + 1,
    paperId: paper.paperId,
    title: paper.title,
    authors: (paper.authors ?? []).slice(0, 6).map((author) => author.name),
    year: paper.year,
    conference: paper.conference,
    semanticScholarVenue: paper.venue,
    citationCount: paper.citationCount ?? 0,
    url: paper.url,
    doi: paper.externalIds?.DOI ?? "",
    arxiv: paper.externalIds?.ArXiv ?? "",
    pdf: paper.openAccessPdf?.url ?? "",
    abstract: paper.abstract ?? "",
    sourceVenueQuery: paper.sourceVenueQuery,
    sourceYearQuery: paper.sourceYearQuery,
  }));

await fs.writeFile("cv_top100_candidates.json", JSON.stringify(ranked, null, 2) + "\n", "utf8");
console.log(`Wrote ${ranked.length} papers to cv_top100_candidates.json`);
