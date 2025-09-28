-- 一時的にRLSを無効化してテスト（本番環境では使用しない）

-- RLSを無効化
ALTER TABLE books DISABLE ROW LEVEL SECURITY;

-- 確認
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'books';

-- 注意: テスト後は必ず以下を実行してRLSを再有効化してください
-- ALTER TABLE books ENABLE ROW LEVEL SECURITY;
