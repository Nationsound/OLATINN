"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

const API_BASE = "http://localhost:5000/olatinn/api/blogs"; 

const AdminBlogForm = () => {
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    category: "",
    content: "",
    author: "",
  });
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [blogs, setBlogs] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  // fetch blogs
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await fetch(API_BASE);
        const data = await res.json();
        setBlogs(data);
      } catch (err) {
        console.error("Error fetching blogs:", err);
      }
    };
    fetchBlogs();
  }, []);

  // handle text input
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // handle image upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  // submit (create or update)
  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  const data = new FormData();
  data.append("title", formData.title);
  data.append("slug", formData.slug);
  data.append("category", formData.category);
  data.append("content", formData.content);
  data.append("author", formData.author);
  if (image) data.append("image", image);

  try {
    const url = editingId ? `${API_BASE}/${editingId}` : API_BASE;
    const method = editingId ? "PUT" : "POST";

    const res = await fetch(url, { method, body: data });

    if (!res.ok) {
      const text = await res.text(); // raw error text (HTML or JSON)
      throw new Error(text);
    }

    const result = await res.json();

    alert(editingId ? "Blog updated successfully!" : "Blog saved successfully!");

    // Update frontend list
    setBlogs(prev =>
      editingId ? prev.map(b => (b._id === editingId ? result : b)) : [result, ...prev]
    );

    // Reset form
    setFormData({ title: "", slug: "", category: "", content: "", author: "" });
    setImage(null);
    setPreview(null);
    setEditingId(null);

  } catch (err: unknown) {
  let errorMessage = "Unknown error";
  if (err instanceof Error) {
    errorMessage = err.message;
  } else if (typeof err === "string") {
    errorMessage = err;
  }
  console.error("Save failed:", err);
  alert("Failed to save blog: " + errorMessage);
  }
};


  // delete blog
  const handleDelete = async (id: string) => {
    if (!confirm("Delete this blog?")) return;
    try {
      const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete blog");
      setBlogs((prev) => prev.filter((b) => b._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // edit blog
  
const handleEdit = (blog: any) => {
  setEditingId(blog._id);
  setFormData({
    title: blog.title,
    slug: blog.slug,
    category: blog.category,
    content: blog.content,
    author: blog.author,
  });
  setPreview(blog.imageUrl || null);
};


  return (
    <motion.div
      className="max-w-3xl mx-auto p-6 bg-white dark:bg-[#5adfe8] rounded-xl shadow-md"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h2 className="text-2xl font-bold mb-6 text-[#000271]">
        {editingId ? "Edit Blog Post" : "Create Blog Post"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="w-full border rounded-lg p-2"
          placeholder="Enter blog title"
          required
        />

        {/* Slug */}
        <input
          type="text"
          name="slug"
          value={formData.slug}
          onChange={handleChange}
          className="w-full border rounded-lg p-2"
          placeholder="unique-url-slug"
          required
        />

        {/* Category */}
        <input
          type="text"
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="w-full border rounded-lg p-2"
          placeholder="e.g. News, Tech, Lifestyle"
        />

        {/* Author */}
        <input
          type="text"
          name="author"
          value={formData.author}
          onChange={handleChange}
          className="w-full border rounded-lg p-2"
          placeholder="Author name"
        />

        {/* Image Upload */}
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="w-full border rounded-lg p-2 cursor-pointer bg-gray-50"
        />
        {preview && (
          <Image
            src={preview}
            alt="Preview"
            width={200}
            height={180}
            className="h-40 w-full object-cover rounded-lg border"
          />
        )}

        {/* Content */}
        <textarea
          name="content"
          value={formData.content}
          onChange={handleChange}
          rows={6}
          className="w-full border rounded-lg p-2"
          placeholder="Write your blog content here..."
          required
        ></textarea>

        {/* Submit */}
        <motion.button
          type="submit"
          className="bg-[#000271] text-white px-4 py-2 rounded-lg shadow hover:bg-[#5adfe8]"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {editingId ? "Update Blog" : "Submit Blog"}
        </motion.button>
      </form>

      {/* Blog List */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4 text-[#000271]">All Blogs</h3>
        <ul className="space-y-3 max-h-64 overflow-y-auto">
          {blogs.map((blog) => (
            <li
              key={blog._id}
              className="p-3 border rounded-lg flex justify-between items-center bg-gray-50"
            >
              <div className="flex items-center gap-3">
                {blog.imageUrl && (
                  <Image
                    src={blog.imageUrl}
                    alt={blog.title}
                    width={60}
                    height={50}
                    className="object-cover rounded-md"
                  />
                )}
                <span className="font-medium">{blog.title}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(blog)}
                  className="text-blue-600 hover:underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(blog._id)}
                  className="text-red-600 hover:underline"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
};

export default AdminBlogForm;
