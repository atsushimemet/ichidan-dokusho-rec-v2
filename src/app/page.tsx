'use client'

import BookCard from '@/components/BookCard'
import { supabase } from '@/lib/supabase'
import { Book } from '@/types/database'
import Script from 'next/script'
import { useEffect, useState } from 'react'

export default function Home() {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchBooks()
  }, [])

  const fetchBooks = async () => {
    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      setBooks(data || [])
    } catch (err) {
      console.error('Error fetching books:', err)
      setError('書籍データの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  // Xポストの埋め込みスクリプトを読み込み
  useEffect(() => {
    // 既にスクリプトが読み込まれているかチェック
    const existingScript = document.querySelector('script[src="https://platform.twitter.com/widgets.js"]')
    if (existingScript) {
      return
    }

    const script = document.createElement('script')
    script.src = 'https://platform.twitter.com/widgets.js'
    script.async = true
    script.charset = 'utf-8'
    
    // スクリプトの読み込み完了を待つ
    script.onload = () => {
      console.log('Twitter Widgets API loaded')
    }
    
    script.onerror = () => {
      console.error('Failed to load Twitter Widgets API')
    }

    document.head.appendChild(script)

    return () => {
      const scriptToRemove = document.querySelector('script[src="https://platform.twitter.com/widgets.js"]')
      if (scriptToRemove) {
        document.head.removeChild(scriptToRemove)
      }
    }
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchBooks}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            再試行
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <Script src="https://platform.twitter.com/widgets.js" strategy="afterInteractive" />
      
      <div className="min-h-screen bg-gray-50 ios-scroll">
        {/* ヘッダー */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10 safe-area-inset-top">
          <div className="max-w-md mx-auto px-4 py-4">
            <h1 className="text-xl font-bold text-gray-900 text-center">
              一段読書レコメンド
            </h1>
            <p className="text-sm text-gray-600 text-center mt-1">
              次に読む一冊を発見しよう
            </p>
          </div>
        </header>

        {/* フィード */}
        <main className="max-w-md mx-auto px-4 py-6 ios-scroll">
          {books.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">まだ書籍が登録されていません</p>
              <p className="text-gray-500 text-sm mt-2">
                管理者が書籍を登録すると、ここに表示されます
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {books.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          )}
        </main>

        {/* フッター */}
        <footer className="bg-white border-t border-gray-200 py-4 safe-area-inset-bottom">
          <div className="max-w-md mx-auto px-4 text-center">
            <p className="text-xs text-gray-500">
              <a href="/admin" className="text-orange-500 hover:text-orange-600 ios-button">
                管理者ページ
              </a>
            </p>
          </div>
        </footer>
      </div>
    </>
  )
}
