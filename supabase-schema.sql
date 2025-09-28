-- booksテーブルの作成
CREATE TABLE books (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  amazon_url TEXT NOT NULL,
  x_post_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS (Row Level Security) の設定
ALTER TABLE books ENABLE ROW LEVEL SECURITY;

-- 全ユーザーが読み取り可能
CREATE POLICY "Allow read access for all users" ON books
  FOR SELECT USING (true);

-- 管理者のみが挿入可能（実際の運用では認証が必要）
CREATE POLICY "Allow insert for authenticated users" ON books
  FOR INSERT WITH CHECK (true);

-- インデックスの作成（パフォーマンス向上）
CREATE INDEX idx_books_created_at ON books(created_at DESC);
