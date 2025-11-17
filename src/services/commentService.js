import { supabase } from './supabase'

export const commentService = {
  // Get comments for a post
  async getCommentsByPost(postId) {
    console.log('[commentService] Getting comments for post:', postId)
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        profiles:user_id (username, display_name, avatar_url)
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true })

    if (error) throw error
    return data
  },

  // Create comment
  async createComment(commentData) {
    console.log('[commentService] Getting user for createComment')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    console.log('[commentService] Inserting comment:', commentData)
    const { data, error } = await supabase
      .from('comments')
      .insert({
        post_id: commentData.post_id,
        user_id: user.id,
        content: commentData.content,
        parent_id: commentData.parent_id || null
      })
      .select(`
        *,
        profiles:user_id (username, display_name, avatar_url)
      `)
      .single()

    if (error) throw error

    // Increment comments_count on post
    console.log('[commentService] Incrementing comments count for post:', commentData.post_id)
    await supabase.rpc('increment_comments_count', { 
      post_id: commentData.post_id 
    })

    return data
  },

  // Update comment
  async updateComment(commentId, content) {
    console.log('[commentService] Updating comment:', commentId)
    const { data, error } = await supabase
      .from('comments')
      .update({ content, updated_at: new Date().toISOString() })
      .eq('comment_id', commentId)
      .select(`
        *,
        profiles:user_id (username, display_name, avatar_url)
      `)
      .single()

    if (error) throw error
    return data
  },

  // Delete comment
  async deleteComment(commentId) {
    console.log('[commentService] Deleting comment:', commentId)
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('comment_id', commentId)

    if (error) throw error
    return true
  }
}
