import articlesData from './data/articles.json'

export interface Article {
  id: number
  category: string
  date: string
  title: string
  description: string
  filename: string
}

export const articles: Article[] = articlesData as Article[]