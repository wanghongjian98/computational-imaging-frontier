const state = {
  papers: [],
  filters: {
    search: "",
    topic: "",
    modality: "",
    stage: "",
    year: "",
    codeOnly: false,
    sortBy: "citations",
  },
};

const els = {
  search: document.querySelector("#search"),
  topicFilter: document.querySelector("#topicFilter"),
  modalityFilter: document.querySelector("#modalityFilter"),
  stageFilter: document.querySelector("#stageFilter"),
  yearFilter: document.querySelector("#yearFilter"),
  codeOnly: document.querySelector("#codeOnly"),
  sortBy: document.querySelector("#sortBy"),
  resetFilters: document.querySelector("#resetFilters"),
  paperList: document.querySelector("#paperList"),
  resultCount: document.querySelector("#resultCount"),
  paperCount: document.querySelector("#paperCount"),
  topicCount: document.querySelector("#topicCount"),
  highValueCount: document.querySelector("#highValueCount"),
  codeCount: document.querySelector("#codeCount"),
  topicMap: document.querySelector("#topicMap"),
  queueList: document.querySelector("#queueList"),
  frontierLanes: document.querySelector("#frontierLanes"),
  lastUpdated: document.querySelector("#lastUpdated"),
};

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function uniqueSorted(items) {
  return [...new Set(items.filter(Boolean))].sort((a, b) =>
    String(a).localeCompare(String(b), "zh-Hans-CN"),
  );
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
  fillSelect(els.stageFilter, uniqueSorted(state.papers.map((paper) => paper.status)));
  fillSelect(
    els.yearFilter,
    uniqueSorted(state.papers.map((paper) => paper.year)).sort((a, b) => b - a),
  );
}

function hasCode(paper) {
  return Boolean(paper.code?.available && paper.code?.url);
}

function priorityRank(paper) {
  return { High: 3, Medium: 2, Low: 1 }[paper.priority] ?? 0;
}

function citationCount(paper) {
  return Number(paper.citationCount ?? -1);
}

function citationLabel(paper) {
  const count = citationCount(paper);
  if (count < 0) return "";
  const source = paper.citationSource ? ` ${paper.citationSource}` : "";
  return ` · 引用 ${count.toLocaleString("en-US")}${source}`;
}

function matchesPaper(paper) {
  const haystack = [
    paper.title,
    paper.authors,
    paper.venue,
    paper.topic,
    paper.modality,
    paper.task,
    paper.method,
    paper.hardware,
    paper.problem,
    paper.contribution,
    paper.limitation,
    paper.insight,
    paper.whyFollow,
    paper.openQuestion,
    paper.citationCount,
    paper.citationSource,
    ...(paper.tags ?? []),
  ]
    .join(" ")
    .toLowerCase();

  return (
    haystack.includes(state.filters.search.toLowerCase()) &&
    (!state.filters.topic || paper.topic === state.filters.topic) &&
    (!state.filters.modality || paper.modality === state.filters.modality) &&
    (!state.filters.stage || paper.status === state.filters.stage) &&
    (!state.filters.year || String(paper.year) === state.filters.year) &&
    (!state.filters.codeOnly || hasCode(paper))
  );
}

function sortPapers(papers) {
  const key = state.filters.sortBy;
  return [...papers].sort((a, b) => {
    if (key === "citations") {
      return citationCount(b) - citationCount(a) || priorityRank(b) - priorityRank(a) || b.year - a.year;
    }
    if (key === "year") return b.year - a.year || priorityRank(b) - priorityRank(a);
    if (key === "code") {
      return Number(hasCode(b)) - Number(hasCode(a)) || b.year - a.year;
    }
    if (key === "status") {
      return String(a.status ?? "").localeCompare(String(b.status ?? ""), "zh-Hans-CN") || b.year - a.year;
    }
    return priorityRank(b) - priorityRank(a) || b.year - a.year;
  });
}

function badge(text, tone = "") {
  return `<span class="tag ${tone}">${escapeHtml(text)}</span>`;
}

