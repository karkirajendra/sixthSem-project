import { useEffect, useMemo, useState } from 'react';
import { FiPlus, FiTrash2, FiEdit2, FiEye, FiUpload } from 'react-icons/fi';
import { adminApi, uploadSingleImage } from '../utils/adminApi';
import Modal from '../components/shared/Modal';
import toast from 'react-hot-toast';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const slugify = (s) =>
  String(s || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

const Blog = () => {
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [filter, setFilter] = useState('all');
  const [form, setForm] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category: 'General',
    tags: '',
    status: 'draft',
    featuredImage: '',
    seoMeta: { metaTitle: '', metaDescription: '', keywords: '' },
  });

  const load = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getBlogPosts();
      setPosts(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    if (filter === 'all') return posts;
    return posts.filter((p) => (p.status || '').toLowerCase() === filter);
  }, [posts, filter]);

  const statusCounts = useMemo(() => {
    const counts = { all: posts.length, published: 0, draft: 0, archived: 0 };
    posts.forEach((post) => {
      const status = (post.status || '').toLowerCase();
      if (status in counts) counts[status] += 1;
    });
    return counts;
  }, [posts]);

  const openCreate = () => {
    setEditing(null);
    setUploadingImage(false);
    setForm({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      category: 'General',
      tags: '',
      status: 'draft',
      featuredImage: '',
      seoMeta: { metaTitle: '', metaDescription: '', keywords: '' },
    });
    setIsModalOpen(true);
  };

  const openEdit = (post) => {
    setEditing(post);
    setUploadingImage(false);
    setForm({
      title: post.title || '',
      slug: post.slug || '',
      excerpt: post.excerpt || '',
      content: post.content || '',
      category: post.category || 'General',
      tags: Array.isArray(post.tags) ? post.tags.join(', ') : '',
      status: post.status || 'draft',
      featuredImage: post.featuredImage || '',
      seoMeta: {
        metaTitle: post.seoMeta?.metaTitle || '',
        metaDescription: post.seoMeta?.metaDescription || '',
        keywords: Array.isArray(post.seoMeta?.keywords)
          ? post.seoMeta.keywords.join(', ')
          : '',
      },
    });
    setIsModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('seoMeta.')) {
      const field = name.split('.')[1];
      setForm((prev) => ({
        ...prev,
        seoMeta: { ...prev.seoMeta, [field]: value },
      }));
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const res = await uploadSingleImage(file);
      if (res.success && res.url) {
        setForm(prev => ({ ...prev, featuredImage: res.url }));
        toast.success('Image uploaded successfully');
      } else {
        toast.error(res.error || 'Failed to upload image');
      }
    } catch (error) {
      toast.error('An error occurred during upload');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const payload = {
      title: form.title.trim(),
      slug: slugify(form.slug || form.title),
      excerpt: form.excerpt.trim(),
      content: form.content,
      category: form.category.trim() || 'General',
      tags: form.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      status: (form.status || 'draft').toLowerCase(),
      featuredImage: form.featuredImage.trim() || undefined,
      seoMeta: {
        metaTitle: form.seoMeta.metaTitle.trim() || undefined,
        metaDescription: form.seoMeta.metaDescription.trim() || undefined,
        keywords: form.seoMeta.keywords
          .split(',')
          .map((k) => k.trim())
          .filter(Boolean),
      },
    };

    setLoading(true);
    try {
      if (editing?._id) {
        const res = await adminApi.updateBlogPost(editing._id, payload);
        if (res.success) {
          toast.success('Blog post updated successfully');
          setIsModalOpen(false);
          await load();
        } else {
          toast.error(res.message || 'Failed to update blog post');
        }
        return;
      }
      const res = await adminApi.createBlogPost(payload);
      if (res.success) {
        toast.success('Blog post created successfully');
        setIsModalOpen(false);
        await load();
      } else {
        toast.error(res.message || 'Failed to create blog post');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (post) => {
    if (!post?._id) return;
    if (!window.confirm('Delete this blog post?')) return;
    setLoading(true);
    try {
      const res = await adminApi.deleteBlogPost(post._id);
      if (!res.success) {
        toast.error(res.message || 'Failed to delete blog post');
        return;
      }
      toast.success('Blog post deleted successfully');
      await load();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blog Posts</h1>
          <p className="text-sm text-gray-500">
            Create blog posts here. Published posts appear on the public website at{' '}
            <span className="font-mono">/blog</span>.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700"
        >
          <FiPlus className="mr-2" />
          New Post
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-card p-4 flex items-center justify-between">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-700">
            All: <span className="font-semibold">{statusCounts.all}</span>
          </span>
          <span className="px-2 py-1 rounded-full bg-green-100 text-green-700">
            Published: <span className="font-semibold">{statusCounts.published}</span>
          </span>
          <span className="px-2 py-1 rounded-full bg-amber-100 text-amber-700">
            Draft: <span className="font-semibold">{statusCounts.draft}</span>
          </span>
          <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-700">
            Archived: <span className="font-semibold">{statusCounts.archived}</span>
          </span>
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="form-select"
        >
          <option value="all">All</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      <div className="bg-white rounded-lg shadow-card overflow-hidden">
        <div className="divide-y divide-gray-200">
          {filtered.map((p) => (
            <div key={p._id} className="p-5 flex items-start justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-gray-900 truncate">{p.title}</h3>
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                    {p.status}
                  </span>
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  <span className="font-mono">/{p.slug}</span> • {p.category || 'General'}
                </div>
                {p.excerpt && (
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                    {p.excerpt}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 ml-4">
                <a
                  href={`${import.meta.env.VITE_PUBLIC_APP_URL || 'http://localhost:5173'}/blog/${p.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-full hover:bg-gray-100"
                  title="View on site"
                >
                  <FiEye />
                </a>
                <button
                  onClick={() => openEdit(p)}
                  className="p-2 rounded-full hover:bg-gray-100"
                  title="Edit"
                >
                  <FiEdit2 />
                </button>
                <button
                  onClick={() => handleDelete(p)}
                  className="p-2 rounded-full hover:bg-red-50 text-red-600"
                  title="Delete"
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
          ))}

          {!loading && filtered.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              No blog posts yet.
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editing ? 'Edit Blog Post' : 'New Blog Post'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              className="form-input w-full"
              required
              maxLength={150}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Slug</label>
              <input
                name="slug"
                value={form.slug}
                onChange={handleChange}
                className="form-input w-full"
                placeholder="auto-from-title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="form-select w-full"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <input
                name="category"
                value={form.category}
                onChange={handleChange}
                className="form-input w-full"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tags</label>
              <input
                name="tags"
                value={form.tags}
                onChange={handleChange}
                className="form-input w-full"
                placeholder="comma, separated, tags"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Featured image URL</label>
            <div className="flex gap-2">
              <input
                name="featuredImage"
                value={form.featuredImage}
                onChange={handleChange}
                className="form-input flex-1"
                placeholder="https://..."
              />
              <label className={`cursor-pointer inline-flex items-center px-4 py-2 ${uploadingImage ? 'bg-gray-200' : 'bg-gray-100 hover:bg-gray-200'} border border-gray-300 rounded-lg transition-colors`}>
                <FiUpload className={`mr-2 ${uploadingImage ? 'animate-bounce' : ''}`} />
                {uploadingImage ? 'Uploading...' : 'Upload'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploadingImage}
                />
              </label>
            </div>
            {form.featuredImage && (
              <div className="mt-2 text-xs text-gray-500">
                <a href={form.featuredImage} target="_blank" rel="noreferrer" className="text-primary-600 hover:underline">
                  Preview External URL
                </a>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Excerpt</label>
            <textarea
              name="excerpt"
              value={form.excerpt}
              onChange={handleChange}
              className="form-textarea w-full"
              rows={3}
              maxLength={300}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Content</label>
            <div className="h-64 mb-12">
              <ReactQuill
                theme="snow"
                value={form.content}
                onChange={(value) => setForm(prev => ({ ...prev, content: value }))}
                className="h-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">SEO Title</label>
              <input
                name="seoMeta.metaTitle"
                value={form.seoMeta.metaTitle}
                onChange={handleChange}
                className="form-input w-full"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">
                SEO Description
              </label>
              <input
                name="seoMeta.metaDescription"
                value={form.seoMeta.metaDescription}
                onChange={handleChange}
                className="form-input w-full"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">SEO Keywords</label>
            <input
              name="seoMeta.keywords"
              value={form.seoMeta.keywords}
              onChange={handleChange}
              className="form-input w-full"
              placeholder="comma, separated, keywords"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700"
              disabled={loading}
            >
              {editing ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Blog;

