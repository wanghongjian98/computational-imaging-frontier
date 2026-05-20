# 计算成像前沿论文雷达

这是一个适合部署到 GitHub Pages 的静态站点，用来筛选、总结和维护计算成像论文。

## 网页地址

仓库发布后访问：

```text
https://wanghongjian98.github.io/computational-imaging-frontier/
```

如果看到 GitHub Pages 404，通常是 Pages 还没启用。进入仓库：

```text
Settings > Pages
```

推荐选择：

```text
Source: GitHub Actions
```

本仓库已经包含 `.github/workflows/pages.yml`，推送到 `main` 后会自动部署。

也可以选择分支部署：

```text
Source: Deploy from a branch
Branch: main
Folder: /root
```

## 本地预览

不要直接双击 `index.html`，因为浏览器会限制本地 `fetch("papers.json")`。请在目录中启动静态服务器：

```powershell
python -m http.server 8000
```

然后访问：

```text
http://127.0.0.1:8000
```

## 更新论文

论文数据集中在 `papers.json`。每条论文建议保持这些字段：

- `title`: 论文标题
- `authors`: 作者简写
- `venue`: 会议或期刊
- `year`: 年份
- `topic`: 研究方向
- `modality`: 成像模态
- `status`: 阅读状态，例如 核心基线、重点跟踪、复现候选、综述入口
- `priority`: High、Medium、Low
- `task`: 任务定义
- `method`: 主要方法
- `hardware`: 硬件或采集系统
- `dataset`: 数据集或实验数据
- `problem`: 解决什么问题
- `contribution`: 核心贡献
- `limitation`: 主要局限
- `insight`: 一句话研究判断
- `whyFollow`: 为什么值得跟进
- `openQuestion`: 开放问题
- `directionNote`: 该方向的前沿观察
- `tags`: 标签数组
- `code`: 是否有代码和代码链接
- `url`: 论文链接
- `updated`: 条目更新时间

## 推荐维护节奏

- 每周新增 3-5 篇论文。
- 每篇论文只写高密度摘要，避免复制 abstract。
- 每月按方向整理一次：关键问题、代表方法、开放挑战、值得复现的代码。
- 对 High priority 论文优先补充代码、数据集和复现实验记录。
