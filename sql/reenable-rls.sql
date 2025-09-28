-- RLSを再有効化し、適切なポリシーを設定

-- RLSを有効化
ALTER TABLE books ENABLE ROW LEVEL SECURITY;

-- 既存のポリシーを削除（重複を避けるため）
DROP POLICY IF EXISTS "Allow read access for all users" ON books;
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON books;
DROP POLICY IF EXISTS "Allow update for authenticated users" ON books;
DROP POLICY IF EXISTS "Allow delete for authenticated users" ON books;

-- 新しいポリシーを作成
CREATE POLICY "Allow read access for all users" ON books
  FOR SELECT USING (true);

CREATE POLICY "Allow insert for authenticated users" ON books
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update for authenticated users" ON books
  FOR UPDATE USING (true);

CREATE POLICY "Allow delete for authenticated users" ON books
  FOR DELETE USING (true);

-- 確認
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'books';
