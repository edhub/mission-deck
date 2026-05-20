# Mission Deck Plan

## 1. 项目定位

Mission Deck 是一个个人使用的、本地优先的、多项目任务管理工具。

它不是传统 Todo / Kanban，而是一个低认知负担的任务总览 Deck：

- 每个项目是一列。
- 多个项目横向平铺，尽可能铺满全屏。
- 列太多时横向滚动。
- 每列内部任务多时独立纵向滚动。
- 任务按“处理方式”轻分组，而不是按复杂状态流转。
- 数据完全存储在浏览器本地 IndexedDB。

核心目标：

> 在尽可能降低认知负担的前提下，把多项目、事项有序、完整、直观地呈现出来。

## 2. 技术选型

初步技术栈：

- SvelteKit
- Bun
- Tailwind CSS
- DaisyUI
- IndexedDB
- idb
- 静态站点部署
- justfile

项目性质：

- 纯前端项目
- 无后端
- 无登录
- 无云同步
- 本地优先

## 3. 核心界面结构

主界面是一个全屏 Deck。

```txt
┌────────────────────────────────────────────────────┐
│ Mission Deck       [+ Project]      [Export] [⚙]   │
├────────────────────────────────────────────────────┤
│                                                    │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐      │
│  │ Project A  │ │ Project B  │ │ Project C  │  →   │
│  │────────────│ │────────────│ │────────────│      │
│  │ Concern    │ │ Concern    │ │ Concern    │      │
│  │ task       │ │ task       │ │ task       │      │
│  │ Details    │ │ Details    │ │ Details    │      │
│  │ Hands-on   │ │ Hands-on   │ │ Hands-on   │      │
│  │ Delegate   │ │ Delegate   │ │ Delegate   │      │
│  │ Other      │ │ Other      │ │ Other      │      │
│  │ Completed ▸│ │ Completed ▸│ │ Completed ▸│      │
│  └────────────┘ └────────────┘ └────────────┘      │
│                                                    │
└────────────────────────────────────────────────────┘
```

## 4. 项目列

每个项目是一列。

项目列特性：

- 固定宽度。
- 横向排列。
- 支持拖拽排序。
- 每列内部可纵向滚动。
- 项目可创建、重命名、归档。
- 暂不以硬删除为主，优先归档。

项目列包含：

1. 项目标题
2. 未完成任务分组
3. 已完成任务折叠区
4. 分组内新增任务入口

## 5. 任务分组

任务只有两个状态：

- 未完成
- 已完成

未完成任务按处理方式分组：

1. Concern
2. Details
3. Hands-on
4. Delegate
5. Other

这些分组表达的是任务处理方式，而不是进度状态。

初步含义：

- Concern：需要关注、尚未明确行动方式的事项。
- Details：需要补充细节、整理信息、查漏补缺的事项。
- Hands-on：需要自己动手推进的事项。
- Delegate：需要交给别人、等待别人或依赖外部的事项。
- Other：暂时不好归类的事项。

已完成任务：

- 放在每列最下面。
- 默认折叠。
- 可手动展开。
- 展开后按完成时间倒序展示。
- 可从已完成拖回未完成分组。

## 6. 任务模型与交互

任务非常轻量。

任务字段：

- 内容
- 所属项目
- 所属分组
- 完成状态
- Focus 标记
- 排序值
- 创建时间
- 更新时间
- 完成时间

任务不区分标题和描述，只有内容。

任务内容：

- 允许多行。
- 展示时可以限制最大高度或最大行数。
- 点击任务内容进入 inline 编辑。
- Enter 保存。
- Shift+Enter 换行。
- Esc 取消编辑。

任务操作：

- 新增任务。
- 编辑任务内容。
- 标记完成 / 取消完成。
- 标记 / 取消 focus。
- 删除任务。
- 拖拽排序。
- 跨分组拖拽。
- 跨项目拖拽。

新增任务：

- 每个分组提供新增入口。
- 新任务默认加入该分组最下面。
- 已完成分组不直接新增任务。

Focus：

- 允许多个任务被标记为 focus。
- 第一版不限制全局数量，也不限制每项目数量。
- 视觉上使用轻量标记，不应过度抢眼。

## 7. 数据模型草案

