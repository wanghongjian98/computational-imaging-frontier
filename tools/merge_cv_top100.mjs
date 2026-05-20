import fs from "node:fs/promises";

const retrieved = "2026-05-20";
const existing = JSON.parse(await fs.readFile("papers.json", "utf8"));
const candidates = JSON.parse(await fs.readFile("cv_top100_candidates.json", "utf8"));

function normalizeTitle(title) {
  return String(title ?? "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

function shortAuthors(authors) {
  const names = authors.filter(Boolean);
  if (names.length <= 3) return names.join(", ");
  return `${names.slice(0, 3).join(", ")} et al.`;
}

function inferTopic(paper) {
  const text = `${paper.title} ${paper.abstract}`.toLowerCase();
  if (/segment anything|language image|visual instruction|vision-language|question answering|gqa|clip|text-to-image/.test(text)) {
    return "Vision-Language / Foundation Models";
  }
  if (/dataset|benchmark|cityscapes|scannet|nuscenes|waymo|ade20k|chestx-ray|ntu rgb|kinetics/.test(text)) {
    return "Datasets / Benchmarks";
  }
  if (/diffusion|gan|generative|image-to-image|stylegan|dreambooth|pix2pix|cyclegan|colorization|style transfer|synthesis|inpainting/.test(text)) {
    return "Generative Vision";
  }
  if (/detect|yolo|detr|focal loss|fcos|efficientdet|bounding box|open-set object/.test(text)) {
    return "Object Detection";
  }
  if (/segmentation|scene parsing|deeplab|psp|refinenet|mask transformer|semantic image/.test(text)) {
    return "Segmentation";
  }
  if (/point cloud|pointnet|3d|depth|optical flow|raft|flownet|structure-from-motion|sdf|occupancy|autonomous driving|lidar/.test(text)) {
    return "3D / Geometry / Driving";
  }
  if (/pose|human|action|video|trajectory|slowfast|vivit/.test(text)) {
    return "Video / Human Understanding";
  }
  if (/face|arcface|sphereface|faceforensics/.test(text)) {
    return "Face & Biometrics";
  }
  if (/super-resolution|restoration|denois|deblur|image quality/.test(text)) {
    return "Image Restoration";
  }
  if (/self-supervised|contrast|moco|masked autoencoder|dino|simsiam|representation learning|cutmix|incremental|jigsaw/.test(text)) {
    return "Representation Learning";
  }
  if (/transformer|convnet|densenet|xception|residual|mobilenet|shufflenet|ghostnet|attention|backbone|architecture|nas/.test(text)) {
    return "Vision Backbones";
  }
  return "General Computer Vision";
}

const topicConfig = {
  "Vision-Language / Foundation Models": {
    modality: "Image-text / foundation model",
    task: "视觉-语言理解、开放词表识别或基础模型适配",
    method: "大规模预训练、多模态对齐或提示式视觉建模",
    open: "如何降低标注和算力成本，同时保持可控性、可解释性和领域泛化。",
  },
  "Datasets / Benchmarks": {
    modality: "Benchmark dataset",
    task: "构建大规模数据集或评测基准",
    method: "数据采集、标注协议和标准化评测任务",
    open: "如何避免数据偏差，并让基准持续反映真实应用需求。",
  },
  "Generative Vision": {
    modality: "Image generation / editing",
    task: "图像生成、编辑、翻译或高保真合成",
    method: "GAN、diffusion、transformer 或条件生成模型",
    open: "如何平衡生成质量、可控性、版权风险和真实任务可靠性。",
  },
  "Object Detection": {
    modality: "RGB / multi-scale visual features",
    task: "目标检测、开放集检测或检测损失设计",
    method: "检测框架、特征金字塔、transformer detector 或检测损失",
    open: "如何在开放世界、长尾类别和实时部署中保持稳定检测性能。",
  },
  Segmentation: {
    modality: "Dense prediction",
    task: "语义分割、实例分割或全景分割",
    method: "密集预测网络、上下文建模或统一分割框架",
    open: "如何在高分辨率、开放类别和低标注条件下保持边界和语义一致。",
  },
  "3D / Geometry / Driving": {
    modality: "3D / depth / optical flow / driving sensors",
    task: "三维理解、几何重建、光流、深度或自动驾驶感知",
    method: "几何约束、点云网络、连续场表示或多传感器数据集",
    open: "如何把真实传感噪声、动态场景和跨域泛化纳入可靠评测。",
  },
  "Video / Human Understanding": {
    modality: "Video / human-centric data",
    task: "视频理解、动作识别、人体姿态或轨迹预测",
    method: "时序建模、人体结构先验或视频 transformer",
    open: "如何在长时序、遮挡和复杂交互下保持鲁棒理解。",
  },
  "Face & Biometrics": {
    modality: "Face imagery",
    task: "人脸识别、表征学习或伪造检测",
    method: "判别式嵌入损失、角度边界或检测网络",
    open: "如何同时处理隐私、公平性、跨域泛化和安全攻击。",
  },
  "Image Restoration": {
    modality: "Image restoration",
    task: "超分辨率、复原、去噪或图像增强",
    method: "感知损失、残差网络、attention 或 transformer 复原模型",
    open: "如何避免过度幻觉，并让复原结果服从真实成像退化。",
  },
  "Representation Learning": {
    modality: "Visual representation",
    task: "自监督、半监督或可迁移视觉表征学习",
    method: "对比学习、掩码建模、数据增强或持续学习",
    open: "如何评估表征的因果性、可迁移性和下游任务稳定性。",
  },
  "Vision Backbones": {
    modality: "Neural architecture",
    task: "视觉骨干网络、注意力模块或高效网络设计",
    method: "CNN、Transformer、注意力、NAS 或轻量化结构",
    open: "如何在算力、延迟、预训练成本和多任务泛化之间取得平衡。",
  },
  "General Computer Vision": {
    modality: "General vision",
    task: "通用视觉识别或视觉学习问题",
    method: "深度视觉模型、损失函数或训练策略",
    open: "如何判断方法在不同任务、数据集和部署条件下的真实有效性。",
  },
};

function codeLink(paper) {
  const text = `${paper.abstract ?? ""} ${paper.url ?? ""}`;
  const match = text.match(/https?:\/\/github\.com\/[^\s)"'<>]+/i);
  if (!match) return { available: false, url: "" };
  return { available: true, url: match[0].replace(/[.,;]+$/, "") };
}

function entryFromCandidate(paper) {
  const topic = inferTopic(paper);
  const config = topicConfig[topic] ?? topicConfig["General Computer Vision"];
  const authors = shortAuthors(paper.authors ?? []);
  const title = paper.title;
  const citationText = Number(paper.citationCount ?? 0).toLocaleString("en-US");
  const link = paper.pdf || paper.url || (paper.doi ? `https://doi.org/${paper.doi}` : "");

  return {
    title,
    authors,
    venue: paper.conference,
    year: paper.year,
    topic,
    modality: config.modality,
    status: "CV 顶会高引 Top 100",
    priority: paper.rank <= 25 ? "High" : "Medium",
    task: config.task,
    method: config.method,
    hardware: "常规视觉数据与公开基准",
    dataset: "见论文实验设置",
    problem: `面向${config.task}，该工作解决 ${topic} 方向中的代表性问题。`,
    contribution: `提出或系统化了 ${title}，并在 ${paper.conference} 系列论文中形成高引用基线。`,
    limitation: "高引用代表历史影响力，不等于当前最优；使用时需要结合后续工作、任务设定和数据偏差判断边界。",
    insight: `${title} 是近十年 CVPR/ECCV/ICCV 高引用代表作，适合作为 ${topic} 方向的入口论文。`,
    whyFollow: `Semantic Scholar 抓取时引用数约 ${citationText}；适合用于梳理近十年计算机视觉主线方法和基准演化。`,
    openQuestion: config.open,
    directionNote: `该方向的高引用工作集中体现了 ${topic} 从方法提出到标准基线的扩散过程。`,
    tags: ["CVPR/ECCV/ICCV", "top-cited", paper.conference, topic],
    code: codeLink(paper),
    url: link,
    updated: retrieved,
    topCitedRank: paper.rank,
    citationCount: Number(paper.citationCount ?? 0),
    citationSource: "Semantic Scholar",
    citationRetrieved: retrieved,
    semanticScholarUrl: paper.url,
    doi: paper.doi,
    arxiv: paper.arxiv,
  };
}

const original = existing.filter((paper) => paper.status !== "CV 顶会高引 Top 100");
const seen = new Set(original.map((paper) => normalizeTitle(paper.title)));
const additions = [];

for (const candidate of candidates) {
  const key = normalizeTitle(candidate.title);
  if (seen.has(key)) continue;
  seen.add(key);
  additions.push(entryFromCandidate(candidate));
}

await fs.writeFile("papers.json", JSON.stringify([...original, ...additions], null, 2) + "\n", "utf8");
console.log(`Merged ${additions.length} CV top-cited papers. Total: ${original.length + additions.length}`);
