import { useState } from 'react';
import { motion } from 'framer-motion';
import { Image as ImageIcon, Loader2, Plus, Pencil, Trash2 } from 'lucide-react';
import { useGallery } from '../context/GalleryContext.jsx';
import { useUserAuth } from '../context/UserAuthContext.jsx';
import { ManageGalleryImageForm } from '../components/admin/ManageGalleryImageForm.jsx';
import { Button } from '../components/ui/Button.jsx';

export default function GalleryPage() {
  const { images, loading, error, create, update, remove } = useGallery();
  const { role } = useUserAuth();
  const isAdmin = role === 'admin';
  const [showForm, setShowForm] = useState(false);
  const [editingImage, setEditingImage] = useState(null);

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 text-accent animate-spin" /></div>;
  if (error) return <div className="text-center py-20"><p className="text-danger">Error: {error}</p></div>;

  if (images.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-center py-20 space-y-6"
      >
        <div className="flex justify-center">
          <div className="w-24 h-24 rounded-full bg-surface-alt border-2 border-edge flex items-center justify-center text-5xl">
            🖼️
          </div>
        </div>
        <p className="text-ink-muted font-serif italic text-lg">
          Todavía no hay imágenes en la galería, ¡vuelve pronto!
        </p>
        {isAdmin && (
          <Button variant="success" onClick={() => setShowForm(true)}>
            <Plus className="w-5 h-5" /> Añadir imagen
          </Button>
        )}
        {showForm && (
          <ManageGalleryImageForm
            onClose={() => setShowForm(false)}
            onSave={create}
          />
        )}
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-serif font-semibold text-ink">🖼️ Galería de Imágenes</h2>
          <p className="text-lg text-ink-muted">Un recorrido visual por nuestra comunidad literaria.</p>
        </div>
        {isAdmin && (
          <Button variant="success" onClick={() => setShowForm(true)}>
            <Plus className="w-5 h-5" /> Añadir imagen
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {images.map((image) => (
          <motion.div key={image.id} className="bg-surface border border-edge rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 relative group">
            {isAdmin && (
              <div className="absolute top-2 right-2 flex gap-1.5 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => setEditingImage(image)}
                  className="p-1.5 rounded-full bg-gold-soft text-gold hover:opacity-80 transition shadow-md"
                  title="Editar imagen"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => remove(image.id)}
                  className="p-1.5 rounded-full bg-danger-soft text-danger hover:opacity-80 transition shadow-md"
                  title="Eliminar imagen"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
            <img src={image.url} alt={image.caption || 'Imagen de la galería'} className="w-full aspect-[4/3] object-cover" />
            {image.caption && <div className="p-4"><p className="text-sm text-ink-muted font-serif italic">{image.caption}</p></div>}
          </motion.div>
        ))}
      </div>

      {showForm && (
        <ManageGalleryImageForm
          onClose={() => setShowForm(false)}
          onSave={create}
        />
      )}
      {editingImage && (
        <ManageGalleryImageForm
          image={editingImage}
          onClose={() => setEditingImage(null)}
          onSave={(data) => update(editingImage.id, data)}
        />
      )}
    </motion.div>
  );
}