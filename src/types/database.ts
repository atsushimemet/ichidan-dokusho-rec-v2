export interface Book {
  id: string
  title: string
  amazon_url: string
  x_post_url: string
  asin?: string
  created_at: string
}

export interface BookInsert {
  title: string
  amazon_url: string
  x_post_url: string
  asin: string
}
