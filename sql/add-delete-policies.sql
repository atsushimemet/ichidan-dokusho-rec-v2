-- 削除・更新用のRLSポリシーを追加

-- 更新用ポリシー
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'books' AND policyname = 'Allow update for authenticated users'
  ) THEN
    CREATE POLICY "Allow update for authenticated users" ON books
      FOR UPDATE USING (true);
    RAISE NOTICE 'Update policy added to books table';
  ELSE
    RAISE NOTICE 'Update policy already exists in books table';
  END IF;
END $$;

-- 削除用ポリシー
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'books' AND policyname = 'Allow delete for authenticated users'
  ) THEN
    CREATE POLICY "Allow delete for authenticated users" ON books
      FOR DELETE USING (true);
    RAISE NOTICE 'Delete policy added to books table';
  ELSE
    RAISE NOTICE 'Delete policy already exists in books table';
  END IF;
END $$;

-- 現在のポリシーを確認
SELECT policyname, cmd, qual FROM pg_policies WHERE tablename = 'books';
