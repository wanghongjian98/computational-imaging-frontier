import fs from "node:fs/promises";

const patches = new Map([
  [
    "Structure-from-Motion Revisited",
    {
      abstract:
        "This paper revisits incremental structure-from-motion and identifies practical bottlenecks in robustness, scalability, initialization, triangulation, image registration, and bundle adjustment. It presents a complete SfM system that improves these steps and serves as the basis of COLMAP.",
      motivation:
        "Incremental SfM is accurate but fragile at scale: image registration, initialization, triangulation, and accumulated reconstruction errors can make large unordered photo collections hard to reconstruct reliably.",
      implementation:
        "The work redesigns the SfM pipeline with more robust feature matching and verification, improved image registration and triangulation, and scalable bundle-adjustment choices in a complete reconstruction system.",
      application:
        "Useful for large-scale 3D reconstruction from unordered image collections, camera pose estimation, photogrammetry, mapping, and downstream neural rendering or scene understanding pipelines.",
    },
  ],
  [
    "Image Style Transfer Using Convolutional Neural Networks",
    {
      abstract:
        "This paper shows that convolutional neural networks can separate image content and style representations. It synthesizes an image by optimizing pixels to match high-level content features from one image and style statistics from another.",
      motivation:
        "Artistic stylization requires preserving the semantic content of one image while transferring the visual texture, color, and brush-stroke statistics of another, which traditional filters do not model explicitly.",
      implementation:
        "The method uses CNN activations for content representation and Gram-matrix correlations of feature maps for style representation, then optimizes a generated image to jointly match both losses.",
      application:
        "Useful for neural artistic style transfer, image editing, texture synthesis, creative visual effects, and studying feature representations learned by classification CNNs.",
    },
  ],
  [
    "A Discriminative Feature Learning Approach for Deep Face Recognition",
    {
      abstract:
        "This paper improves deep face recognition by learning angularly discriminative features. It introduces an angular softmax loss that constrains features on a hypersphere and enforces a larger angular margin between face identities.",
      motivation:
        "Face recognition needs features with small intra-class variation and large inter-class separation, while ordinary softmax classification does not explicitly impose a discriminative angular margin.",
      implementation:
        "The method replaces the standard softmax objective with an angular-margin formulation on normalized features and weights, producing more separable face embeddings on the hypersphere.",
      application:
        "Useful for face verification and identification benchmarks such as LFW, YTF, and MegaFace, and for biometric recognition systems requiring discriminative embeddings.",
    },
  ],
  [
    "Scene Parsing through ADE20K Dataset",
    {
      abstract:
        "This paper introduces ADE20K for scene parsing: a densely annotated dataset covering diverse scenes, objects, and object parts. It uses the dataset to evaluate semantic segmentation and scene parsing models.",
      motivation:
        "Scene parsing requires recognizing both objects and stuff across diverse indoor and outdoor scenes, but earlier datasets were limited in category coverage, density, or scene diversity.",
      implementation:
        "The work builds ADE20K with dense pixel-level annotations for scenes, objects, and parts, then establishes benchmark evaluations for semantic segmentation and scene parsing.",
      application:
        "Useful for semantic segmentation, scene understanding, object-and-part parsing, dataset benchmarking, and training perception models for complex real-world environments.",
    },
  ],
  [
    "Social LSTM: Human Trajectory Prediction in Crowded Spaces",
    {
      abstract:
        "This paper models human trajectory prediction in crowded spaces with recurrent networks. It introduces Social LSTM, where each person has an LSTM and nearby hidden states are pooled to capture social interactions.",
      motivation:
        "Pedestrian motion in crowds is not independent: future trajectories depend on nearby people, collision avoidance, group behavior, and other social interactions that simple motion models miss.",
      implementation:
        "The method assigns an LSTM to each tracked person and uses a social pooling layer over neighboring hidden states so trajectory prediction can condition on local crowd interactions.",
      application:
        "Useful for pedestrian trajectory forecasting, autonomous driving, mobile robotics, surveillance, crowd analysis, and human-aware navigation in shared spaces.",
    },
  ],
]);

const papers = JSON.parse(await fs.readFile("papers.json", "utf8"));
let updated = 0;
for (const paper of papers) {
  const patch = patches.get(paper.title);
  if (!patch) continue;
  Object.assign(paper, patch, {
    problem: patch.motivation,
    contribution: patch.implementation,
    directionNote: patch.application,
  });
  updated += 1;
}

await fs.writeFile("papers.json", JSON.stringify(papers, null, 2) + "\n", "utf8");
console.log(`Updated ${updated} manual summaries`);
