-- booksテーブルの作成（既存の場合はスキップ）
CREATE TABLE IF NOT EXISTS books (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  amazon_url TEXT NOT NULL,
  x_post_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ASINカラムの追加（既存のテーブルがある場合）
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'books' AND column_name = 'asin'
  ) THEN
    ALTER TABLE books ADD COLUMN asin TEXT;
    RAISE NOTICE 'ASIN column added to books table';
  ELSE
    RAISE NOTICE 'ASIN column already exists in books table';
  END IF;
END $$;

-- 既存データのASINを空文字列で初期化（nullの場合のみ）
UPDATE books SET asin = '' WHERE asin IS NULL;

-- RLS (Row Level Security) の設定
ALTER TABLE books ENABLE ROW LEVEL SECURITY;

-- 全ユーザーが読み取り可能（既存のポリシーがある場合はスキップ）
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'books' AND policyname = 'Allow read access for all users'
  ) THEN
    CREATE POLICY "Allow read access for all users" ON books
      FOR SELECT USING (true);
  END IF;
END $$;

-- 管理者のみが挿入可能（既存のポリシーがある場合はスキップ）
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'books' AND policyname = 'Allow insert for authenticated users'
  ) THEN
    CREATE POLICY "Allow insert for authenticated users" ON books
      FOR INSERT WITH CHECK (true);
  END IF;
END $$;

-- インデックスの作成（既存のインデックスがある場合はスキップ）
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'books' AND indexname = 'idx_books_created_at'
  ) THEN
    CREATE INDEX idx_books_created_at ON books(created_at DESC);
  END IF;
END $$;
