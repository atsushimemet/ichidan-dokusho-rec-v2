'use client'

import { supabase } from '@/lib/supabase'
import { BookInsert } from '@/types/database'
import Link from 'next/link'
import { useState } from 'react'

export default function AdminPage() {
  const [formData, setFormData] = useState<BookInsert>({
    title: '',
    amazon_url: '',
    x_post_url: ''
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const { error } = await supabase
        .from('books')
        .insert([formData])

      if (error) {
        throw error
      }

      setMessage({ type: 'success', text: '書籍を正常に登録しました' })
      setFormData({ title: '', amazon_url: '', x_post_url: '' })
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
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            新しい書籍を登録
          </h2>

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
                非アフィリエイトURLを使用してください
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
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-600 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ios-button"
              >
                {loading ? '登録中...' : '書籍を登録'}
              </button>
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
            <li>• 登録後、フィードページで確認できます</li>
          </ul>
          <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-xs text-yellow-800 font-medium">テスト用サンプル:</p>
            <p className="text-xs text-yellow-700 mt-1">
              Xポスト: https://x.com/elonmusk/status/1234567890
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
