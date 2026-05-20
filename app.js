const state = {
  papers: [],
  filters: {
    search: "",
    topic: "",
    modality: "",
    year: "",
    minScore: 0,
    sortBy: "priority",
  },
};

const els = {
  search: document.querySelector("#search"),
  topicFilter: document.querySelector("#topicFilter"),
  modalityFilter: document.querySelector("#modalityFilter"),
  yearFilter: document.querySelector("#yearFilter"),
  scoreFilter: document.querySelector("#scoreFilter"),
  scoreOutput: document.querySelector("#scoreOutput"),
  sortBy: document.querySelector("#sortBy"),
  resetFilters: document.querySelector("#resetFilters"),
  paperList: document.querySelector("#paperList"),
  resultCount: document.querySelector("#resultCount"),
  paperCount: document.querySelector("#paperCount"),
  topicCount: document.querySelector("#topicCount"),
  highValueCount: document.querySelector("#highValueCount"),
  topicMap: document.querySelector("#topicMap"),
};

function uniqueSorted(items) {
  return [...new Set(items.filter(Boolean))].sort((a, b) =>
    String(a).localeCompare(String(b), "zh-Hans-CN"),
  );
}

function paperScore(paper) {
  const novelty = Number(paper.scores?.novelty ?? 0);
  const reproducibility = Number(paper.scores?.reproducibility ?? 0);
  const impact = Number(paper.scores?.impact ?? 0);
  const fit = Number(paper.scores?.fit ?? 0);
  return Math.round((0.3 * novelty + 0.25 * impact + 0.25 * fit + 0.2 * reproducibility) * 10) / 10;
}

function fillSelect(select, values) {
  const first = select.querySelector("option");
  select.replaceChildren(first);
  values.forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    select.append(option);
  });
}

function hydrateFilters() {
  fillSelect(els.topicFilter, uniqueSorted(state.papers.map((paper) => paper.topic)));
  fillSelect(els.modalityFilter, uniqueSorted(state.papers.map((paper) => paper.modality)));
  fillSelect(
    els.yearFilter,
    uniqueSorted(state.papers.map((paper) => paper.year)).sort((a, b) => b - a),
  );
}

function matchesPaper(paper) {
  const score = paperScore(paper);
  const haystack = [
    paper.title,
    paper.authors,
    paper.venue,
    paper.topic,
    paper.modality,
    paper.problem,
    paper.contribution,
    paper.limitation,
    ...(paper.tags ?? []),
  ]
    .join(" ")
    .toLowerCase();

  return (
    haystack.includes(state.filters.search.toLowerCase()) &&
    (!state.filters.topic || paper.topic === state.filters.topic) &&
    (!state.filters.modality || paper.modality === state.filters.modality) &&
    (!state.filters.year || String(paper.year) === state.filters.year) &&
    score >= state.filters.minScore
  );
}

function sortPapers(papers) {
  const key = state.filters.sortBy;
  return [...papers].sort((a, b) => {
    if (key === "year") return b.year - a.year || paperScore(b) - paperScore(a);
    if (key === "reproducibility") {
      return (b.scores?.reproducibility ?? 0) - (a.scores?.reproducibility ?? 0);
    }
    if (key === "impact") return (b.scores?.impact ?? 0) - (a.scores?.impact ?? 0);
    return paperScore(b) - paperScore(a);
  });
}

function paperCard(paper) {
  const card = document.createElement("article");
  card.className = "paper-card";
  const tags = (paper.tags ?? []).map((tag) => `<span class="tag">${tag}</span>`).join("");
  const link = paper.url
    ? `<a href="${paper.url}" target="_blank" rel="noreferrer">查看论文</a>`
    : "<span>待补链接</span>";

  card.innerHTML = `
    <div class="paper-top">
      <div>
        <h3>${paper.title}</h3>
        <div class="paper-meta">${paper.authors} · ${paper.venue} · ${paper.year}</div>
      </div>
      <div class="score" title="综合价值评分">${paperScore(paper)}</div>
    </div>
    <div class="summary-grid">
      <div>
        <strong>问题</strong>
        <p>${paper.problem}</p>
      </div>
      <div>
        <strong>贡献</strong>
        <p>${paper.contribution}</p>
      </div>
      <div>
        <strong>局限</strong>
        <p>${paper.limitation}</p>
      </div>
    </div>
    <div class="tags">${tags}</div>
    <div class="paper-actions">
      <span>${paper.topic} · ${paper.modality}</span>
      ${link}
    </div>
  `;
  return card;
}

function renderPapers() {
  const filtered = sortPapers(state.papers.filter(matchesPaper));
  els.paperList.replaceChildren(...filtered.map(paperCard));
  els.resultCount.textContent = `${filtered.length} 篇`;
}

function renderStats() {
  const topics = uniqueSorted(state.papers.map((paper) => paper.topic));
  els.paperCount.textContent = state.papers.length;
  els.topicCount.textContent = topics.length;
  els.highValueCount.textContent = state.papers.filter((paper) => paperScore(paper) >= 8).length;
}

function renderTopicMap() {
  const topics = uniqueSorted(state.papers.map((paper) => paper.topic));
  const nodes = topics.map((topic) => {
    const papers = state.papers.filter((paper) => paper.topic === topic);
    const topPaper = sortPapers(papers)[0];
    const node = document.createElement("article");
    node.className = "topic-node";
    node.innerHTML = `
      <h3>${topic}</h3>
      <p>${topPaper?.directionNote ?? "补充该方向的核心问题、代表方法和开放挑战。"}</p>
      <span>${papers.length} 篇论文</span>
    `;
    return node;
  });
  els.topicMap.replaceChildren(...nodes);
}

function wireEvents() {
  els.search.addEventListener("input", (event) => {
    state.filters.search = event.target.value.trim();
    renderPapers();
  });
  els.topicFilter.addEventListener("change", (event) => {
    state.filters.topic = event.target.value;
    renderPapers();
  });
  els.modalityFilter.addEventListener("change", (event) => {
    state.filters.modality = event.target.value;
    renderPapers();
  });
  els.yearFilter.addEventListener("change", (event) => {
    state.filters.year = event.target.value;
    renderPapers();
  });
  els.scoreFilter.addEventListener("input", (event) => {
    state.filters.minScore = Number(event.target.value);
    els.scoreOutput.value = event.target.value;
    renderPapers();
  });
  els.sortBy.addEventListener("change", (event) => {
    state.filters.sortBy = event.target.value;
    renderPapers();
  });
  els.resetFilters.addEventListener("click", () => {
    state.filters = {
      search: "",
      topic: "",
      modality: "",
      year: "",
      minScore: 0,
      sortBy: "priority",
    };
    els.search.value = "";
    els.topicFilter.value = "";
    els.modalityFilter.value = "";
    els.yearFilter.value = "";
    els.scoreFilter.value = "0";
    els.scoreOutput.value = "0";
    els.sortBy.value = "priority";
    renderPapers();
  });
}

async function init() {
  const response = await fetch("papers.json");
  state.papers = await response.json();
  hydrateFilters();
  renderStats();
  renderTopicMap();
  renderPapers();
  wireEvents();
}

init().catch((error) => {
  els.paperList.innerHTML = `<p>论文数据加载失败：${error.message}</p>`;
});
