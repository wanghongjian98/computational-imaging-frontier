import fs from "node:fs/promises";

const retrieved = "2026-05-22";
const sourceUrl = "https://www.thecvf.com/?page_id=413";
const withMetadata = process.argv.includes("--with-metadata");

const awards = [
  ["CVPR", 2025, "Best Paper", "VGGT: Visual Geometry Grounded Transformer", "Jianyuan Wang, Minghao Chen, Nikita Karaev, Andrea Vedaldi, Christian Rupprecht, David Novotny"],
  ["CVPR", 2025, "Best Student Paper", "Neural Inverse Rendering from Propagating Light", "Anagh Malik, Benjamin Attal, Andrew Xie, Matthew O'Toole, David B. Lindell"],
  ["CVPR", 2025, "Honorable Mention", "MegaSaM: Accurate, Fast and Robust Structure and Motion from Casual Dynamic Videos", "Zhengqi Li, Richard Tucker, Forrester Cole, Qianqian Wang, Linyi Jin, Vickie Ye, Angjoo Kanazawa, Aleksander Holynski, Noah Snavely"],
  ["CVPR", 2025, "Honorable Mention", "Navigation World Models", "Amir Bar, Gaoyue Zhou, Danny Tran, Trevor Darrell, Yann LeCun"],
  ["CVPR", 2025, "Honorable Mention", "Molmo and PixMo: Open Weights and Open Data for State-of-the-Art Vision-Language Models", "Matt Deitke et al."],
  ["CVPR", 2025, "Honorable Mention", "3D Student Splatting and Scooping", "Jialin Zhu, Jiangbei Yue, Feixiang He, He Wang"],
  ["CVPR", 2025, "Honorable Mention", "Generative Multimodal Pretraining with Discrete Diffusion Timestep Tokens", "Kaihang Pan, Wang Lin, Zhongqi Yue, Tenglong Ao, Liyu Jia, Wei Zhao, Juncheng Li, Siliang Tang, Hanwang Zhang"],
  ["CVPR", 2024, "Best Paper", "Rich Human Feedback for Text-to-Image Generation", "Youwei Liang, Junfeng He, Gang Li, Peizhao Li, Arseniy Klimovskiy, Nicholas Carolan, Jiao Sun, Jordi Pont-Tuset, Sarah Young, Feng Yang, Junjie Ke, Krishnamurthy Dj Dvijotham, Katherine M. Collins, Yiwen Luo, Yang Li, Kai J. Kohlhoff, Deepak Ramachandran, Vidhya Navalpakkam"],
  ["CVPR", 2024, "Best Paper", "Generative Image Dynamics", "Zhengqi Li, Richard Tucker, Noah Snavely, Aleksander Holynski"],
  ["CVPR", 2024, "Best Student Paper", "BioCLIP: A Vision Foundation Model for the Tree of Life", "Samuel Stevens, Jiaman Wu, Matthew J. Thompson, Elizabeth G. Campolongo, Connor H. Song, David E. Carlyn, Li Dong, Wasila M. Dahdul, Charles Stewart, Tanya Berger-Wolf, Wei-Lun Chao, Yu Su"],
  ["CVPR", 2024, "Best Student Paper", "Mip-Splatting: Alias-free 3D Gaussian Splatting", "Zehao Yu, Anpei Chen, Binbin Huang, Torsten Sattler, Andreas Geiger"],
  ["CVPR", 2024, "Honorable Mention", "pixelSplat: 3D Gaussian Splats from Image Pairs for Scalable Generalizable 3D Reconstruction", "David Charatan, Sizhe Li, Andrea Tagliasacchi, Vincent Sitzmann"],
  ["CVPR", 2024, "Honorable Mention", "EventPS: Real-Time Photometric Stereo Using an Event Camera", "Boxin Yu, Jie Ren, Jiaying Han, Feng Wang, Boxin Shi"],
  ["CVPR", 2024, "Honorable Mention", "Comparing the Decision-Making Mechanisms by Transformers and CNNs via Explanation Methods", "Mingyu Jiang, Sara Khorram, Fuxin Li"],
  ["CVPR", 2024, "Honorable Mention", "Objects as Volumes: A Stochastic Geometry View of Opaque Solids", "Bailey Miller, Hsueh-Ti Derek Liu Chen, I-Chao Shen, Ioannis Gkioulekas"],
  ["CVPR", 2024, "Honorable Mention", "Image Processing GNN: Breaking Rigidity in Super-Resolution", "Yuechen Tian, Hanting Chen, Chao Xu, Yunhe Wang"],
  ["CVPR", 2024, "Honorable Mention", "SpiderMatch: 3D Shape Matching with Global Optimality and Geometric Consistency", "Paul Roetzer, Florian Bernard"],
  ["CVPR", 2023, "Best Paper", "Visual Programming: Compositional Visual Reasoning Without Training", "Tanmay Gupta, Aniruddha Kembhavi"],
  ["CVPR", 2023, "Best Paper", "Planning-Oriented Autonomous Driving", "Yihan Hu, Jiazhi Yang, Li Chen, Keyu Li, Chonghao Sima, Xizhou Zhu, Siqi Chai, Senyao Du, Tianwei Lin, Wenhai Wang, Lewei Lu, Xiaosong Jia, Qiang Liu, Jifeng Dai, Yu Qiao, Hongyang Li"],
  ["CVPR", 2023, "Best Student Paper", "3D Registration With Maximal Cliques", "Xiyue Zhang, Jiaqi Yang, Shikun Zhang, Yanning Zhang"],
  ["CVPR", 2023, "Honorable Mention", "DreamBooth: Fine Tuning Text-to-Image Diffusion Models for Subject-Driven Generation", "Nataniel Ruiz, Yuanzhen Li, Varun Jampani, Yael Pritch, Michael Rubinstein, Kfir Aberman"],
  ["CVPR", 2023, "Honorable Mention", "DynIBaR: Neural Dynamic Image-Based Rendering", "Zhengqi Li, Qianqian Wang, Forrester Cole, Richard Tucker, Noah Snavely"],
  ["CVPR", 2022, "Best Paper", "Learning to Solve Hard Minimal Problems", "Petr Hruby, Timothy Duff, Anton Leykin, Tomas Pajdla"],
  ["CVPR", 2022, "Best Student Paper", "EPro-PnP: Generalized End-to-End Probabilistic Perspective-n-Points for Monocular Object Pose Estimation", "Hansheng Chen, Pichao Wang, Fan Wang, Tianyu Wang, Liwei Xiong, Hao Li"],
  ["CVPR", 2022, "Honorable Mention", "Dual-Shutter Optical Vibration Sensing", "Mark Sheinin, David Chan, Matthew O'Toole, Srinivasa Narasimhan"],
  ["CVPR", 2022, "Honorable Mention", "Ref-NeRF: Structured View-Dependent Appearance for Neural Radiance Fields", "Dor Verbin, Peter Hedman, Ben Mildenhall, Todd Zickler, Jonathan T. Barron, Pratul P. Srinivasan"],
  ["CVPR", 2021, "Best Paper", "GIRAFFE: Representing Scenes as Compositional Generative Neural Feature Fields", "Michael Niemeyer, Andreas Geiger"],
  ["CVPR", 2021, "Best Student Paper", "Task Programming: Learning Data Efficient Behavior Representations", "Jennifer J. Sun, Ann Kennedy, Eric Zhan, David J. Anderson, Yisong Yue, Pietro Perona"],
  ["CVPR", 2021, "Honorable Mention", "Exploring Simple Siamese Representation Learning", "Xinlei Chen, Kaiming He"],
  ["CVPR", 2021, "Honorable Mention", "Learning High Fidelity Depths of Dressed Humans by Watching Social Media Dance Videos", "Yasamin Jafarian, Hyun Soo Park"],
  ["CVPR", 2021, "Honorable Mention", "Less is More: ClipBERT for Video-and-Language Learning via Sparse Sampling", "Jie Lei, Linjie Li, Luowei Zhou, Zhe Gan, Tamara L. Berg, Mohit Bansal, Jingjing Liu"],
  ["CVPR", 2021, "Honorable Mention", "Binary TTC: A Temporal Geofence for Autonomous Navigation", "Abhishek Badki, Orazio Gallo, Jan Kautz, Pradeep Sen"],
  ["CVPR", 2021, "Honorable Mention", "Real-Time High-Resolution Background Matting", "Shanchuan Lin, Andrey Ryabtsev, Soumyadip Sengupta, Brian Curless, Steve Seitz, Ira Kemelmacher-Shlizerman"],
  ["CVPR", 2020, "Best Paper", "Unsupervised Learning of Probably Symmetric Deformable 3D Objects from Images in the Wild", "Shangzhe Wu, Christian Rupprecht, Andrea Vedaldi"],
  ["CVPR", 2020, "Best Student Paper", "BSP-Net: Generating Compact Meshes via Binary Space Partitioning", "Zhiqin Chen, Andrea Tagliasacchi, Hao Zhang"],
  ["CVPR", 2020, "Honorable Mention", "DeepCap: Monocular Human Performance Capture Using Weak Supervision", "Marc Habermann, Weipeng Xu, Michael Zollhoefer, Gerard Pons-Moll, Christian Theobalt"],
  ["CVPR", 2019, "Best Paper", "A Theory of Fermat Paths for Non-Line-of-Sight Shape Reconstruction", "Shumian Xin, Sotiris Nousias, Kiriakos N. Kutulakos, Achuta Kadambi, Srinivasa G. Narasimhan, Ioannis Gkioulekas"],
  ["CVPR", 2019, "Best Student Paper", "Reinforced Cross-Modal Matching and Self-Supervised Imitation Learning for Vision-Language Navigation", "Xin Wang, Qiuyuan Huang, Asli Celikyilmaz, Jianfeng Gao, Dinghan Shen, Yuan-Fang Wang, William Yang Wang, Lei Zhang"],
  ["CVPR", 2019, "Honorable Mention", "A Style-Based Generator Architecture for Generative Adversarial Networks", "Tero Karras, Samuli Laine, Timo Aila"],
  ["CVPR", 2019, "Honorable Mention", "Learning the Depths of Moving People by Watching Frozen People", "Zhengqi Li, Tali Dekel, Forrester Cole, Richard Tucker, Ce Liu, William T. Freeman, Noah Snavely"],
  ["CVPR", 2018, "Best Paper", "Taskonomy: Disentangling Task Transfer Learning", "Amir R. Zamir, Alexander Sax, William Shen, Leonidas J. Guibas, Jitendra Malik, Silvio Savarese"],
  ["CVPR", 2018, "Best Student Paper", "Total Capture: A 3D Deformation Model for Tracking Faces, Hands, and Bodies", "Hanbyul Joo, Tomas Simon, Yaser Sheikh"],
  ["CVPR", 2018, "Honorable Mention", "Deep Learning of Graph Matching", "Andrei Zanfir, Cristian Sminchisescu"],
  ["CVPR", 2018, "Honorable Mention", "SPLATNet: Sparse Lattice Networks for Point Cloud Processing", "Hang Su, Varun Jampani, Deqing Sun, Subhransu Maji, Evangelos Kalogerakis, Ming-Hsuan Yang, Jan Kautz"],
  ["CVPR", 2018, "Honorable Mention", "CodeSLAM: Learning a Compact, Optimisable Representation for Dense Visual SLAM", "Michael Bloesch, Jan Czarnowski, Ronald Clark, Stefan Leutenegger, Andrew J. Davison"],
  ["CVPR", 2018, "Honorable Mention", "Efficient Optimization for Rank-Based Loss Functions", "Pranay Mohapatra, Michael Rolinek, C. V. Jawahar, Vladimir Kolmogorov, M. Pawan Kumar"],
  ["CVPR", 2017, "Best Paper", "Densely Connected Convolutional Networks", "Gao Huang, Zhuang Liu, Laurens van der Maaten, Kilian Q. Weinberger"],
  ["CVPR", 2017, "Best Paper", "Learning from Simulated and Unsupervised Images through Adversarial Training", "Ashish Shrivastava, Tomas Pfister, Oncel Tuzel, Joshua Susskind, Wenda Wang, Russ Webb"],
  ["CVPR", 2017, "Best Student Paper", "Computational Imaging on the Electric Grid", "Mark Sheinin, Yoav Y. Schechner, Kiriakos N. Kutulakos"],
  ["CVPR", 2017, "Honorable Mention", "Annotating Object Instances with a Polygon-RNN", "Lluis Castrejon, Kaustav Kundu, Raquel Urtasun, Sanja Fidler"],
  ["CVPR", 2017, "Honorable Mention", "YOLO9000: Better, Faster, Stronger", "Joseph Redmon, Ali Farhadi"],
  ["CVPR", 2016, "Best Paper", "Deep Residual Learning for Image Recognition", "Kaiming He, Xiangyu Zhang, Shaoqing Ren, Jian Sun"],
  ["CVPR", 2016, "Best Student Paper", "Structural-RNN: Deep Learning on Spatio-Temporal Graphs", "Ashesh Jain, Amir R. Zamir, Silvio Savarese, Ashutosh Saxena"],
  ["CVPR", 2016, "Honorable Mention", "Sublabel-Accurate Relaxation of Nonconvex Energies", "Thomas Moellenhoff, Evgeny Laude, Michael Moeller, Jan Lellmann, Daniel Cremers"],
  ["ICCV", 2025, "Best Paper", "Generating Physically Stable and Buildable Brick Structures from Text", "Aaron Pun, Kangxue Deng, Ruoshi Liu, Deva Ramanan, C. Karen Liu, Jun-Yan Zhu"],
  ["ICCV", 2025, "Best Student Paper", "FlowEdit: Inversion-Free Text-Based Editing Using Pre-Trained Flow Models", "Vladimir Kulikov, Matan Kleiner, Inbar Huberman-Spiegelglas, Tomer Michaeli"],
  ["ICCV", 2025, "Honorable Mention", "Spatially-Varying Autofocus", "Yuqian Qin, Aswin C. Sankaranarayanan, Matthew O'Toole"],
  ["ICCV", 2025, "Honorable Mention", "RayZer: A Self-supervised Large View Synthesis Model", "Hanwen Jiang, Hao Tan, Peng Wang, Haimin Jin, Yao Zhao, Sai Bi, Kai Zhang, Fujun Luan, Kalyan Sunkavalli, Qixing Huang, Georgios Pavlakos"],
  ["ICCV", 2023, "Best Paper", "Passive Ultra-Wideband Single-Photon Imaging", "Muyang Wei, Sotiris Nousias, Rahul Gulve, David B. Lindell, Kiriakos N. Kutulakos"],
  ["ICCV", 2023, "Best Paper", "Adding Conditional Control to Text-to-Image Diffusion Models", "Lvmin Zhang, Anyi Rao, Maneesh Agrawala"],
  ["ICCV", 2023, "Best Student Paper", "Tracking Everything Everywhere All at Once", "Qianqian Wang, Yen-Yu Chang, Ruojin Cai, Zhengqi Li, Bharath Hariharan, Aleksander Holynski, Noah Snavely"],
  ["ICCV", 2023, "Honorable Mention", "Segment Anything", "Alexander Kirillov, Eric Mintun, Nikhila Ravi, Hanzi Mao, Chloe Rolland, Laura Gustafson, Tete Xiao, Spencer Whitehead, Alexander C. Berg, Wan-Yen Lo, Piotr Dollar, Ross Girshick"],
  ["ICCV", 2021, "Best Paper", "Swin Transformer: Hierarchical Vision Transformer using Shifted Windows", "Ze Liu, Yutong Lin, Yue Cao, Han Hu, Yixuan Wei, Zheng Zhang, Stephen Lin, Baining Guo"],
  ["ICCV", 2021, "Best Student Paper", "Pixel-Perfect Structure-from-Motion with Featuremetric Refinement", "Philipp Lindenberger, Paul-Edouard Sarlin, Viktor Larsson, Marc Pollefeys"],
  ["ICCV", 2021, "Honorable Mention", "Mip-NeRF: A Multiscale Representation for Anti-Aliasing Neural Radiance Fields", "Jonathan T. Barron, Ben Mildenhall, Matthew Tancik, Peter Hedman, Ricardo Martin-Brualla, Pratul P. Srinivasan"],
  ["ICCV", 2021, "Honorable Mention", "OpenGAN: Open-Set Recognition via Open Data Generation", "Shu Kong, Deva Ramanan"],
  ["ICCV", 2021, "Honorable Mention", "Viewing Graph Solvability via Cycle Consistency", "Federica Arrigoni, Andrea Fusiello, Elisa Ricci, Tomas Pajdla"],
  ["ICCV", 2021, "Honorable Mention", "Common Objects in 3D: Large-Scale Learning and Evaluation of Real-life 3D Category Reconstruction", "Jeremy Reizenstein, Roman Shapovalov, Philipp Henzler, Luca Sbordone, Patrick Labatut, David Novotny"],
  ["ICCV", 2019, "Best Paper", "SinGAN: Learning a Generative Model from a Single Natural Image", "Tamar Rott Shaham, Tali Dekel, Tomer Michaeli"],
  ["ICCV", 2019, "Best Student Paper", "PLMP: Point-Line Minimal Problems in Complete Multi-View Visibility", "Timothy Duff, Kathlen Kohn, Anton Leykin, Tomas Pajdla"],
  ["ICCV", 2019, "Honorable Mention", "Asynchronous Single-Photon 3D Imaging", "Anant Gupta, Atul Ingle, Mohit Gupta"],
  ["ICCV", 2019, "Honorable Mention", "Specifying Object Attributes and Relations in Interactive Scene Generation", "Oron Ashual, Lior Wolf"],
  ["ICCV", 2017, "Best Paper", "Mask R-CNN", "Kaiming He, Georgia Gkioxari, Piotr Dollar, Ross Girshick"],
  ["ICCV", 2017, "Best Student Paper", "Focal Loss for Dense Object Detection", "Tsung-Yi Lin, Priya Goyal, Ross Girshick, Kaiming He, Piotr Dollar"],
  ["ICCV", 2017, "Honorable Mention", "First Person Activity Forecasting with Online Inverse Reinforcement Learning", "Nicholas Rhinehart, Kris M. Kitani"],
  ["ICCV", 2017, "Honorable Mention", "Open Set Domain Adaptation", "Pau Panareda Busto, Juergen Gall"],
  ["ICCV", 2017, "Honorable Mention", "Globally-Optimal Inlier Set Maximisation for Simultaneous Camera Pose and Feature Correspondence", "Dylan Campbell, Lars Petersson, Laurent Kneip, Hongdong Li"],
  ["ECCV", 2024, "Best Paper", "Minimalist Vision with Freeform Pixels", "Jeremy Klotz, Shree Nayar"],
  ["ECCV", 2024, "Honorable Mention", "Rasterized Edge Gradients: Handling Discontinuities Differentially", "Stanislav Pidhorskyi, Tomas Simon, Gabriel Schwartz, He Wen, Yaser Sheikh, Jason Saragih"],
  ["ECCV", 2024, "Honorable Mention", "Concept Arithmetics for Circumventing Concept Inhibition in Diffusion Models", "Vitali Petsiuk, Kate Saenko"],
  ["ECCV", 2022, "Best Paper", "On the Versatile Uses of Partial Distance Correlation in Deep Learning", "Xinghao Zhen, Zhun Deng, Rudrasis Chakraborty, Vikas Singh"],
  ["ECCV", 2022, "Honorable Mention", "Pose-NDF: Modeling Human Pose Manifolds with Neural Distance Fields", "Garvita Tiwari, Nikolaos Sarafianos, Tony Tung, Gerard Pons-Moll"],
  ["ECCV", 2022, "Honorable Mention", "A Level Set Theory for Neural Implicit Evolution under Explicit Flows", "Ishit Mehta, Manmohan Chandraker, Ravi Ramamoorthi"],
  ["ECCV", 2020, "Best Paper", "RAFT: Recurrent All-Pairs Field Transforms for Optical Flow", "Zachary Teed, Jia Deng"],
  ["ECCV", 2020, "Honorable Mention", "Towards Streaming Perception", "Mengtian Li, Yu-Xiong Wang, Deva Ramanan"],
  ["ECCV", 2020, "Honorable Mention", "NeRF: Representing Scenes as Neural Radiance Fields for View Synthesis", "Ben Mildenhall, Pratul P. Srinivasan, Matthew Tancik, Jonathan T. Barron, Ravi Ramamoorthi, Ren Ng"],
  ["ECCV", 2018, "Best Paper", "Implicit 3D Orientation Learning for 6D Object Detection from RGB Images", "Martin Sundermeyer, Zoltan-Csaba Marton, Maximilian Durner, Manuel Brucker, Rudolph Triebel"],
  ["ECCV", 2018, "Honorable Mention", "Group Normalization", "Yuxin Wu, Kaiming He"],
  ["ECCV", 2018, "Honorable Mention", "GANimation: Anatomically-aware Facial Animation from a Single Image", "Albert Pumarola, Antonio Agudo, Aleix M. Martinez, Alberto Sanfeliu, Francesc Moreno-Noguer"],
  ["ECCV", 2016, "Best Paper", "Real-Time 3D Reconstruction and 6-DoF Tracking with an Event Camera", "Hanme Kim, Stefan Leutenegger, Andrew J. Davison"],
  ["ECCV", 2016, "Honorable Mention", "The Fast Bilateral Solver", "Jonathan T. Barron, Ben Poole"],
].map(([conference, year, award, title, authors]) => ({ conference, year, award, title, authors }));

