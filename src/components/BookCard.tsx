'use client'

import { Book } from '@/types/database'
import { useEffect, useRef, useState } from 'react'

interface BookCardProps {
  book: Book
}

export default function BookCard({ book }: BookCardProps) {
  const [isXPostLoaded, setIsXPostLoaded] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const tweetRef = useRef<HTMLDivElement>(null)

  const handleAmazonClick = () => {
    // クリック追跡（将来的に分析用）
    console.log('Amazon link clicked:', book.title)
  }

  // クライアントサイドでのマウントを確認
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Xポストの埋め込み処理（遅延実行）
  useEffect(() => {
    if (!isMounted) return

    const timer = setTimeout(() => {
      if (typeof window === 'undefined' || !window.twttr) {
        setIsXPostLoaded(true)
        return
      }

      const loadTweet = () => {
        if (tweetRef.current && window.twttr) {
          window.twttr.widgets.createTweet(
            book.x_post_url.split('/').pop()?.split('?')[0] || '',
            tweetRef.current,
            {
              theme: 'light',
              width: '100%',
              align: 'center'
            }
          ).then(() => {
            setIsXPostLoaded(true)
          }).catch(() => {
            // 埋め込みに失敗した場合のフォールバック
            setIsXPostLoaded(true)
          })
        }
      }

      if (window.twttr.ready) {
        loadTweet()
      } else {
        window.twttr.ready(loadTweet)
      }
    }, 100)

    return () => clearTimeout(timer)
  }, [book.x_post_url, isMounted])

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 mb-4 max-w-md mx-auto">
      {/* 書籍タイトル */}
      <h2 className="text-lg font-semibold text-gray-900 mb-3 leading-tight">
        {book.title}
      </h2>

      {/* Amazonリンク */}
      <div className="mb-4">
        <a
          href={book.amazon_url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleAmazonClick}
          className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors duration-200 text-sm font-medium ios-button"
        >
          <svg
            className="w-4 h-4 mr-2"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M7.5 2.5c-.8 0-1.5.7-1.5 1.5v16c0 .8.7 1.5 1.5 1.5h9c.8 0 1.5-.7 1.5-1.5V4c0-.8-.7-1.5-1.5-1.5h-9zm0 1h9v16h-9v-16z"/>
            <path d="M10 6h4v1h-4V6zm0 2h4v1h-4V8zm0 2h4v1h-4v-1zm0 2h4v1h-4v-1z"/>
          </svg>
          Amazonで見る
        </a>
      </div>

      {/* Xポスト埋め込み */}
      <div className="border-t border-gray-200 pt-3">
        <div className="text-xs text-gray-500 mb-2">推薦ポスト</div>
        {!isMounted ? (
          <div className="bg-gray-100 rounded-lg p-4 text-center">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-300 rounded mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-3/4 mx-auto"></div>
            </div>
          </div>
        ) : !isXPostLoaded ? (
          <div className="bg-gray-100 rounded-lg p-4 text-center">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-300 rounded mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-3/4 mx-auto"></div>
            </div>
            <div className="text-center mt-2">
              <a
                href={book.x_post_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-500 hover:text-blue-600 ios-button"
              >
                ポストを直接見る →
              </a>
            </div>
          </div>
        ) : (
          <div
            ref={tweetRef}
            className="transition-opacity duration-300 opacity-100"
            suppressHydrationWarning
          />
        )}
      </div>
    </div>
  )
}