```ts
type TaskGroup = 'concern' | 'details' | 'hands-on' | 'delegate' | 'other';

interface Project {
	id: string;
	name: string;
	order: number;
	archived: boolean;
	completedExpanded: boolean;
	createdAt: string;
	updatedAt: string;
}

interface Task {
	id: string;
	projectId: string;
	content: string;
	group: TaskGroup;
	completed: boolean;
	focused: boolean;
	order: number;
	createdAt: string;
	updatedAt: string;
	completedAt?: string;
}
```

IndexedDB 初步 store：

- `projects`
- `tasks`
- `meta`

`meta` 可用于保存：

- schema version
- UI 设置
- 未来迁移信息

## 8. 本地数据与备份

因为数据只保存在本地 IndexedDB，备份能力需要尽早加入。

MVP 建议包含：

- 导出 JSON。
- 导入 JSON。
- 导入前确认。
- 数据结构版本号。

后续可以考虑：

- 自动下载备份。
- OPFS / 文件系统 API。
- iCloud Drive / Dropbox 手动同步。
- PWA 离线安装。

## 9. 视觉风格

目标风格：macOS 原生工具感。

设计原则：

- 克制。
- 清爽。
- 低饱和。
- 少阴影。
- 细边框。
- hover 时显示更多操作。
- 不做强 SaaS 风。
- 不做 Trello 式重卡片。

初步方向：

- 全局浅灰背景。
- 项目列使用浅色半透明或白色面板。
- 任务行更像原生列表项，而不是厚重卡片。
- Focus 使用小圆点、细线或轻量高亮。
- 已完成任务弱化显示。

## 10. 快捷键

快捷键重要，但第一阶段可以先不展开。

后续可讨论：

- 新建任务。
- 新建项目。
- 搜索。
- 聚焦当前项目。
- 在任务间移动。
- 完成任务。
- 标记 focus。
- 展开 / 折叠已完成。

## 11. MVP 范围

第一版建议包含：

- 初始化 SvelteKit 静态项目。
- Tailwind CSS / DaisyUI。
- IndexedDB 数据层。
- 项目创建、重命名、归档。
- 项目列横向布局。
- 项目列固定宽度。
- 项目拖拽排序。
- 任务创建、编辑、删除。
- 任务完成 / 取消完成。
- 任务 focus 标记。
- 任务按五个分组展示。
- 已完成任务默认折叠，可展开。
- 任务拖拽排序、跨分组、跨项目。
- JSON 导入 / 导出。

暂不包含：

- 登录。
- 后端。
- 云同步。
- 多用户。
- 标签。
- 截止日期。
- 优先级。
- 子任务。
- 日历视图。
- 全局搜索。
- 复杂快捷键系统。

## 12. 开发计划

### Phase 0：产品与交互确认

- 明确 MVP。
- 明确数据模型。
- 明确拖拽行为。
- 明确任务编辑行为。
- 明确导入导出格式。

### Phase 1：项目骨架

- 初始化 SvelteKit。
- 配置 Bun。
- 配置 Tailwind CSS / DaisyUI。
- 配置 adapter-static。
- 添加 justfile。
- 建立基础目录结构。

### Phase 2：本地数据层

- 引入 idb。
- 建立 IndexedDB schema。
- 实现 projects / tasks CRUD。
- 实现数据加载与保存。
- 准备 mock / seed 数据。

### Phase 3：Deck 布局

- 实现全屏布局。
- 实现横向项目列滚动。
- 实现列内纵向滚动。
- 实现项目列组件。
- 实现任务分组组件。
- 实现任务行组件。

### Phase 4：基础任务管理

- 新建项目。
- 重命名项目。
- 归档项目。
- 新建任务。
- 编辑任务。
- 删除任务。
- 完成 / 取消完成。
- 标记 / 取消 focus。
- 展开 / 折叠已完成。

### Phase 5：拖拽

- 项目列拖拽排序。
- 任务同组排序。
- 任务跨分组移动。
- 任务跨项目移动。
- 已完成任务拖回未完成。

### Phase 6：备份与收尾

- JSON 导出。
- JSON 导入。
- 基础错误处理。
- 空状态。
- 简单设置入口。
- README。

## 13. 待确认问题

后续仍需讨论：

- 具体列宽。
- 任务展示最大行数。
- 拖拽库选择。
- 是否使用 PWA。
- 导入数据冲突策略。
- 归档项目入口和归档项目查看方式。
- 快捷键设计。
