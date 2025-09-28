-- 既存データのASINを空文字列で初期化
UPDATE books SET asin = '' WHERE asin IS NULL;

-- 確認用クエリ
SELECT id, title, asin FROM books ORDER BY created_at DESC;
