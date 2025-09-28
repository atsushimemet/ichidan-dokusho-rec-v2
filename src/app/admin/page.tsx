'use client'

import { supabase } from '@/lib/supabase'
import { Book, BookInsert } from '@/types/database'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function AdminPage() {
  const [formData, setFormData] = useState<BookInsert>({
    title: '',
    amazon_url: '',
    x_post_url: '',
    asin: ''
  })
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(false)
  const [booksLoading, setBooksLoading] = useState(true)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [editingBook, setEditingBook] = useState<Book | null>(null)

  // AmazonリンクからASINを抽出する関数
  const extractASINFromAmazonURL = (url: string): string => {
    try {
      // Amazon URLからASINを抽出する正規表現
      const patterns = [
        /\/dp\/([A-Z0-9]{10})/,  // /dp/ASIN
        /\/product\/([A-Z0-9]{10})/,  // /product/ASIN
        /\/gp\/product\/([A-Z0-9]{10})/,  // /gp/product/ASIN
        /asin=([A-Z0-9]{10})/,  // asin=ASIN
      ]
      
      for (const pattern of patterns) {
        const match = url.match(pattern)
        if (match && match[1]) {
          return match[1]
        }
      }
      
      return ''
    } catch (error) {
      console.error('Error extracting ASIN:', error)
      return ''
    }
  }

  // 書籍一覧の取得
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

      console.log('Fetched books:', data)
      console.log('First book ASIN:', data?.[0]?.asin)
      console.log('First book keys:', data?.[0] ? Object.keys(data[0]) : 'No data')
      
      // ASINがnullの場合は空文字列に変換
      const processedBooks = data?.map(book => ({
        ...book,
        asin: book.asin || ''
      })) || []
      
      setBooks(processedBooks)
    } catch (err) {
      console.error('Error fetching books:', err)
      setMessage({ type: 'error', text: '書籍一覧の取得に失敗しました' })
    } finally {
      setBooksLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      // AmazonリンクからASINを自動抽出
      const extractedASIN = extractASINFromAmazonURL(formData.amazon_url)
      console.log('Extracted ASIN:', extractedASIN)
      
      const processedFormData = {
        ...formData,
        asin: extractedASIN
      }
      
      console.log('Submitting form data:', processedFormData)
      let error, data
      if (editingBook) {
        // 更新処理
        console.log('Updating book:', editingBook.id, 'with data:', processedFormData)
        const { data: updateData, error: updateError } = await supabase
          .from('books')
          .update(processedFormData)
          .eq('id', editingBook.id)
          .select()
        data = updateData
        error = updateError
        console.log('Update response:', { data: updateData, error: updateError })
      } else {
        // 新規登録処理
        console.log('Inserting new book with data:', processedFormData)
        const { data: insertData, error: insertError } = await supabase
          .from('books')
          .insert([processedFormData])
          .select()
        data = insertData
        error = insertError
        console.log('Insert response:', { data: insertData, error: insertError })
      }

      if (error) {
        console.error('Database error:', error)
        throw error
      }

      setMessage({ type: 'success', text: editingBook ? '書籍を正常に更新しました' : '書籍を正常に登録しました' })
      setFormData({ title: '', amazon_url: '', x_post_url: '', asin: '' })
      setEditingBook(null)
      fetchBooks() // 一覧を再取得
    } catch (err) {
      console.error('Error inserting book:', err)
      setMessage({ type: 'error', text: '書籍の登録に失敗しました' })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // 編集開始
  const handleEdit = (book: Book) => {
    console.log('Editing book:', book)
    console.log('Book ASIN value:', book.asin)
    setEditingBook(book)
    setFormData({
      title: book.title,
      amazon_url: book.amazon_url,
      x_post_url: book.x_post_url,
      asin: '' // ASINは自動抽出されるため、フォームでは空文字列
    })
    // フォームまでスクロール
    setTimeout(() => {
      const formElement = document.querySelector('form')
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 100)
  }

  // 編集キャンセル
  const handleCancelEdit = () => {
    setEditingBook(null)
    setFormData({ title: '', amazon_url: '', x_post_url: '', asin: '' })
  }

  // 削除
  const handleDelete = async (id: string) => {
    console.log('Attempting to delete book with ID:', id)
    
    if (!confirm('この書籍を削除しますか？')) {
      console.log('Delete cancelled by user')
      return
    }

    try {
      console.log('Sending delete request to Supabase...')
      const { data, error } = await supabase
        .from('books')
        .delete()
        .eq('id', id)
        .select()

      console.log('Delete response:', { data, error })

      if (error) {
        console.error('Supabase delete error:', error)
        throw error
      }

      console.log('Book deleted successfully')
      setMessage({ type: 'success', text: '書籍を削除しました' })
      fetchBooks()
    } catch (err) {
      console.error('Error deleting book:', err)
      setMessage({ type: 'error', text: '書籍の削除に失敗しました' })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 ios-scroll">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b border-gray-200 safe-area-inset-top">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">
              管理者ページ
            </h1>
            <Link
              href="/"
              className="text-orange-500 hover:text-orange-600 text-sm font-medium ios-button"
            >
              ← フィードに戻る
            </Link>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className={`rounded-lg shadow-md border p-6 ${
          editingBook 
            ? 'bg-blue-50 border-blue-200' 
            : 'bg-white border-gray-200'
        }`}>
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            {editingBook ? '書籍を編集' : '新しい書籍を登録'}
          </h2>
          
          {editingBook && (
            <div className="mb-4 p-3 bg-blue-100 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <span className="font-medium">編集中:</span> {editingBook.title}
              </p>
            </div>
          )}

          {/* メッセージ表示 */}
          {message && (
            <div className={`mb-4 p-3 rounded-lg ${
              message.type === 'success' 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 書籍名 */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                書籍名 *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                placeholder="例: 7つの習慣"
              />
            </div>

            {/* Amazonリンク */}
            <div>
              <label htmlFor="amazon_url" className="block text-sm font-medium text-gray-700 mb-2">
                Amazonリンク *
              </label>
              <input
                type="url"
                id="amazon_url"
                name="amazon_url"
                value={formData.amazon_url}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                placeholder="https://amazon.co.jp/dp/..."
              />
              <p className="text-xs text-gray-500 mt-1">
                非アフィリエイトURLを使用してください（ASINは自動抽出されます）
              </p>
            </div>

            {/* Xポストリンク */}
            <div>
              <label htmlFor="x_post_url" className="block text-sm font-medium text-gray-700 mb-2">
                推薦Xポストリンク *
              </label>
              <input
                type="url"
                id="x_post_url"
                name="x_post_url"
                value={formData.x_post_url}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                placeholder="https://x.com/username/status/1234567890"
              />
              <p className="text-xs text-gray-500 mt-1">
                推薦者のXポストのURLを入力してください
              </p>
            </div>


            {/* 送信ボタン */}
            <div className="pt-4 flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-orange-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-600 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ios-button"
              >
                {loading ? (editingBook ? '更新中...' : '登録中...') : (editingBook ? '書籍を更新' : '書籍を登録')}
              </button>
              {editingBook && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors ios-button"
                >
                  キャンセル
                </button>
              )}
            </div>
          </form>
        </div>

        {/* 使い方ガイド */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">使い方ガイド</h3>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• 書籍名は分かりやすく、正確に入力してください</li>
            <li>• Amazonリンクは非アフィリエイトURLを使用してください</li>
            <li>• Xポストリンクは推薦者の投稿URLをそのまま貼り付けてください</li>
            <li>• ASINはAmazonリンクから自動抽出されます</li>
            <li>• 登録後、フィードページで確認できます</li>
          </ul>
          <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-xs text-yellow-800 font-medium">テスト用サンプル:</p>
            <p className="text-xs text-yellow-700 mt-1">
              Xポスト: https://x.com/elonmusk/status/1234567890
            </p>
          </div>
        </div>

        {/* 書籍一覧 */}
        <div className="mt-8 bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            登録済み書籍一覧
          </h3>
          
          {booksLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
              <p className="text-gray-600">読み込み中...</p>
            </div>
          ) : books.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">登録された書籍がありません</p>
            </div>
          ) : (
            <div className="space-y-4">
              {books.map((book) => (
                <div key={book.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-lg font-medium text-gray-900 mb-2">
                        {book.title}
                      </h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>
                          <span className="font-medium">Amazon:</span>{' '}
                          <a 
                            href={book.amazon_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 break-all"
                          >
                            {book.amazon_url}
                          </a>
                        </p>
                        <p>
                          <span className="font-medium">Xポスト:</span>{' '}
                          <a 
                            href={book.x_post_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 break-all"
                          >
                            {book.x_post_url}
                          </a>
                        </p>
                        <p>
                          <span className="font-medium">ASIN:</span> {book.asin || '未抽出'}
                          {book.asin && (
                            <span className="ml-2 text-xs text-green-600">
                              ✓ 画像表示可能
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-gray-500">
                          登録日: {new Date(book.created_at).toLocaleDateString('ja-JP')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleEdit(book)}
                        className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors ios-button flex items-center gap-1"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        編集
                      </button>
                      <button
                        onClick={() => handleDelete(book.id)}
                        className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors ios-button flex items-center gap-1"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-2-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        削除
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
