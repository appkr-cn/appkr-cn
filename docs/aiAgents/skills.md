# Skills & Tools

AI 生态中丰富的工具、插件和技能集，按类型分为 **MCP 协议**、**浏览器自动化**、**代码助手**、**向量数据库**和**其他实用工具**。

---

## MCP 协议

MCP（Model Context Protocol，模型上下文协议）是 Anthropic 推出的开放协议，用于标准化 AI 模型与外部数据源、工具之间的集成。

### 官方资源

- **MCP 官网**：[https://modelcontextprotocol.io](https://modelcontextprotocol.io)
- **GitHub**：[https://github.com/modelcontextprotocol](https://github.com/modelcontextprotocol)
- **规范文档**：[https://spec.modelcontextprotocol.io](https://spec.modelcontextprotocol.io)

### 常用 MCP Servers

| 名称 | 功能 | 链接 |
|------|------|------|
| filesystem | 本地文件系统访问 | [GitHub](https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem) |
| github | GitHub API 集成 | [GitHub](https://github.com/modelcontextprotocol/servers/tree/main/src/github) |
| postgres | PostgreSQL 数据库访问 | [GitHub](https://github.com/modelcontextprotocol/servers/tree/main/src/postgres) |
| slack | Slack 工作区集成 | [GitHub](https://github.com/modelcontextprotocol/servers/tree/main/src/slack) |
| brave-search | Brave 搜索引擎 | [GitHub](https://github.com/modelcontextprotocol/servers/tree/main/src/brave-search) |

---

## 浏览器自动化

### Playwright

- **官网**：[https://playwright.dev](https://playwright.dev)
- **GitHub**：[https://github.com/microsoft/playwright](https://github.com/microsoft/playwright)

微软开源的浏览器自动化工具，支持多浏览器、多语言，是 Agent 操作网页的首选工具。

---

### Puppeteer

- **官网**：[https://pptr.dev](https://pptr.dev)
- **GitHub**：[https://github.com/puppeteer/puppeteer](https://github.com/puppeteer/puppeteer)

Google 开源的 Node.js 浏览器控制库，适合需要与 Chrome DevTools Protocol 深度集成的场景。

---

### Browser-use

- **官网**：[https://browser-use.com](https://browser-use.com)
- **GitHub**：[https://github.com/browser-use/browser-use](https://github.com/browser-use/browser-use)

专为 AI Agent 设计的浏览器自动化库，让大模型能够像人类一样浏览和操作网页。

---

### Stagehand

- **官网**：[https://stagehand.dev](https://stagehand.dev)
- **GitHub**：[https://github.com/browserbase/stagehand](https://github.com/browserbase/stagehand)

基于 Playwright 的 AI 浏览器自动化框架，支持自然语言驱动的网页操作。

---

## 代码助手

### GitHub Copilot

- **官网**：[https://github.com/features/copilot](https://github.com/features/copilot)

GitHub 与 OpenAI 合作推出的 AI 编程助手，支持代码补全、聊天和命令行工具。

---

### Cursor

- **官网**：[https://www.cursor.com](https://www.cursor.com)

基于 VS Code 的 AI 原生编辑器，内置 Claude、GPT-4 等模型，支持代码生成、重构和问答。

---

### Trae

- **官网**：[https://www.trae.ai](https://www.trae.ai)
- **国内版**：[https://www.trae.com.cn](https://www.trae.com.cn)

字节跳动推出的 AI 原生 IDE，基于 Claude 3.5 等模型，提供 Builder 模式和深度代码理解。

---

### Windsurf

- **官网**：[https://codeium.com/windsurf](https://codeium.com/windsurf)

Codeium 推出的 AI 编辑器，支持 Cascade 工作流，可同时编辑多个文件。

---

### Continue

- **官网**：[https://www.continue.dev](https://www.continue.dev)
- **GitHub**：[https://github.com/continuedev/continue](https://github.com/continuedev/continue)

开源的 AI 代码助手插件，支持 VS Code 和 JetBrains，可连接任意模型和 API。

---

## 向量数据库

### Pinecone

- **官网**：[https://www.pinecone.io](https://www.pinecone.io)

托管式向量数据库服务，专为高性能相似性搜索设计。

---

### Milvus / Zilliz

- **官网**：[https://milvus.io](https://milvus.io)
- **GitHub**：[https://github.com/milvus-io/milvus](https://github.com/milvus-io/milvus)

开源分布式向量数据库，由 Zilliz 公司维护，支持十亿级向量检索。

---

### Chroma

- **官网**：[https://www.trychroma.com](https://www.trychroma.com)
- **GitHub**：[https://github.com/chroma-core/chroma](https://github.com/chroma-core/chroma)

开源嵌入式向量数据库，以简单易用著称，适合快速原型开发。

---

### Weaviate

- **官网**：[https://weaviate.io](https://weaviate.io)
- **GitHub**：[https://github.com/weaviate/weaviate](https://github.com/weaviate/weaviate)

开源向量搜索引擎，支持 GraphQL 接口和模块化 AI 集成。

---

## 其他实用工具

### ComfyUI

- **GitHub**：[https://github.com/comfyanonymous/ComfyUI](https://github.com/comfyanonymous/ComfyUI)

基于节点的 Stable Diffusion 图形化界面，广泛用于 AI 图像生成工作流。

---

### Ollama

- **官网**：[https://ollama.com](https://ollama.com)
- **GitHub**：[https://github.com/ollama/ollama](https://github.com/ollama/ollama)

在本地运行大语言模型的工具，一行命令即可启动 Llama、Qwen、Mistral 等模型。

---

### vLLM

- **GitHub**：[https://github.com/vllm-project/vllm](https://github.com/vllm-project/vllm)

高性能大模型推理引擎，采用 PagedAttention 技术，吞吐量远超传统方案。

---

### LiteLLM

- **官网**：[https://www.litellm.ai](https://www.litellm.ai)
- **GitHub**：[https://github.com/BerriAI/litellm](https://github.com/BerriAI/litellm)

统一的多模型 API 网关，支持 100+ LLM 的统一定价、路由和监控。

---

### Unstructured

- **官网**：[https://unstructured.io](https://unstructured.io)
- **GitHub**：[https://github.com/Unstructured-IO/unstructured](https://github.com/Unstructured-IO/unstructured)

开源的文档解析和预处理库，支持 PDF、Word、HTML 等多种格式转换为结构化数据。

---

### Prompt flow

- **文档**：[https://microsoft.github.io/promptflow](https://microsoft.github.io/promptflow)
- **GitHub**：[https://github.com/microsoft/promptflow](https://github.com/microsoft/promptflow)

微软开源的 LLM 应用开发工具，支持提示词管理、评估和流程编排。
