"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { FaHeart, FaCommentAlt, FaShareAlt, FaEdit, FaTrash } from "react-icons/fa";

const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// --- Types ---
interface User {
  _id: string;
  fullName?: string;
}

interface CommentType {
  _id: string;
  text: string | object;
  likes: number;
  user: User;
  replies?: CommentType[];
}

interface Design {
  _id: string;
  title: string | object;
  description: string | object;
  image?: string;
  link?: string;
  date: string;
  likes: number;
}

interface JwtPayload {
  id?: string;
  [key: string]: unknown;
}

// --- Utils ---
const parseJwt = (token: string): JwtPayload | null => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

const stringToColor = (str: string) => {
  if (!str) return "#6B7280";
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  const c = (hash & 0x00ffffff).toString(16).toUpperCase();
  return "#" + "00000".substring(0, 6 - c.length) + c;
};

const safeText = (value: string | object | undefined | null) =>
  typeof value === "string" ? value : value ? JSON.stringify(value) : "";

const getUserName = (user?: User) => (user?.fullName ? safeText(user.fullName) : "Unknown User");
const getUserInitials = (user?: User) => {
  if (!user?.fullName) return "U";
  return user.fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
};

// --- Recursive comment updater ---
const updateCommentsRecursively = (
  comments: CommentType[],
  commentId: string,
  updateFn: (comment: CommentType) => CommentType | null
): CommentType[] =>
  comments
    .map((c) => {
      if (c._id === commentId) return updateFn(c);
      if (c.replies) return { ...c, replies: updateCommentsRecursively(c.replies, commentId, updateFn) };
      return c;
    })
    .filter(Boolean) as CommentType[];

// --- CommentSection ---
interface CommentSectionProps {
  comments: CommentType[];
  setComments: React.Dispatch<React.SetStateAction<CommentType[]>>;
  currentUserId: string;
  designId: string;
}

