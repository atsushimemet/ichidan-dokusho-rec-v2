declare global {
  interface Window {
    twttr: {
      ready: (callback: () => void) => void
      widgets: {
        createTweet: (tweetId: string, element: HTMLElement, options?: any) => Promise<any>
      }
    }
  }
}

export { }
