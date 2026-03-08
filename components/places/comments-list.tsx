type Comment = {
  id: string
  body: string
  created_at: string
  user_id: string
}

export function CommentsList({ comments }: { comments: Comment[] }) {
  return (
    <div className='space-y-4'>
      {comments.map((comment) => (
        <article
          key={comment.id}
          className='rounded-3xl border border-zinc-800 bg-zinc-950 p-5'
        >
          <p className='text-base leading-7 text-zinc-300'>{comment.body}</p>
          <p className='mt-4 text-sm text-zinc-500'>
            {new Date(comment.created_at).toLocaleDateString('en-US')}
          </p>
        </article>
      ))}
    </div>
  )
}