const CommentSection: React.FC<CommentSectionProps> = ({ comments, setComments, currentUserId, designId }) => {
  const router = useRouter();
  const [activeReplyBox, setActiveReplyBox] = useState<string | null>(null);
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});
  const [commentInput, setCommentInput] = useState("");
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") setToken(localStorage.getItem("olatinnToken"));
  }, []);

  const handleLikeComment = async (commentId: string) => {
    if (!currentUserId) return router.push("/signup");
    setComments((prev) =>
      updateCommentsRecursively(prev, commentId, (c) => ({ ...c, likes: (c.likes || 0) + 1 }))
    );
    try {
      await fetch(`${baseUrl}/olatinn/api/designComments/like/${commentId}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditComment = async (commentId: string, oldText: string | object) => {
    if (typeof window === "undefined") return;
    const newText = prompt("Edit your comment", safeText(oldText));
    if (!newText || newText === safeText(oldText)) return;

    try {
      const res = await fetch(`${baseUrl}/olatinn/api/designComments/${commentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ text: newText }),
      });
      if (!res.ok) throw new Error("Failed to edit comment");
      const updatedComment: CommentType = await res.json();
      setComments((prev) => updateCommentsRecursively(prev, commentId, () => updatedComment));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (typeof window === "undefined") return;
    if (!confirm("Delete this comment?")) return;

    setComments((prev) => updateCommentsRecursively(prev, commentId, () => null));

    try {
      await fetch(`${baseUrl}/olatinn/api/designComments/${commentId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleReplySubmit = async (parentId: string) => {
    const text = replyInputs[parentId];
    if (!text?.trim()) return;

    try {
      const res = await fetch(`${baseUrl}/olatinn/api/designComments/reply/${parentId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error("Failed to reply");
      const newReply: CommentType = await res.json();
      setComments((prev) =>
        updateCommentsRecursively(prev, parentId, (c) => ({ ...c, replies: [newReply, ...(c.replies || [])] }))
      );
      setReplyInputs((prev) => ({ ...prev, [parentId]: "" }));
      setActiveReplyBox(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePostComment = async () => {
    if (!commentInput.trim()) return;
    try {
      const res = await fetch(`${baseUrl}/olatinn/api/designComments/${designId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ text: commentInput }),
      });
      if (!res.ok) throw new Error("Failed to post comment");
      const newComment: CommentType = await res.json();
      setComments((prev) => [newComment, ...prev]);
      setCommentInput("");
    } catch (err) {
      console.error(err);
    }
  };

  const CommentItem: React.FC<{ comment: CommentType }> = ({ comment }) => {
    if (!comment._id || !comment.user) return null;
    return (
      <div className="flex gap-3 items-start bg-gray-100 p-3 rounded-lg mt-2">
        <div
          className="w-10 h-10 flex items-center justify-center rounded-full text-white font-bold cursor-pointer"
          style={{ backgroundColor: stringToColor(getUserName(comment.user)) }}
        >
          {getUserInitials(comment.user)}
        </div>
        <div className="flex-1">
          <p className="font-semibold">{getUserName(comment.user)}</p>
          <p className="text-gray-700">{safeText(comment.text)}</p>
          <div className="flex gap-3 text-sm mt-1">
            <button onClick={() => handleLikeComment(comment._id)} className="flex items-center gap-1 text-red-500">
              <FaHeart /> {comment.likes || 0}
            </button>
            <button
              onClick={() => setActiveReplyBox(activeReplyBox === comment._id ? null : comment._id)}
              className="text-green-600"
            >
              Reply
            </button>
            {comment.user._id === currentUserId && (
              <>
                <button
                  onClick={() => handleEditComment(comment._id, comment.text)}
                  className="flex items-center gap-1 text-blue-500"
                >
                  <FaEdit /> Edit
                </button>
                <button
                  onClick={() => handleDeleteComment(comment._id)}
                  className="flex items-center gap-1 text-red-700"
                >
                  <FaTrash /> Delete
                </button>
              </>
            )}
          </div>
          {activeReplyBox === comment._id && (
            <div className="ml-12 mt-2">
              <textarea
                value={replyInputs[comment._id] || ""}
                onChange={(e) => setReplyInputs((prev) => ({ ...prev, [comment._id]: e.target.value }))}
                placeholder="Write a reply..."
                className="w-full border rounded p-2"
              />
              <button onClick={() => handleReplySubmit(comment._id)} className="bg-green-600 text-white px-3 py-1 mt-1 rounded">
                Post Reply
              </button>
            </div>
          )}
          {comment.replies?.map((r) =>
            r._id && r.user ? (
              <div key={r._id} className="ml-12">
                <CommentItem comment={r} />
              </div>
            ) : null
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div>
        <textarea
          value={commentInput}
          onChange={(e) => setCommentInput(e.target.value)}
          placeholder="Write a comment..."
          className="w-full border rounded p-2"
        />
        <button onClick={handlePostComment} className="bg-blue-600 text-white px-3 py-1 mt-2 rounded">
          Post Comment
        </button>
      </div>

      {comments.map((c) => (c._id && c.user ? <CommentItem key={c._id} comment={c} /> : null))}
    </div>
  );
};

// --- DesignPage ---
const DesignPage: React.FC = () => {
  const { id } = useParams();
  const router = useRouter();

  const [design, setDesign] = useState<Design | null>(null);
  const [comments, setComments] = useState<CommentType[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("olatinnToken");
      setToken(storedToken);
      if (storedToken) {
        const payload = parseJwt(storedToken);
        if (payload?.id) setCurrentUserId(payload.id as string);
      }
    }

    const fetchData = async () => {
      try {
        const [designRes, commentsRes] = await Promise.all([
          fetch(`${baseUrl}/olatinn/api/designs/${id}`),
          fetch(`${baseUrl}/olatinn/api/designComments/${id}`),
        ]);

        if (!designRes.ok) throw new Error("Failed to fetch design");
        if (!commentsRes.ok) throw new Error("Failed to fetch comments");

        const designData: Design = await designRes.json();
        const commentsData: CommentType[] = await commentsRes.json();

        // Safe guards
        if (!Array.isArray(commentsData)) setComments([]);
        else setComments(commentsData);

        // Ensure design.image and design.link are strings
        if (designData.image && typeof designData.image !== "string") designData.image = undefined;
        if (designData.link && typeof designData.link !== "string") designData.link = undefined;

        setDesign(designData);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, [id]);

  const handleLikeDesign = async () => {
    if (!currentUserId) return router.push("/signup");
    if (!design) return;

    setDesign({ ...design, likes: design.likes + 1 });

    try {
      const res = await fetch(`${baseUrl}/olatinn/api/designs/like/${id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to like design");
      const updatedDesign: Design = await res.json();
      setDesign(updatedDesign);
    } catch (err) {
      console.error(err);
    }
  };

  const handleShareDesign = () => {
    if (typeof window !== "undefined") {
      const url = `${window.location.origin}/designs/${id}`;
      navigator.clipboard.writeText(url);
      alert("Design link copied!");
    }
  };

  if (!design) return <div>Loading design...</div>;

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8">
  <div className="bg-white shadow-lg rounded-xl overflow-hidden">
    {/* Design Image */}
    {design.image && typeof design.image === "string" ? (
      <div className="relative w-full h-[400px]">
        <Image
          src={design.image}
          alt={typeof design.title === "string" ? design.title : "Design Image"}
          fill
          className="object-cover"
        />
      </div>
    ) : (
      <div className="flex items-center justify-center h-[400px] text-gray-400">
        No Image
      </div>
    )}

    <div className="p-6">
      {/* Title */}
      <h2 className="text-3xl font-bold">
        {typeof design.title === "string" ? design.title : "Untitled Design"}
      </h2>

      {/* Description */}
      <p className="mt-2 text-gray-700">
        {typeof design.description === "string" ? design.description : "No description available."}
      </p>

      {/* Link */}
      {design.link && typeof design.link === "string" && (
        <a
          href={design.link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          Visit Link
        </a>
      )}

      {/* Posted Date */}
      {design.date && typeof design.date === "string" && (
        <p className="text-sm text-gray-400 mt-1">
          Posted on: {new Date(design.date).toLocaleDateString()}
        </p>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4 mt-4">
        <button
          onClick={handleLikeDesign}
          className="flex items-center gap-1 text-red-500"
        >
          <FaHeart /> {typeof design.likes === "number" ? design.likes : 0}
        </button>
        <button className="flex items-center gap-1 text-green-600 cursor-default">
          <FaCommentAlt /> {Array.isArray(comments) ? comments.length : 0}
        </button>
        <button
          onClick={handleShareDesign}
          className="flex items-center gap-1 text-purple-600"
        >
          <FaShareAlt /> Share
        </button>
      </div>

      {/* Comments */}
      {Array.isArray(comments) && (
        <div className="mt-6">
          <CommentSection
            comments={comments}
            setComments={setComments}
            currentUserId={currentUserId}
            designId={typeof design._id === "string" ? design._id : ""}
          />
        </div>
      )}
    </div>
  </div>
</div>

  );
};

export default DesignPage;
