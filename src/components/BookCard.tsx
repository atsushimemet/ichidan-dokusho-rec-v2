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

  // Xポストの埋め込み処理
  useEffect(() => {
    if (!isMounted) return

    console.log('BookCard mounted, starting tweet load process for:', book.title)

    const loadTweet = () => {
      console.log('loadTweet called')
      console.log('window.twttr:', window.twttr)
      console.log('tweetRef.current:', tweetRef.current)

      if (typeof window === 'undefined' || !window.twttr || !tweetRef.current) {
        console.log('Missing requirements, setting isXPostLoaded to true')
        setIsXPostLoaded(true)
        return
      }

      // Tweet IDを正しく抽出
      const tweetId = extractTweetId(book.x_post_url)
      console.log('Extracted tweet ID:', tweetId)
      console.log('Original URL:', book.x_post_url)

      if (!tweetId) {
        console.warn('Invalid X post URL:', book.x_post_url)
        setIsXPostLoaded(true)
        return
      }

      console.log('Creating tweet widget for ID:', tweetId)

      window.twttr.widgets.createTweet(
        tweetId,
        tweetRef.current,
        {
          theme: 'light',
          width: '100%',
          align: 'center',
          conversation: 'none'
        }
      ).then((tweetElement) => {
        console.log('Tweet widget created, element:', tweetElement)
        if (tweetElement) {
          console.log('Tweet loaded successfully')
          setIsXPostLoaded(true)
        } else {
          console.warn('Failed to load tweet - no element returned')
          setIsXPostLoaded(true)
        }
      }).catch((error) => {
        console.error('Error loading tweet:', error)
        setIsXPostLoaded(true)
      })
    }

    // Twitter Widgets APIの読み込みを待つ
    if (window.twttr && window.twttr.ready) {
      console.log('Twitter API ready, loading tweet immediately')
      loadTweet()
    } else {
      console.log('Twitter API not ready, waiting...')
      // Twitter Widgets APIが読み込まれていない場合の処理
      const checkTwitterAPI = () => {
        if (window.twttr && window.twttr.ready) {
          console.log('Twitter API became ready, loading tweet')
          loadTweet()
        } else {
          console.log('Still waiting for Twitter API...')
          setTimeout(checkTwitterAPI, 100)
        }
      }
      checkTwitterAPI()
    }
  }, [book.x_post_url, isMounted])

  // Tweet IDを抽出する関数
  const extractTweetId = (url: string): string | null => {
    try {
      // X.com または twitter.com のURLからTweet IDを抽出
      const match = url.match(/(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/)
      return match ? match[1] : null
    } catch (error) {
      console.error('Error extracting tweet ID:', error)
      return null
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 mb-4 max-w-md mx-auto">
      {/* 書籍タイトル */}
      <h2 className="text-lg font-semibold text-gray-900 mb-3 leading-tight">
        {book.title}
      </h2>

      {/* Amazonリンク */}
      <div className="mb-4">
        <div className="relative inline-block group">
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
          
          {/* ツールチップ */}
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
            非アフィリエイトリンクです
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
          </div>
        </div>
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
        ) : (
          <div className="space-y-2">
            {/* 埋め込みエリア */}
            <div
              ref={tweetRef}
              className="min-h-[200px] transition-opacity duration-300"
              suppressHydrationWarning
            />
            
            {/* フォールバックリンク */}
            {isMounted && (
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
            )}
          </div>
        )}
      </div>
    </div>
  )
}
