import { supabase } from './supabase'

export const postService = {
  // Get all posts with pagination and sorting
  async getPosts(options = {}) {
    const { 
      sortBy = 'created_at', 
      order = 'desc', 
      limit = 10, 
      offset = 0,
      userId = null 
    } = options

    console.log('getPosts called with options:', options)

    try {
      // For sorting by likes or comments, we need to get actual counts from related tables
      if (sortBy === 'likes_count' || sortBy === 'comments_count') {
        console.log('Fetching posts with actual counts for sorting...')
        
        // First get all posts with basic filter
        let query = supabase
          .from('posts')
          .select('*')

        if (userId) {
          query = query.eq('user_id', userId)
        }

        const { data: allPosts, error: postsError } = await query
        
        if (postsError) {
          console.error('getPosts error:', postsError)
          throw postsError
        }

        if (!allPosts || allPosts.length === 0) {
          return []
        }

        // Fetch actual counts for each post
        const postsWithCounts = await Promise.all(
          allPosts.map(async (post) => {
            // Get actual likes count
            const { count: actualLikesCount } = await supabase
              .from('likes')
              .select('*', { count: 'exact', head: true })
              .eq('post_id', post.post_id)
            
            // Get actual comments count
            const { count: actualCommentsCount } = await supabase
              .from('comments')
              .select('*', { count: 'exact', head: true })
              .eq('post_id', post.post_id)
            
            return {
              ...post,
              actual_likes_count: actualLikesCount || 0,
              actual_comments_count: actualCommentsCount || 0
            }
          })
        )

        // Sort by actual counts
        const sortedPosts = postsWithCounts.sort((a, b) => {
          const aValue = sortBy === 'likes_count' ? a.actual_likes_count : a.actual_comments_count
          const bValue = sortBy === 'likes_count' ? b.actual_likes_count : b.actual_comments_count
          return order === 'asc' ? aValue - bValue : bValue - aValue
        })

        // Apply pagination
        const paginatedPosts = sortedPosts.slice(offset, offset + limit)

        // Fetch related data for paginated posts
        const postsWithRelations = await Promise.all(
          paginatedPosts.map(async (post) => {
            // Fetch profile
            console.log('[postService] Fetching profile for user:', post.user_id)
            const { data: profile } = await supabase
              .from('profiles')
              .select('username, display_name, avatar_url')
              .eq('user_id', post.user_id)
              .single()
            
            // Fetch pokemon if exists
            let pokemon = null
            if (post.pokemon_id) {
              console.log('[postService] Fetching pokemon:', post.pokemon_id)
              const { data: pokemonData } = await supabase
                .from('pokemon')
                .select('*')
                .eq('pokemon_id', post.pokemon_id)
                .single()
              pokemon = pokemonData
            }
            
            return {
              ...post,
              likes_count: post.actual_likes_count,
              comments_count: post.actual_comments_count,
              profiles: profile,
              pokemon: pokemon
            }
          })
        )
        
        console.log('Posts with actual counts:', postsWithRelations)
        return postsWithRelations
      }

      // For other sorting (by created_at, etc.), use regular query
      let query = supabase
        .from('posts')
        .select('*')

      if (userId) {
        query = query.eq('user_id', userId)
      }

      query = query
        .order(sortBy, { ascending: order === 'asc' })
        .range(offset, offset + limit - 1)

      console.log('Executing simplified getPosts query...')
      const { data, error } = await query
      console.log('getPosts response:', { data, error, count: data?.length })

      if (error) {
        console.error('getPosts error:', error)
        throw error
      }
      
      console.log(`getPosts returned ${data?.length || 0} posts`)
      
      // If we get posts, fetch related data separately
      if (data && data.length > 0) {
        console.log('Fetching related profiles and pokemon...')
        
        const postsWithRelations = await Promise.all(
          data.map(async (post) => {
            // Fetch profile
            console.log('[postService] Fetching profile for user:', post.user_id)
            const { data: profile } = await supabase
              .from('profiles')
              .select('username, display_name, avatar_url')
              .eq('user_id', post.user_id)
              .single()
            
            // Fetch pokemon if exists
            let pokemon = null
            if (post.pokemon_id) {
              console.log('[postService] Fetching pokemon:', post.pokemon_id)
              const { data: pokemonData } = await supabase
                .from('pokemon')
                .select('*')
                .eq('pokemon_id', post.pokemon_id)
                .single()
              pokemon = pokemonData
            }
            
            return {
              ...post,
              profiles: profile,
              pokemon: pokemon
            }
          })
        )
        
        console.log('Posts with relations:', postsWithRelations)
        return postsWithRelations
      }
      
      return data || []
    } catch (err) {
      console.error('Caught error in getPosts:', err)
      throw err
    }
  },

  // Get single post by ID
  async getPostById(postId) {
    console.log('[postService] Getting post by ID:', postId)
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        profiles:user_id (username, display_name, avatar_url, bio),
        pokemon:pokemon_id (*)
      `)
      .eq('post_id', postId)
      .single()

    if (error) throw error
    return data
  },

  // Create new post
  async createPost(postData, userId) {
    console.log('Creating post with data:', postData, 'userId:', userId)
    
    if (!userId) {
      throw new Error('User ID is required to create a post')
    }
    
    try {
      console.log('Starting insert operation...')
      
      const insertData = {
        user_id: userId,
        content: postData.content,
        image_url: postData.image_url,
        pokemon_id: postData.pokemon_id,
        repost_id: postData.repost_id,
        repost_link: postData.repost_link
      }
      
      console.log('Insert payload:', insertData)
      
      console.log('[postService] Inserting post into database')
      const { data, error } = await supabase
        .from('posts')
        .insert(insertData)
        .select()
      
      console.log('Insert response:', { data, error })

      if (error) {
        console.error('Database insert error:', error)
        throw error
      }
      
      const post = Array.isArray(data) ? data[0] : data
      console.log('Post created successfully:', post)
      return post
    } catch (err) {
      console.error('Caught error in createPost:', err)
      throw err
    }
  },

  // Update post
  async updatePost(postId, updates) {
    console.log('[postService] Updating post:', postId, 'with:', updates)
    const { data, error } = await supabase
      .from('posts')
      .update(updates)
      .eq('post_id', postId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Delete post
  async deletePost(postId) {
    console.log('[postService] Deleting post:', postId)
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('post_id', postId)

    if (error) throw error
    return true
  },

  // Search posts
  async searchPosts(searchTerm) {
    console.log('[postService] Searching posts with term:', searchTerm)
    
    try {
      // Get all posts with relations
      const { data: allPosts, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:user_id (username, display_name),
          pokemon:pokemon_id (*)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Filter results client-side to search across all tables
      const searchLower = searchTerm.toLowerCase()
      const filteredPosts = allPosts.filter(post => {
        const contentMatch = post.content?.toLowerCase().includes(searchLower)
        const usernameMatch = post.profiles?.username?.toLowerCase().includes(searchLower)
        const displayNameMatch = post.profiles?.display_name?.toLowerCase().includes(searchLower)
        const pokemonNameMatch = post.pokemon?.name?.toLowerCase().includes(searchLower)
        
        return contentMatch || usernameMatch || displayNameMatch || pokemonNameMatch
      })
      console.log('Filtered posts:', filteredPosts)
      console.log('searchPosts response:', { count: filteredPosts.length })
      return filteredPosts
    } catch (error) {
      console.error('searchPosts error:', error)
      throw error
    }
  }
}
