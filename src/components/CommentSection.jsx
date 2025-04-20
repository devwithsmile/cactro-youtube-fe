import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addComment, replyToComment, deleteComment } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { FaSpinner, FaCheck } from 'react-icons/fa';

export function CommentSection({ comments = [], isLoading }) {
  const [newComment, setNewComment] = useState('');
  const [replyText, setReplyText] = useState({});
  const [replyingTo, setReplyingTo] = useState(null);
  const [showCommentSuccess, setShowCommentSuccess] = useState(false);
  const [showReplySuccess, setShowReplySuccess] = useState({});
  const [deletingId, setDeletingId] = useState(null);
  const queryClient = useQueryClient();

  // Add a new comment
  const addCommentMutation = useMutation({
    mutationFn: addComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
      setNewComment('');
      setShowCommentSuccess(true);
      setTimeout(() => setShowCommentSuccess(false), 1000);
    },
  });

  // Reply to a comment
  const replyCommentMutation = useMutation({
    mutationFn: ({ commentId, text }) => replyToComment(commentId, text),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
      setReplyingTo(null);
      setReplyText({});
      setShowReplySuccess((prev) => ({ ...prev, [variables.commentId]: true }));
      setTimeout(() => setShowReplySuccess((prev) => ({ ...prev, [variables.commentId]: false })), 1000);
    },
  });

  // Delete a comment
  const deleteCommentMutation = useMutation({
    mutationFn: deleteComment,
    onMutate: (commentId) => {
      setDeletingId(commentId);
    },
    onSettled: () => {
      setDeletingId(null);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
    },
  });

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    addCommentMutation.mutate(newComment);
  };

  const handleReply = (commentId) => {
    if (!replyText[commentId]?.trim()) return;
    replyCommentMutation.mutate({
      commentId,
      text: replyText[commentId],
    });
  };

  const toggleReplyForm = (commentId) => {
    setReplyingTo(replyingTo === commentId ? null : commentId);
  };

  const handleDelete = (commentId) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      deleteCommentMutation.mutate(commentId);
    }
  };

  if (isLoading) {
    return <div className="p-4">Loading comments...</div>;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Comments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Comment Input */}
            <div className="space-y-2">
              <Textarea
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-20"
              />
              <Button 
                onClick={handleAddComment}
                disabled={!newComment.trim() || addCommentMutation.isPending}
              >
                {addCommentMutation.isPending ? (
                  <FaSpinner className="animate-spin mr-1 h-4 w-4" />
                ) : showCommentSuccess ? (
                  <FaCheck className="text-green-500 mr-1 h-4 w-4" />
                ) : (
                  'Post Comment'
                )}
              </Button>
            </div>

            {/* Comments List */}
            {comments.length > 0 ? (
              <div className="space-y-4 mt-6">
                {comments.map((comment) => (
                  <div key={comment.id} className="space-y-3">
                    {/* Main Comment */}
                    <div className="flex gap-3 p-3 rounded-md border">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={comment.authorProfileImageUrl} />
                        <AvatarFallback>{comment.authorDisplayName?.[0] || '?'}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold">{comment.authorDisplayName}</h4>
                            <p className="text-xs text-muted-foreground">
                              {new Date(comment.publishedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => toggleReplyForm(comment.commentId)}>
                            Reply
                          </Button>
                        </div>
                        <p className="mt-2">{comment.text}</p>
                        <div className="flex justify-end mt-2">
                          <Button variant="destructive" size="sm" onClick={() => handleDelete(comment.commentId)} disabled={deletingId === comment.commentId || deleteCommentMutation.isPending}>
                            {deletingId === comment.commentId && deleteCommentMutation.isPending ? (
                              <FaSpinner className="animate-spin mr-1 h-4 w-4" />
                            ) : 'Delete'}
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Reply Form */}
                    {replyingTo === comment.commentId && (
                      <div className="ml-10 space-y-2">
                        <Textarea
                          placeholder="Write a reply..."
                          value={replyText[comment.commentId] || ''}
                          onChange={(e) => setReplyText({ ...replyText, [comment.commentId]: e.target.value })}
                        />
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" size="sm" onClick={() => toggleReplyForm(null)}>
                            Cancel
                          </Button>
                          <Button 
                            size="sm"
                            onClick={() => handleReply(comment.commentId)}
                            disabled={!replyText[comment.commentId]?.trim() || replyCommentMutation.isPending}
                          >
                            {replyCommentMutation.isPending ? (
                              <FaSpinner className="animate-spin mr-1 h-4 w-4" />
                            ) : showReplySuccess[comment.commentId] ? (
                              <FaCheck className="text-green-500 mr-1 h-4 w-4" />
                            ) : (
                              'Post Reply'
                            )}
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Replies */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="ml-10 space-y-3">
                        {comment.replies.map((reply) => (
                          <div key={reply.id} className="flex gap-3 p-3 rounded-md bg-muted/50">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={reply.authorProfileImageUrl} />
                              <AvatarFallback>{reply.authorDisplayName?.[0] || '?'}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div>
                                <h4 className="font-semibold text-sm">{reply.authorDisplayName}</h4>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(reply.publishedAt).toLocaleDateString()}
                                </p>
                              </div>
                              <p className="mt-1 text-sm">{reply.text}</p>
                              <div className="flex justify-end mt-1">
                                <Button variant="destructive" size="sm" onClick={() => handleDelete(reply.id)} disabled={deletingId === reply.id || deleteCommentMutation.isPending}>
                                  {deletingId === reply.id && deleteCommentMutation.isPending ? (
                                    <FaSpinner className="animate-spin mr-1 h-4 w-4" />
                                  ) : 'Delete'}
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No comments yet. Be the first to comment!
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