const topicRules = [
  [/radiance|nerf|splat|3d|sfm|slam|geometry|pose|depth|reconstruction|view|brick|mesh|structure|motion/i, "3D / Geometry / Reconstruction"],
  [/diffusion|text-to-image|generation|generative|gan|style|image dynamics|multimodal pretraining/i, "Generative Vision"],
  [/detection|rcnn|yolo|object/i, "Object Detection"],
  [/segmentation|matting|edge|scene parsing/i, "Segmentation"],
  [/video|trajectory|activity|navigation|autonomous driving|streaming/i, "Video / Embodied Perception"],
  [/transformer|resnet|densenet|normalization|representation|backbone/i, "Vision Backbones"],
  [/event|computational imaging|single-photon|inverse rendering|autofocus|optical|vibration/i, "Computational Imaging"],
  [/language|visual programming|vision-language|molmo|pixmo|bioclip|foundation/i, "Vision-Language / Foundation Models"],
];

function normalizeTitle(title) {
  return String(title ?? "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

function inferTopic(title, abstract = "") {
  const text = `${title} ${abstract}`;
  return topicRules.find(([pattern]) => pattern.test(text))?.[1] ?? "Award-Winning Computer Vision";
}

function splitSentences(text) {
  return String(text ?? "")
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function pickSentence(sentences, patterns, fallbackIndex = 0, excluded = new Set()) {
  const available = sentences.filter((sentence) => !excluded.has(sentence));
  return available.find((sentence) => patterns.some((pattern) => pattern.test(sentence))) ?? available[fallbackIndex] ?? "";
}

function concise(text, maxLength = 360) {
  const normalized = String(text ?? "").replace(/\s+/g, " ").trim();
  if (!normalized) return "";
  return normalized.length <= maxLength ? normalized : `${normalized.slice(0, maxLength - 1).trim()}…`;
}

function summarize(paper, title) {
  const sentences = splitSentences(paper.abstract);
  const motivation = pickSentence(sentences, [/\b(challenge|problem|difficult|limitation|bottleneck|need|requires|however|although|despite)\b/i], 0);
  const used = new Set(motivation ? [motivation] : []);
  const implementation = pickSentence(sentences, [/\b(we propose|we present|we introduce|we develop|we design|to address|method|framework|network|model|algorithm|loss|dataset)\b/i], 1, used);
  if (implementation) used.add(implementation);
  const application = pickSentence(sentences, [/\b(evaluate|experiments|tasks?|applications?|benchmark|dataset|ImageNet|COCO|KITTI|ADE20K|object|scene|video|image)\b/i], 2, used);
  return {
    abstract: concise(paper.abstract || `${title} is an award-winning computer vision paper.`),
    motivation: concise(motivation || `${title} targets a central problem recognized by the conference awards committee.`),
    implementation: concise(implementation || `${title} introduces a method or system selected as award-winning work.`),
    application: concise(application || `${title} is relevant to its conference track and downstream computer vision applications.`),
  };
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchSemanticScholar(title) {
  const url = new URL("https://api.semanticscholar.org/graph/v1/paper/search");
  url.searchParams.set("query", title);
  url.searchParams.set("limit", "1");
  url.searchParams.set("fields", "title,authors,year,venue,citationCount,abstract,url,externalIds,openAccessPdf");
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const response = await fetch(url, { headers: { "User-Agent": "computational-imaging-frontier/1.0" } });
    if (response.ok) return (await response.json()).data?.[0] ?? {};
    if (response.status !== 429) {
      console.warn(`Semantic Scholar ${response.status}: ${title}`);
      return {};
    }
    const waitMs = 5000 * (attempt + 1);
    console.warn(`Semantic Scholar rate limited; waiting ${waitMs}ms for ${title}`);
    await sleep(waitMs);
  }
  console.warn(`Semantic Scholar skipped after retries: ${title}`);
  return {};
}

function awardLabel(award) {
  if (award === "Best Paper") return "Best Paper";
  if (award === "Best Student Paper") return "Best Student";
  return "Honorable Mention";
}

function sameAward(a, b) {
  return a.conference === b.conference && a.year === b.year && a.award === b.award;
}

function paperUrl(meta) {
  return meta.openAccessPdf?.url || meta.url || (meta.externalIds?.DOI ? `https://doi.org/${meta.externalIds.DOI}` : "");
}

const papers = JSON.parse(await fs.readFile("papers.json", "utf8"));
const byTitle = new Map(papers.map((paper) => [normalizeTitle(paper.title), paper]));

let created = 0;
let updated = 0;

for (const item of awards) {
  const key = normalizeTitle(item.title);
  const meta = withMetadata ? await fetchSemanticScholar(item.title) : {};
  const summary = summarize(meta, item.title);
  const award = {
    conference: item.conference,
    year: item.year,
    award: item.award,
    source: "CVF Computer Vision Awards",
    sourceUrl,
  };
  const existing = byTitle.get(key);
  if (existing) {
    existing.awards = existing.awards ?? [];
    if (!existing.awards.some((current) => sameAward(current, award))) existing.awards.push(award);
    existing.tags = [...new Set([...(existing.tags ?? []), "award-winning", item.conference, awardLabel(item.award)])];
    existing.priority = item.award === "Honorable Mention" && existing.priority !== "High" ? "Medium" : "High";
    updated += 1;
  } else {
    const topic = inferTopic(item.title, meta.abstract);
    const paper = {
      title: meta.title || item.title,
      authors: item.authors,
      venue: item.conference,
      year: item.year,
      topic,
      modality: topic,
      status: "CV 顶会 Best Paper 合集",
      priority: item.award === "Honorable Mention" ? "Medium" : "High",
      task: topic,
      method: summary.implementation,
      hardware: "公开论文 / 官方获奖列表",
      dataset: "见论文实验设置",
      ...summary,
      problem: summary.motivation,
      contribution: summary.implementation,
      limitation: "获奖代表质量和影响力，但具体适用边界仍需结合任务、数据和后续工作判断。",
      insight: `${item.conference} ${item.year} ${item.award}: ${summary.abstract}`,
      whyFollow: `${item.conference} ${item.year} ${item.award}，适合用于建立 CV 顶会高质量论文阅读路线。`,
      openQuestion: "后续可继续补充复现状态、开源代码质量和与计算成像方向的连接。",
      directionNote: summary.application,
      tags: ["award-winning", item.conference, awardLabel(item.award), "CVPR/ICCV/ECCV"],
      code: { available: false, url: "" },
      url: paperUrl(meta),
      updated: retrieved,
      awards: [award],
      citationCount: Number(meta.citationCount ?? -1),
      citationSource: meta.citationCount == null ? "" : "Semantic Scholar",
      semanticScholarUrl: meta.url ?? "",
      doi: meta.externalIds?.DOI ?? "",
      arxiv: meta.externalIds?.ArXiv ?? "",
    };
    papers.push(paper);
    byTitle.set(key, paper);
    created += 1;
  }
  if (withMetadata) await sleep(1200);
}

await fs.writeFile("papers.json", JSON.stringify(papers, null, 2) + "\n", "utf8");
console.log(`Award papers merged. Created: ${created}; updated: ${updated}; total: ${papers.length}`);
