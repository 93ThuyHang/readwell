export const usePosts = () => {
  const posts = useState('posts', () => [])
  const statsData = useState('statsData', () => null)
  const featuredQuote = useState('featuredQuote', () => null)
  const pending = ref(false)
  const error = ref(null)

  const fetchAll = async () => {
    pending.value = true
    try {
      const [postsRes, statsRes] = await Promise.all([
        $fetch('/api/posts'),
        $fetch('/api/stats'),
      ])
      posts.value = postsRes as never[]
      statsData.value = (statsRes as { stats: never }).stats
      featuredQuote.value = (statsRes as { featuredQuote: never }).featuredQuote
    } catch (e: unknown) {
      error.value = e as never
    } finally {
      pending.value = false
    }
  }

  return { posts, statsData, featuredQuote, pending, error, fetchAll }
}
