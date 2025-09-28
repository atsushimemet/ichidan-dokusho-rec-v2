-- 現在のRLSポリシーを確認

-- booksテーブルのRLSが有効かどうか確認
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'books';

-- booksテーブルのポリシー一覧を確認
SELECT 
  policyname,
  cmd,
  permissive,
  roles,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'books'
ORDER BY policyname;

-- 現在のユーザー情報を確認
SELECT current_user, session_user;