function paperCard(paper) {
  const card = document.createElement("article");
  card.className = "paper-card";
  const tags = [
    paper.topCitedRank ? badge(`Top #${paper.topCitedRank}`, "hot") : "",
    badge(paper.status ?? "未分类", "status"),
    badge(paper.priority ?? "Medium", paper.priority === "High" ? "hot" : ""),
    ...(paper.tags ?? []).map((tag) => badge(tag)),
  ].filter(Boolean).join("");
  const paperLink = paper.url
    ? `<a href="${escapeHtml(paper.url)}" target="_blank" rel="noreferrer">论文</a>`
    : "<span>待补论文链接</span>";
  const codeLink = hasCode(paper)
    ? `<a href="${escapeHtml(paper.code.url)}" target="_blank" rel="noreferrer">代码</a>`
    : "<span>代码待确认</span>";

  card.innerHTML = `
    <div class="paper-top">
      <div>
        <div class="tags">${tags}</div>
        <h3>${escapeHtml(paper.title)}</h3>
        <div class="paper-meta">${escapeHtml(paper.authors)} · ${escapeHtml(paper.venue)} · ${escapeHtml(paper.year)}${escapeHtml(citationLabel(paper))}</div>
      </div>
    </div>

    <p class="insight">${escapeHtml(paper.insight ?? paper.contribution)}</p>

    <div class="detail-grid">
      <div><strong>任务</strong><span>${escapeHtml(paper.task ?? paper.problem)}</span></div>
      <div><strong>方法</strong><span>${escapeHtml(paper.method ?? "待补")}</span></div>
      <div><strong>硬件/数据</strong><span>${escapeHtml(paper.hardware ?? paper.dataset ?? "待补")}</span></div>
      <div><strong>开放问题</strong><span>${escapeHtml(paper.openQuestion ?? paper.limitation)}</span></div>
    </div>

    <div class="summary-grid">
      <div>
        <strong>问题</strong>
        <p>${escapeHtml(paper.problem)}</p>
      </div>
      <div>
        <strong>贡献</strong>
        <p>${escapeHtml(paper.contribution)}</p>
      </div>
      <div>
        <strong>为什么跟进</strong>
        <p>${escapeHtml(paper.whyFollow ?? paper.directionNote)}</p>
      </div>
    </div>
    <div class="paper-actions">
      <span>${escapeHtml(paper.topic)} · ${escapeHtml(paper.modality)}</span>
      <div>${paperLink}${codeLink}</div>
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
  const dates = uniqueSorted(state.papers.map((paper) => paper.updated)).sort();
  els.paperCount.textContent = state.papers.length;
  els.topicCount.textContent = topics.length;
  els.highValueCount.textContent = state.papers.filter((paper) => paper.priority === "High").length;
  els.codeCount.textContent = state.papers.filter(hasCode).length;
  els.lastUpdated.textContent = dates.length ? `Last updated: ${dates.at(-1)}` : "更新中";
}

function renderFrontierLanes() {
  const topicMap = new Map();
  state.papers.forEach((paper) => {
    const group = topicMap.get(paper.topic) ?? [];
    group.push(paper);
    topicMap.set(paper.topic, group);
  });

  const nodes = [...topicMap.entries()]
    .map(([topic, papers]) => {
      const sorted = sortPapers(papers);
      const topPaper = sorted[0];
      const node = document.createElement("article");
      node.className = "frontier-card";
      node.innerHTML = `
        <span>${papers.length} papers</span>
        <h3>${escapeHtml(topic)}</h3>
        <p>${escapeHtml(topPaper?.directionNote ?? "补充该方向的核心问题、代表方法和开放挑战。")}</p>
        <strong>代表条目：${escapeHtml(topPaper?.title ?? "待补")}</strong>
      `;
      return node;
    })
    .slice(0, 6);

  els.frontierLanes.replaceChildren(...nodes);
}

function renderTopicMap() {
  const topics = uniqueSorted(state.papers.map((paper) => paper.topic));
  const nodes = topics.map((topic) => {
    const papers = state.papers.filter((paper) => paper.topic === topic);
    const topPaper = sortPapers(papers)[0];
    const node = document.createElement("article");
    node.className = "topic-node";
    node.innerHTML = `
      <h3>${escapeHtml(topic)}</h3>
      <p>${escapeHtml(topPaper?.directionNote ?? "补充该方向的核心问题、代表方法和开放挑战。")}</p>
      <span>${papers.length} 篇论文 · 重点跟进 ${papers.filter((paper) => paper.priority === "High").length}</span>
    `;
    return node;
  });
  els.topicMap.replaceChildren(...nodes);
}

function renderQueue() {
  const queue = sortPapers(state.papers)
    .filter((paper) => paper.priority === "High")
    .slice(0, 5)
    .map((paper, index) => {
      const item = document.createElement("article");
      item.className = "queue-item";
      item.innerHTML = `
        <span>${index + 1}</span>
        <div>
          <h3>${escapeHtml(paper.title)}</h3>
          <p>${escapeHtml(paper.whyFollow ?? paper.insight ?? paper.contribution)}</p>
        </div>
        <strong>${escapeHtml(paper.priority ?? "High")}</strong>
      `;
      return item;
    });

  els.queueList.replaceChildren(...queue);
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
  els.stageFilter.addEventListener("change", (event) => {
    state.filters.stage = event.target.value;
    renderPapers();
  });
  els.yearFilter.addEventListener("change", (event) => {
    state.filters.year = event.target.value;
    renderPapers();
  });
  els.codeOnly.addEventListener("change", (event) => {
    state.filters.codeOnly = event.target.checked;
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
      stage: "",
      year: "",
      codeOnly: false,
      sortBy: "citations",
    };
    els.search.value = "";
    els.topicFilter.value = "";
    els.modalityFilter.value = "";
    els.stageFilter.value = "";
    els.yearFilter.value = "";
    els.codeOnly.checked = false;
    els.sortBy.value = "citations";
    renderPapers();
  });
}

async function init() {
  const response = await fetch("papers.json", { cache: "no-store" });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  state.papers = await response.json();
  hydrateFilters();
  renderStats();
  renderFrontierLanes();
  renderQueue();
  renderTopicMap();
  renderPapers();
  wireEvents();
}

init().catch((error) => {
  els.paperList.innerHTML = `<p class="empty">论文数据加载失败：${escapeHtml(error.message)}。如果你是直接双击打开 HTML，请用 GitHub Pages 或本地静态服务器访问。</p>`;
});
