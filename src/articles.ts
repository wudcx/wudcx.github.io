import articleTreeData from './data/articles.json'

// ==================== 类型定义 ====================

/**
 * 文章条目（叶子节点）
 */
export interface Article {
  id: number
  category: string[]        // 分类路径，如 ["cpp", "oop"]
  date: string
  title: string
  description: string
  filename: string
}

/**
 * 分类分组（可嵌套）
 */
export interface ArticleGroup {
  key?: string              // 子分组 key（顶级的 key 在 Record 的 key 中）
  label: string             // i18n key
  icon?: string             // FontAwesome class
  items: (Article | ArticleGroup)[]
}

/**
 * 文章树：Record<一级分类key, ArticleGroup>
 */
export type ArticleTree = Record<string, ArticleGroup>

// ==================== 导出 ====================

export const articleTree: ArticleTree = articleTreeData as ArticleTree

/**
 * 递归扁平化所有文章（供列表页使用）
 */
export function flattenArticles(tree: ArticleTree): Article[] {
  const result: Article[] = []
  function walk(items: (Article | ArticleGroup)[]) {
    for (const item of items) {
      if ('items' in item) {
        walk(item.items)
      } else {
        result.push(item)
      }
    }
  }
  for (const group of Object.values(tree)) {
    walk(group.items)
  }
  return result
}

export const articles = flattenArticles(articleTree)