"use client";
import React, { useState, useEffect } from "react";

interface FormData {
  _id?: string;
  title: string;
  description: string;
  link?: string;
  date: string;
  slug: string;
  image?: File | null; // For file input
}

const DesignTemplate: React.FC = () => {
  const [form, setForm] = useState<FormData>({
    title: "",
    description: "",
    link: "",
    date: "",
    slug: "",
    image: null,
  });
  const [designs, setDesigns] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Fetch all designs
  const fetchDesigns = async () => {
    try {
      const res = await fetch("http://localhost:5000/olatinn/api/designs");
      if (!res.ok) throw new Error("Failed to fetch designs");
      const data = await res.json();
      setDesigns(data);
    } catch (error) {
      console.error("Error fetching designs:", error);
    }
  };

  useEffect(() => {
    fetchDesigns();
  }, []);

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, files } = e.target as HTMLInputElement;
    if (name === "image" && files) {
      setForm((prev) => ({ ...prev, image: files[0] }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Handle submit (create or update)
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("description", form.description);
      if (form.link) formData.append("link", form.link);
      formData.append("date", form.date);
      formData.append("slug", form.slug);
      if (form.image) formData.append("image", form.image);

      if (editingId) {
        // Update
        const res = await fetch(`http://localhost:5000/olatinn/api/designs/${editingId}`, {
          method: "PUT",
          body: formData,
        });
        if (!res.ok) throw new Error("Failed to update design");
      } else {
        // Create
        const res = await fetch("http://localhost:5000/olatinn/api/designs", {
          method: "POST",
          body: formData,
        });
        if (!res.ok) throw new Error("Failed to create design");
      }

      // Refresh list
      await fetchDesigns();

      // Reset form
      setForm({
        title: "",
        description: "",
        link: "",
        date: "",
        slug: "",
        image: null,
      });
      setEditingId(null);
    } catch (error) {
      console.error("Error submitting design:", error);
    }
  };

  // Handle edit
  const handleEdit = (design: any) => {
    setForm({
      _id: design._id,
      title: design.title,
      description: design.description,
      link: design.link,
      date: design.date?.slice(0, 10) || "",
      slug: design.slug,
      image: null, // user must re-upload if changing
    });
    setEditingId(design._id || null);
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:5000/olatinn/api/designs/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete design");
      await fetchDesigns();
    } catch (error) {
      console.error("Error deleting design:", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-[#5adfe8] rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-4">
        {editingId ? "Update Design Post" : "Create Design Post"}
      </h2>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 mb-6">
        <input
          type="text"
          name="title"
          placeholder="Design Title"
          value={form.title}
          onChange={handleChange}
          className="w-full border rounded-lg p-2"
          required
        />
        <textarea
          name="description"
          placeholder="Brief Description"
          value={form.description}
          onChange={handleChange}
          className="w-full border rounded-lg p-2"
          required
        />
        <input
          type="url"
          name="link"
          placeholder="Optional Link"
          value={form.link}
          onChange={handleChange}
          className="w-full border rounded-lg p-2"
        />
        <input
          type="date"
          name="date"
          value={form.date}
          onChange={handleChange}
          className="w-full border rounded-lg p-2"
        />
        <input
          type="text"
          name="slug"
          placeholder="Slug"
          value={form.slug}
          onChange={handleChange}
          className="w-full border rounded-lg p-2"
        />
        <input
          type="file"
          name="image"
          accept="image/*"
          onChange={handleChange}
          className="w-full border rounded-lg p-2"
        />

        <button
          type="submit"
          className="bg-[#000271] text-white py-2 rounded hover:bg-[#17acdd]"
        >
          {editingId ? "Update Design" : "Post Design"}
        </button>
      </form>

      {/* List of designs */}
      <div className="space-y-4">
        {designs.length === 0 ? (
          <p className="text-gray-500">No designs posted yet.</p>
        ) : (
          designs.map((design) => (
            <div
              key={design._id}
              className="p-4 border rounded-lg shadow-sm bg-gray-50"
            >
              <h3 className="text-xl font-semibold">{design.title}</h3>
              <p>{design.description}</p>
              {design.imageUrl && (
                <img
                  src={design.imageUrl}
                  alt={design.title}
                  className="w-full h-64 object-cover rounded mt-2"
                />
              )}
              {design.link && (
                <a
                  href={design.link}
                  target="_blank"
                  className="text-blue-600 underline"
                >
                  Visit Link
                </a>
              )}
              <p className="text-sm text-gray-400">Slug: {design.slug}</p>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => handleEdit(design)}
                  className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(design._id)}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DesignTemplate;
