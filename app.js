const READ_STORAGE_KEY = "computational-imaging-frontier-read-v1";

const state = {
  papers: [],
  readKeys: new Set(),
  filters: {
    search: "",
    topic: "",
    modality: "",
    stage: "",
    year: "",
    codeOnly: false,
    unreadOnly: false,
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
  unreadOnly: document.querySelector("#unreadOnly"),
  sortBy: document.querySelector("#sortBy"),
  resetFilters: document.querySelector("#resetFilters"),
  paperList: document.querySelector("#paperList"),
  resultCount: document.querySelector("#resultCount"),
  paperCount: document.querySelector("#paperCount"),
  topicCount: document.querySelector("#topicCount"),
  highValueCount: document.querySelector("#highValueCount"),
  codeCount: document.querySelector("#codeCount"),
  readCount: document.querySelector("#readCount"),
  topicMap: document.querySelector("#topicMap"),
  queueList: document.querySelector("#queueList"),
  frontierLanes: document.querySelector("#frontierLanes"),
  lastUpdated: document.querySelector("#lastUpdated"),
  awardList: document.querySelector("#awardList"),
  awardCount: document.querySelector("#awardCount"),
};

function loadReadKeys() {
  try {
    return new Set(JSON.parse(localStorage.getItem(READ_STORAGE_KEY) ?? "[]"));
  } catch {
    return new Set();
  }
}

function saveReadKeys() {
  try {
    localStorage.setItem(READ_STORAGE_KEY, JSON.stringify([...state.readKeys]));
  } catch {
    // Reading progress is a convenience feature; keep the UI usable if storage is blocked.
  }
}

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

function paperKey(paper) {
  return [paper.title, paper.year, paper.venue]
    .map((part) =>
      String(part ?? "")
        .toLowerCase()
        .replace(/[^\p{L}\p{N}]+/gu, "-")
        .replace(/^-|-$/g, ""),
    )
    .filter(Boolean)
    .join("|");
}

function isRead(paper) {
  return state.readKeys.has(paperKey(paper));
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
    paper.abstract,
    paper.summary,
    paper.motivation,
    paper.implementation,
    paper.application,
    paper.applicationDirection,
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
    (!state.filters.codeOnly || hasCode(paper)) &&
    (!state.filters.unreadOnly || !isRead(paper))
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

function awardBadges(paper) {
  return (paper.awards ?? [])
    .map((award) => badge(`${award.conference} ${award.year} ${award.award}`, "award"))
    .join("");
}

function paperSummary(paper) {
  return {
    abstract: paper.abstract ?? paper.summary ?? paper.insight ?? paper.contribution,
    conclusion:
      paper.conclusion ??
      paper.takeaway ??
      paper.finalTakeaway ??
      paper.directionNote ??
      paper.whyFollow ??
      paper.limitation ??
      "",
  };
}

function paperCard(paper) {
  const card = document.createElement("article");
  const read = isRead(paper);
  card.className = `paper-card${read ? " read" : ""}`;
  const summary = paperSummary(paper);
  const tags = [
    read ? badge("已读", "read") : "",
    paper.topCitedRank ? badge(`Top #${paper.topCitedRank}`, "hot") : "",
    awardBadges(paper),
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

    <div class="paper-text-block">
      <strong>Abstract</strong>
      <p>${escapeHtml(summary.abstract)}</p>
    </div>

    <div class="detail-grid">
      <div><strong>任务</strong><span>${escapeHtml(paper.task ?? paper.problem)}</span></div>
      <div><strong>方法</strong><span>${escapeHtml(paper.method ?? "待补")}</span></div>
      <div><strong>硬件/数据</strong><span>${escapeHtml(paper.hardware ?? paper.dataset ?? "待补")}</span></div>
      <div><strong>开放问题</strong><span>${escapeHtml(paper.openQuestion ?? paper.limitation)}</span></div>
    </div>

    ${summary.conclusion ? `
      <div class="paper-text-block conclusion">
        <strong>Conclusion / Takeaway</strong>
        <p>${escapeHtml(summary.conclusion)}</p>
      </div>
    ` : ""}
    <div class="paper-actions">
      <span>${escapeHtml(paper.topic)} · ${escapeHtml(paper.modality)}</span>
      <div>
        <button class="read-toggle" type="button" data-paper-key="${escapeHtml(paperKey(paper))}" aria-pressed="${read}">
          ${read ? "取消已读" : "标记已读"}
        </button>
        ${paperLink}${codeLink}
      </div>
    </div>
  `;
  return card;
}

function renderAwards() {
  const awardPapers = state.papers
    .filter((paper) => paper.awards?.length)
    .sort((a, b) => {
      const awardA = a.awards[0];
      const awardB = b.awards[0];
      return awardB.year - awardA.year || String(awardA.conference).localeCompare(awardB.conference);
    });

  els.awardCount.textContent = `${awardPapers.length} 篇`;
  const nodes = awardPapers.map((paper) => {
    const node = document.createElement("article");
    node.className = "award-card";
    const awards = (paper.awards ?? [])
      .map((award) => `${award.conference} ${award.year} · ${award.award}`)
      .join(" / ");
    node.innerHTML = `
      <div>
        <span>${escapeHtml(awards)}</span>
        <h3>${escapeHtml(paper.title)}</h3>
        <p>${escapeHtml(paper.authors)}</p>
      </div>
      <strong>${escapeHtml(paper.topic)}</strong>
    `;
    return node;
  });
  els.awardList.replaceChildren(...nodes);
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
  els.readCount.textContent = state.papers.filter(isRead).length;
  els.lastUpdated.textContent = dates.length ? `Last updated: ${dates.at(-1)}` : "更新中";
}

function renderFrontierLanes() {
  const lanes = [
    {
      title: "Lensless / Coded Imaging",
      topics: ["Lensless Imaging", "Compressive Imaging"],
      note: "关注光学编码、PSF 标定、压缩采样、可制造性和端到端重建。",
    },
    {
      title: "Neural Radiance Fields",
      topics: ["Neural Radiance Fields"],
      note: "关注连续神经场、稀疏视角、动态场景、物理成像模型和可编辑三维表示。",
    },
    {
      title: "3D Gaussian Splatting",
      topics: ["3D Gaussian Splatting"],
      note: "关注显式 Gaussian 表示、实时渲染、可微 splatting、动态场景和物理成像观测。",
    },
    {
      title: "Diffusion Priors for Inverse Problems",
      topics: ["Diffusion Priors", "Plug-and-Play Priors", "Implicit Priors"],
      note: "关注生成先验、measurement consistency、后验采样、快速求解和可信不确定性。",
    },
    {
      title: "Computational Microscopy",
      topics: ["Computational Microscopy"],
      note: "关注相位恢复、多角度照明、高通量显微、系统校正和厚样本建模。",
    },
    {
      title: "Event / Computational Sensors",
      topics: ["Event-based Imaging", "Low-light Computational Photography", "Computational Displays"],
      note: "关注异步传感、raw pipeline、低光噪声模型、硬件闭环和真实系统误差。",
    },
  ];

  const nodes = lanes
    .map((lane) => {
      const papers = state.papers.filter((paper) => lane.topics.includes(paper.topic));
      if (!papers.length) return null;
      const topPaper = sortPapers(papers)[0];
      const node = document.createElement("article");
      node.className = "frontier-card";
      node.innerHTML = `
        <span>${papers.length} papers</span>
        <h3>${escapeHtml(lane.title)}</h3>
        <p>${escapeHtml(lane.note)}</p>
        <strong>代表条目：${escapeHtml(topPaper?.title ?? "待补")}</strong>
      `;
      return node;
    })
    .filter(Boolean);

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
  els.unreadOnly.addEventListener("change", (event) => {
    state.filters.unreadOnly = event.target.checked;
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
      unreadOnly: false,
      sortBy: "citations",
    };
    els.search.value = "";
    els.topicFilter.value = "";
    els.modalityFilter.value = "";
    els.stageFilter.value = "";
    els.yearFilter.value = "";
    els.codeOnly.checked = false;
    els.unreadOnly.checked = false;
    els.sortBy.value = "citations";
    renderPapers();
  });
  els.paperList.addEventListener("click", (event) => {
    const button = event.target.closest(".read-toggle");
    if (!button) return;
    const key = button.dataset.paperKey;
    if (state.readKeys.has(key)) {
      state.readKeys.delete(key);
    } else {
      state.readKeys.add(key);
    }
    saveReadKeys();
    renderStats();
    renderPapers();
  });
}

async function init() {
  state.readKeys = loadReadKeys();
  const response = await fetch("papers.json", { cache: "no-store" });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  state.papers = await response.json();
  hydrateFilters();
  renderStats();
  renderAwards();
  renderFrontierLanes();
  renderQueue();
  renderTopicMap();
  renderPapers();
  wireEvents();
}

init().catch((error) => {
  els.paperList.innerHTML = `<p class="empty">论文数据加载失败：${escapeHtml(error.message)}。如果你是直接双击打开 HTML，请用 GitHub Pages 或本地静态服务器访问。</p>`;
});
