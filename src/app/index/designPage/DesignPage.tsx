"use client";

import React, { useState, useEffect, ChangeEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { FaHeart, FaCommentAlt, FaShareAlt, FaEdit, FaTrash } from "react-icons/fa";

const baseUrl = process.env.NEXT_PUBLIC_API_URL;

interface User {
  _id: string;
  fullName: string;
}

interface CommentType {
  _id: string;
  text: string;
  likes: number;
  user: User;
  replies?: CommentType[];
}

interface Design {
  _id: string;
  title: string;
  description: string;
  image?: string;
  link?: string;
  date: string;
  likes: number;
}

const stringToColor = (str: string) => {
  if (!str) return "#6B7280";
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  const c = (hash & 0x00ffffff).toString(16).toUpperCase();
  return "#" + "00000".substring(0, 6 - c.length) + c;
};

const parseJwt = (token: string) => {
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

const DesignPage: React.FC = () => {
  const { id } = useParams();
  const router = useRouter();

  const [design, setDesign] = useState<Design | null>(null);
  const [comments, setComments] = useState<CommentType[]>([]);
  const [activeReplyBox, setActiveReplyBox] = useState<string | null>(null);
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});
  const [commentInput, setCommentInput] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string>("");

  const getUserName = (user: User) => user?.fullName || "Unknown User";
  const getUserInitials = (user: User) =>
    user?.fullName
      ? user.fullName
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
      : "U";

  useEffect(() => {
    const token = localStorage.getItem("olatinnToken");
    if (token) {
      const payload = parseJwt(token);
      if (payload?.id) setCurrentUserId(payload.id);
    }

    const fetchDesign = async () => {
      try {
        const res = await fetch(`${baseUrl}/olatinn/api/designs/${id}`);
        if (!res.ok) throw new Error("Failed to fetch design");
        const data: Design = await res.json();
        setDesign(data);

        const commentsRes = await fetch(`${baseUrl}/olatinn/api/designComments/${id}`);
        if (!commentsRes.ok) throw new Error("Failed to fetch comments");
        const commentsData: CommentType[] = await commentsRes.json();
        setComments(commentsData);
      } catch (err) {
        console.error(err);
      }
    };
    fetchDesign();
  }, [id]);

  // --- Design Actions ---
  const handleLikeDesign = async () => {
    if (!currentUserId) return router.push("/signup");
    try {
      const token = localStorage.getItem("olatinnToken");
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

  // --- Comment Actions ---
  const handleCommentSubmit = async () => {
    if (!commentInput.trim()) return;
    try {
      const token = localStorage.getItem("olatinnToken");
      const res = await fetch(`${baseUrl}/olatinn/api/designComments/${id}`, {
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

  const handleLikeComment = async (commentId: string) => {
    if (!currentUserId) return router.push("/signup");
    try {
      const token = localStorage.getItem("olatinnToken");
      const res = await fetch(`${baseUrl}/olatinn/api/designComments/like/${commentId}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to like comment");
      const updatedComment: CommentType = await res.json();
      const updateComments = (comments: CommentType[]): CommentType[] =>
        comments.map((c) =>
          c._id === commentId
            ? updatedComment
            : { ...c, replies: c.replies ? updateComments(c.replies) : [] }
        );
      setComments((prev) => updateComments(prev));
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditComment = async (commentId: string, oldText: string) => {
    const newText = prompt("Edit your comment", oldText);
    if (!newText) return;
    try {
      const token = localStorage.getItem("olatinnToken");
      const res = await fetch(`${baseUrl}/olatinn/api/designComments/${commentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ text: newText }),
      });
      if (!res.ok) throw new Error("Failed to edit comment");
      const updatedComment: CommentType = await res.json();
      const updateComments = (comments: CommentType[]): CommentType[] =>
        comments.map((c) =>
          c._id === commentId
            ? updatedComment
            : { ...c, replies: c.replies ? updateComments(c.replies) : [] }
        );
      setComments((prev) => updateComments(prev));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;
    try {
      const token = localStorage.getItem("olatinnToken");
      const res = await fetch(`${baseUrl}/olatinn/api/designComments/${commentId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete comment");
      const removeComment = (comments: CommentType[]): CommentType[] =>
        comments.filter((c) => c._id !== commentId).map((c) => ({
          ...c,
          replies: c.replies ? removeComment(c.replies) : [],
        }));
      setComments((prev) => removeComment(prev));
    } catch (err) {
      console.error(err);
    }
  };

  const handleReplySubmit = async (parentId: string) => {
    const text = replyInputs[parentId];
    if (!text?.trim()) return;
    try {
      const token = localStorage.getItem("olatinnToken");
      const res = await fetch(`${baseUrl}/olatinn/api/designComments/reply/${parentId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error("Failed to post reply");
      const newReply: CommentType = await res.json();

      const insertReply = (comments: CommentType[]): CommentType[] =>
        comments.map((c) =>
          c._id === parentId
            ? { ...c, replies: [newReply, ...(c.replies || [])] }
            : { ...c, replies: c.replies ? insertReply(c.replies) : [] }
        );

      setComments((prev) => insertReply(prev));
      setReplyInputs((prev) => ({ ...prev, [parentId]: "" }));
      setActiveReplyBox(null);
    } catch (err) {
      console.error(err);
    }
  };

  // --- Recursive Comment Component ---
  const CommentItem: React.FC<{ comment: CommentType }> = ({ comment }) => (
    <div className="flex gap-3 items-start bg-gray-100 p-3 rounded-lg mt-2">
      <div
        className="w-10 h-10 flex items-center justify-center rounded-full text-white font-bold cursor-pointer"
        style={{ backgroundColor: stringToColor(comment.user.fullName) }}
      >
        {getUserInitials(comment.user)}
      </div>
      <div className="flex-1">
        <p className="font-semibold">{getUserName(comment.user)}</p>
        <p className="text-gray-700">{comment.text}</p>
        <div className="flex gap-3 text-sm mt-1">
          <button
            onClick={() => handleLikeComment(comment._id)}
            className="flex items-center gap-1 text-red-500"
          >
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

        {/* Reply Input */}
        {activeReplyBox === comment._id && (
          <div className="ml-12 mt-2">
            <textarea
              value={replyInputs[comment._id] || ""}
              onChange={(e) =>
                setReplyInputs((prev) => ({ ...prev, [comment._id]: e.target.value }))
              }
              placeholder="Write a reply..."
              className="w-full border rounded p-2"
            />
            <button
              onClick={() => handleReplySubmit(comment._id)}
              className="bg-green-600 text-white px-3 py-1 mt-1 rounded"
            >
              Post Reply
            </button>
          </div>
        )}

        {/* Render Replies recursively */}
        {comment.replies?.map((r) => (
          <div key={r._id} className="ml-12">
            <CommentItem comment={r} />
          </div>
        ))}
      </div>
    </div>
  );

  if (!design) return <div>Loading design...</div>;

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8">
      <div className="bg-white shadow-lg rounded-xl overflow-hidden">
        {design.image ? (
          <img src={design.image} alt={design.title} className="w-full h-[400px] object-cover" />
        ) : (
          <div className="flex items-center justify-center h-[400px] text-gray-400">No Image</div>
        )}
        <div className="p-6">
          <h2 className="text-3xl font-bold">{design.title}</h2>
          <p className="mt-2 text-gray-700">{design.description}</p>
          {design.link && (
            <a href={design.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              Visit Link
            </a>
          )}
          <p className="text-sm text-gray-400 mt-1">Posted on: {new Date(design.date).toLocaleDateString()}</p>

          {/* Actions */}
          <div className="flex gap-4 mt-4">
            <button onClick={handleLikeDesign} className="flex items-center gap-1 text-red-500">
              <FaHeart /> {design.likes || 0}
            </button>
            <button
              onClick={() => setActiveReplyBox(activeReplyBox === "main" ? null : "main")}
              className="flex items-center gap-1 text-green-600"
            >
              <FaCommentAlt /> {comments.length}
            </button>
            <button onClick={handleShareDesign} className="flex items-center gap-1 text-purple-600">
              <FaShareAlt /> Share
            </button>
          </div>

          {/* Comment Box */}
          {activeReplyBox === "main" && (
            <div className="mt-4 space-y-4">
              <div>
                <textarea
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  placeholder="Write a comment..."
                  className="w-full border rounded p-2"
                />
                <button onClick={handleCommentSubmit} className="bg-blue-600 text-white px-3 py-1 mt-2 rounded">
                  Post Comment
                </button>
              </div>

              {/* Comments List */}
              {comments.map((c) => (
                <CommentItem key={c._id} comment={c} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DesignPage;
