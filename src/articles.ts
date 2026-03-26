export interface Article {
  id: number
  category: string
  date: string
  title: string
  description: string
  filename: string
}

export const articles: Article[] = [
  {
    id: 1,
    category: '编辑器',
    date: '2026-03-22',
    title: 'nvim入门教程',
    description: 'Neovim是一款现代化的Vim分支，本文带你从零开始配置和使用nvim，包括插件管理、基本操作和LSP集成。',
    filename: 'nvim入门教程.md'
  },
  {
    id: 2,
    category: 'OpenCode教程',
    date: '2026-03-22',
    title: '学习opencode教程',
    description: 'OpenCode是一个强大的AI编程助手，本教程涵盖其核心功能、使用技巧和实战案例，帮助你快速上手。',
    filename: '学习opencode教程.md'
  },
  {
    id: 3,
    category: 'C++',
    date: '2026-03-22',
    title: 'c++面试题',
    description: '汇总常见C++面试知识点，包括面向对象、内存管理、STL容器和算法等高频考点与详细解析。',
    filename: 'c++面试题.md'
  }
]