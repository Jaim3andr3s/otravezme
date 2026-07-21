import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Trash2, Send, ShieldCheck, MessageSquareText, Loader2 } from 'lucide-react';
import { useForum } from '../context/ForumContext.jsx';
import { useUserAuth } from '../context/UserAuthContext.jsx';
import { useProfile } from '../context/ProfileContext.jsx';
import { FileUploadField } from '../components/ui/FileUploadField.jsx';
import { useUploadGuard } from '../hooks/useUploadGuard.js';
import { resolveFileUrl } from '../services/api.js';

function timeAgo(dateStr) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'ahora mismo';
  if (mins < 60) return `hace ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `hace ${days} d`;
  return new Date(dateStr).toLocaleDateString('es-CO', { dateStyle: 'medium' });
}

function Avatar({ name, avatar, isAdmin }) {
  if (isAdmin) {
    return (
      <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
        <ShieldCheck className="w-5 h-5 text-accent-ink" />
      </div>
    );
  }
  if (avatar) {
    return <img src={avatar} alt={name} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />;
  }
  return (
    <div className="w-10 h-10 rounded-full bg-surface-alt flex items-center justify-center flex-shrink-0 text-ink font-semibold">
      {name?.[0]?.toUpperCase() || '?'}
    </div>
  );
}

function CommentRow({ comment, postId, onRemove, canRemove }) {
  return (
    <div className="flex items-start gap-2 group">
      <Avatar name={comment.authorName} avatar={comment.authorAvatar} isAdmin={comment.isAdminComment} />
      <div className="flex-1 bg-surface-alt rounded-2xl px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-ink">{comment.authorName}</span>
          {comment.isAdminComment && <ShieldCheck className="w-3 h-3 text-accent" title="Administrador" />}
          <span className="text-xs text-ink-muted ml-auto">{timeAgo(comment.createdAt)}</span>
          {canRemove && (
            <button onClick={() => onRemove(postId, comment.id)} className="opacity-0 group-hover:opacity-100 transition text-ink-muted hover:text-danger">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <p className="text-sm text-ink whitespace-pre-wrap">{comment.content}</p>
      </div>
    </div>
  );
}

function PostCard({ post, isAdmin, myProfileId, onLike, onDelete, onComment, onRemoveComment }) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [sending, setSending] = useState(false);

  const canDeletePost = isAdmin || post.profileId === myProfileId;

  const handleSendComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSending(true);
    try {
      await onComment(post.id, commentText.trim());
      setCommentText('');
      setShowComments(true);
    } finally {
      setSending(false);
    }
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-surface border border-edge rounded-xl shadow-sm overflow-hidden"
    >
      <div className="p-4 flex items-start gap-3">
        <Avatar name={post.authorName} avatar={post.authorAvatar} isAdmin={post.isAdminPost} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-semibold text-ink">{post.authorName}</span>
            {post.isAdminPost && (
              <span className="text-xs bg-accent-soft text-accent px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Biblioteca
              </span>
            )}
          </div>
          <span className="text-xs text-ink-muted">{timeAgo(post.createdAt)}</span>
        </div>
        {canDeletePost && (
          <button onClick={() => onDelete(post.id)} className="text-ink-muted hover:text-danger transition" title="Eliminar publicación">
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      <p className="px-4 pb-3 text-ink whitespace-pre-wrap leading-relaxed">{post.content}</p>

      {post.imageUrl && (
        <div className="w-full max-h-[480px] overflow-hidden bg-surface-alt">
          <img src={resolveFileUrl(post.imageUrl)} alt="Imagen de la publicación" className="w-full h-full object-cover" />
        </div>
      )}

      <div className="px-4 py-2 flex items-center gap-4 border-t border-edge text-sm text-ink-muted">
        <button
          onClick={() => onLike(post.id)}
          className={`flex items-center gap-1.5 transition ${post.likedByMe ? 'text-danger font-semibold' : 'hover:text-danger'}`}
        >
          <Heart className={`w-4 h-4 ${post.likedByMe ? 'fill-current' : ''}`} />
          {post.likeCount > 0 ? post.likeCount : ''} Me gusta
        </button>
        <button onClick={() => setShowComments((v) => !v)} className="flex items-center gap-1.5 hover:text-accent transition">
          <MessageCircle className="w-4 h-4" />
          {post.commentCount > 0 ? post.commentCount : ''} Comentar
        </button>
      </div>

      {showComments && (
        <div className="px-4 pb-4 space-y-3 border-t border-edge pt-3">
          {post.comments.length === 0 && <p className="text-xs text-ink-muted">Sé el primero en comentar.</p>}
          {post.comments.map((c) => (
            <CommentRow
              key={c.id}
              comment={c}
              postId={post.id}
              onRemove={onRemoveComment}
              canRemove={isAdmin || c.profileId === myProfileId}
            />
          ))}
          <form onSubmit={handleSendComment} className="flex items-center gap-2">
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Escribe un comentario..."
              className="flex-1 p-2 text-sm border border-edge rounded-full bg-surface text-ink focus:ring-2 focus:ring-accent focus:outline-none"
            />
            <button type="submit" disabled={sending || !commentText.trim()} className="p-2 text-accent disabled:opacity-40">
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </form>
        </div>
      )}
    </motion.article>
  );
}

export default function ForumPage() {
  const { posts, loading, error, reload, create, remove, toggleLike, addComment, removeComment } = useForum();
  const { role } = useUserAuth();
  const { profile } = useProfile();
  const isAdmin = role === 'admin';

  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [showImageField, setShowImageField] = useState(false);
  const [posting, setPosting] = useState(false);
  const { isUploading, onUploadingChange } = useUploadGuard();

  useEffect(() => {
    reload();
  }, [reload]);

  const handlePost = async (e) => {
    e.preventDefault();
    if (!content.trim() || isUploading) return;
    setPosting(true);
    try {
      await create({ content: content.trim(), imageUrl: imageUrl || undefined });
      setContent('');
      setImageUrl('');
      setShowImageField(false);
    } finally {
      setPosting(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <MessageSquareText className="w-7 h-7 text-accent" />
        <div>
          <h1 className="text-3xl font-serif font-semibold text-ink">Foro de la comunidad</h1>
          <p className="text-sm text-ink-muted">Comparte lo que estás leyendo, haz preguntas, comenta las publicaciones de otros lectores.</p>
        </div>
      </div>

      <form onSubmit={handlePost} className="bg-surface border border-edge rounded-xl shadow-sm p-4 space-y-3">
        <div className="flex items-start gap-3">
          <Avatar name={isAdmin ? 'Biblioteca' : profile?.name} avatar={profile?.avatar} isAdmin={isAdmin} />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={isAdmin ? 'Publica un anuncio o comparte algo con la comunidad...' : '¿Qué estás leyendo hoy?'}
            className="flex-1 p-3 border border-edge rounded-lg bg-surface-alt/40 text-ink resize-none h-20 focus:ring-2 focus:ring-accent focus:outline-none"
          />
        </div>

        {!showImageField ? (
          <button type="button" onClick={() => setShowImageField(true)} className="text-sm font-semibold text-accent hover:underline">
            + Añadir una foto
          </button>
        ) : (
          <FileUploadField
            label="Foto (opcional)"
            kind="image"
            url={imageUrl}
            onUploaded={({ url }) => setImageUrl(url)}
            onUploadingChange={onUploadingChange}
          />
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={posting || isUploading || !content.trim()}
            className="px-5 py-2 bg-accent text-accent-ink font-semibold rounded-lg shadow-sm hover:bg-accent-hover transition disabled:opacity-50 flex items-center gap-2"
          >
            {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {isUploading ? 'Esperando la foto...' : 'Publicar'}
          </button>
        </div>
      </form>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      ) : error ? (
        <p className="text-center text-danger py-8">{error}</p>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 bg-surface rounded-xl border border-edge">
          <MessageSquareText className="w-14 h-14 text-ink-muted mx-auto mb-3" />
          <p className="text-ink-muted">Aún no hay publicaciones. ¡Sé el primero en compartir algo!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              isAdmin={isAdmin}
              myProfileId={profile?.id}
              onLike={toggleLike}
              onDelete={remove}
              onComment={addComment}
              onRemoveComment={removeComment}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}
