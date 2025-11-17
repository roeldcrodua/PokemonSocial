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
      // Simplified query without joins first
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
        pokemon_id: postData.pokemon_id
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

  // Toggle like
  async toggleLike(postId) {
    console.log('[postService] Getting session for toggleLike:', postId)
    const sessionResponse = await supabase.auth.getSession()
    
    if (sessionResponse.error) {
      throw new Error('Failed to get session: ' + sessionResponse.error.message)
    }
    
    const session = sessionResponse.data?.session
    if (!session?.user) throw new Error('User not authenticated')
    
    const user = session.user

    // Check if already liked
    console.log('[postService] Checking existing like for post:', postId, 'user:', user.id)
    const { data: existingLike } = await supabase
      .from('likes')
      .select('like_id')
      .eq('post_id', postId)
      .eq('user_id', user.id)
      .single()

    if (existingLike) {
      // Unlike
      console.log('[postService] Deleting like:', existingLike.like_id)
      const { error } = await supabase
        .from('likes')
        .delete()
        .eq('like_id', existingLike.like_id)

      if (error) throw error

      // Decrement likes_count
      console.log('[postService] Decrementing likes count for post:', postId)
      await supabase.rpc('decrement_likes_count', { post_id: postId })

      return { liked: false }
    } else {
      // Like
      console.log('[postService] Inserting new like for post:', postId, 'user:', user.id)
      const { error } = await supabase
        .from('likes')
        .insert({ post_id: postId, user_id: user.id })

      if (error) throw error

      // Increment likes_count
      console.log('[postService] Incrementing likes count for post:', postId)
      await supabase.rpc('increment_likes_count', { post_id: postId })

      return { liked: true }
    }
  },

  // Search posts
  async searchPosts(searchTerm) {
    console.log('[postService] Searching posts with term:', searchTerm)
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        profiles:user_id (username, display_name, avatar_url),
        pokemon:pokemon_id (*)
      `)
      .or(`content.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  }
}
