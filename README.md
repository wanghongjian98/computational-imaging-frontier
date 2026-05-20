# 计算成像前沿论文图谱

这是一个适合部署到 GitHub Pages 的静态站点，用来筛选、总结和整理计算成像论文。

## 本地预览

直接打开 `index.html` 即可。由于浏览器对本地 `fetch` 有限制，更稳妥的方式是在目录里启动一个静态服务器：

```powershell
python -m http.server 8000
```

然后访问 `http://localhost:8000`。

## 更新论文

论文数据集中在 `papers.json`。每条论文建议保持这些字段：

- `title`: 论文标题
- `authors`: 作者简写
- `venue`: 会议或期刊
- `year`: 年份
- `topic`: 研究方向
- `modality`: 成像模态
- `problem`: 解决什么问题
- `contribution`: 核心贡献
- `limitation`: 主要局限
- `directionNote`: 该方向的前沿观察
- `tags`: 标签数组
- `scores`: `novelty`、`impact`、`reproducibility`、`fit` 四个 0-10 分
- `url`: 论文链接

综合价值评分计算方式：

```text
0.30 * novelty + 0.25 * impact + 0.25 * fit + 0.20 * reproducibility
```

## 部署到 GitHub Pages

1. 新建仓库，例如 `yourname.github.io` 或 `computational-imaging-frontier`。
2. 上传本目录中的 `index.html`、`styles.css`、`app.js`、`papers.json` 和 `README.md`。
3. 在 GitHub 仓库 `Settings > Pages` 中选择从 `main` 分支根目录部署。
4. 等待 GitHub Pages 构建完成后访问对应网址。

## 推荐维护节奏

- 每周新增 3-5 篇论文。
- 每篇论文只写高密度摘要，避免复制 abstract。
- 每月按方向整理一次：关键问题、代表方法、开放挑战、值得复现的代码。
