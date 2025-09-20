"use client";

import React, { useState, useEffect, ChangeEvent } from "react";
import { FaHeart, FaCommentAlt, FaShareAlt, FaEdit, FaTrash } from "react-icons/fa";
import { useRouter } from "next/navigation";

const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// Utility to convert string to consistent color
const stringToColor = (str: string) => {
  if (!str) return "#6B7280";
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  const c = (hash & 0x00ffffff).toString(16).toUpperCase();
  return "#" + "00000".substring(0, 6 - c.length) + c;
};

// Decode JWT to extract user ID
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

// Types
interface User {
  _id: string;
  fullName?: string;
  firstName?: string;
  name?: string;
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
  likes?: number;
}

// Helper to get display name safely
const getUserName = (user?: User) => user?.fullName || user?.firstName || user?.name || "User";

// Avatar component
const UserAvatar: React.FC<{ user?: User; size?: number; onClick?: () => void }> = ({
  user,
  size = 40,
  onClick,
}) => {
  const name = getUserName(user);
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
  return (
    <div
      onClick={onClick}
      className="flex items-center justify-center rounded-full text-white font-bold cursor-pointer select-none"
      style={{ width: size, height: size, backgroundColor: stringToColor(name) }}
    >
      {initials || "U"}
    </div>
  );
};

const DesignFeed: React.FC = () => {
  const router = useRouter();

  const [designs, setDesigns] = useState<Design[]>([]);
  const [comments, setComments] = useState<Record<string, CommentType[]>>({});
  const [activeCommentBox, setActiveCommentBox] = useState<string | null>(null);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [activeReplyBox, setActiveReplyBox] = useState<string | null>(null);
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});
  const [currentUserId, setCurrentUserId] = useState<string>("");

  useEffect(() => {
    const token = localStorage.getItem("olatinnToken");
    if (token) {
      const payload = parseJwt(token);
      if (payload?.id) setCurrentUserId(payload.id);
    }

    const fetchDesigns = async () => {
      try {
        const res = await fetch(`${baseUrl}/olatinn/api/designs`);
        if (!res.ok) throw new Error("Failed to fetch designs");
        const data: Design[] = await res.json();
        setDesigns(data);
        data.forEach((d) => fetchComments(d._id));
      } catch (error) {
        console.error("Error fetching designs:", error);
      }
    };
    fetchDesigns();
  }, []);

  const fetchComments = async (designId: string) => {
    try {
      const res = await fetch(`${baseUrl}/olatinn/api/designComments/${designId}`);
      if (!res.ok) throw new Error("Failed to fetch comments");
      const data: CommentType[] = await res.json();
      setComments((prev) => ({ ...prev, [designId]: data }));
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const handleInteraction = async (designId: string, action: "like" | "comment" | "share") => {
    if (!currentUserId) return router.push("/signup");
    if (action === "comment") return setActiveCommentBox(activeCommentBox === designId ? null : designId);
    if (action === "like") {
      try {
        const token = localStorage.getItem("olatinnToken");
        const res = await fetch(`${baseUrl}/olatinn/api/designs/like/${designId}`, {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to like design");
        const updatedDesign: Design = await res.json();
        setDesigns((prev) => prev.map((d) => (d._id === designId ? updatedDesign : d)));
      } catch (err) {
        console.error(err);
      }
    }
    if (action === "share") {
      navigator.clipboard.writeText(`${window.location.origin}/design/${designId}`);
      alert("Design link copied!");
    }
  };

  // Recursive Comment Component
  const CommentItem: React.FC<{ comment: CommentType; designId: string }> = ({ comment, designId }) => {
    const handleReply = () => setActiveReplyBox(activeReplyBox === comment._id ? null : comment._id);

    return (
      <div className="space-y-2">
        <div className="bg-gray-100 p-3 rounded-lg flex items-start gap-3">
          <UserAvatar user={comment.user} size={40} onClick={() => router.push("/dashboard")} />
          <div className="flex-1">
            <p className="font-medium text-gray-800">{getUserName(comment.user)}</p>
            <p className="text-gray-700">{comment.text}</p>
            <div className="flex gap-3 text-sm mt-2">
              <button
                className="flex items-center gap-1 text-red-500"
                onClick={async () => {
                  if (!currentUserId) return router.push("/signup");
                  try {
                    const token = localStorage.getItem("olatinnToken");
                    const res = await fetch(`${baseUrl}/olatinn/api/designComments/like/${comment._id}`, {
                      method: "PATCH",
                      headers: { Authorization: `Bearer ${token}` },
                    });
                    if (!res.ok) throw new Error("Failed to like comment");
                    const updated: CommentType = await res.json();
                    const updateComments = (comments: CommentType[]): CommentType[] =>
                      comments.map((c) =>
                        c._id === updated._id
                          ? updated
                          : { ...c, replies: c.replies ? updateComments(c.replies) : [] }
                      );
                    setComments((prev) => ({ ...prev, [designId]: updateComments(prev[designId]) }));
                  } catch (err) {
                    console.error(err);
                  }
                }}
              >
                <FaHeart /> {comment.likes || 0}
              </button>
              <button className="text-green-600" onClick={handleReply}>
                Reply
              </button>
              {comment.user._id === currentUserId && (
                <>
                  <button
                    className="text-blue-500 flex items-center gap-1"
                    onClick={() => {
                      const newText = prompt("Edit comment", comment.text);
                      if (!newText) return;
                      fetch(`${baseUrl}/olatinn/api/designComments/${comment._id}`, {
                        method: "PUT",
                        headers: {
                          "Content-Type": "application/json",
                          Authorization: `Bearer ${localStorage.getItem("olatinnToken")}`,
                        },
                        body: JSON.stringify({ text: newText }),
                      })
                        .then((res) => res.json())
                        .then((updated: CommentType) => {
                          const updateComments = (comments: CommentType[]): CommentType[] =>
                            comments.map((c) =>
                              c._id === updated._id
                                ? updated
                                : { ...c, replies: c.replies ? updateComments(c.replies) : [] }
                            );
                          setComments((prev) => ({ ...prev, [designId]: updateComments(prev[designId]) }));
                        });
                    }}
                  >
                    <FaEdit /> Edit
                  </button>
                  <button
                    className="text-red-700 flex items-center gap-1"
                    onClick={() => {
                      if (!confirm("Delete this comment?")) return;
                      fetch(`${baseUrl}/olatinn/api/designComments/${comment._id}`, {
                        method: "DELETE",
                        headers: { Authorization: `Bearer ${localStorage.getItem("olatinnToken")}` },
                      }).then(() => {
                        const deleteRecursively = (comments: CommentType[]): CommentType[] =>
                          comments
                            .filter((c) => c._id !== comment._id)
                            .map((c) => ({ ...c, replies: c.replies ? deleteRecursively(c.replies) : [] }));
                        setComments((prev) => ({ ...prev, [designId]: deleteRecursively(prev[designId]) }));
                      });
                    }}
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
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                    setReplyInputs((prev) => ({ ...prev, [comment._id]: e.target.value }))
                  }
                  placeholder="Write a reply..."
                  className="w-full border rounded p-2"
                />
                <button
                  className="bg-green-600 text-white px-3 py-1 rounded mt-1 hover:bg-green-700"
                  onClick={async () => {
                    if (!replyInputs[comment._id]?.trim()) return;
                    const token = localStorage.getItem("olatinnToken");
                    const res = await fetch(`${baseUrl}/olatinn/api/designComments/reply/${comment._id}`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                      body: JSON.stringify({ text: replyInputs[comment._id] }),
                    });
                    const newReply: CommentType = await res.json();
                    const addReply = (comments: CommentType[]): CommentType[] =>
                      comments.map((c) =>
                        c._id === comment._id
                          ? { ...c, replies: [newReply, ...(c.replies || [])] }
                          : { ...c, replies: c.replies ? addReply(c.replies) : [] }
                      );
                    setComments((prev) => ({ ...prev, [designId]: addReply(prev[designId]) }));
                    setReplyInputs((prev) => ({ ...prev, [comment._id]: "" }));
                    setActiveReplyBox(null);
                  }}
                >
                  Post Reply
                </button>
              </div>
            )}

            {/* Nested Replies */}
            {comment.replies?.map((r) => (
              <div key={r._id} className="ml-12">
                <CommentItem comment={r} designId={designId} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 p-4">
      {designs.map((design) => (
        <div key={design._id} className="bg-white shadow-lg rounded-2xl overflow-hidden">
          <div className="w-full h-[500px] md:h-[600px] bg-gray-200">
            {design.image ? (
              <img src={design.image} alt={design.title} className="w-full h-full object-cover" />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">No Image</div>
            )}
          </div>

          <div className="p-8">
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900">{design.title}</h2>
            <p className="mt-4 text-lg md:text-xl text-gray-700">{design.description}</p>
            {design.link && (
              <a href={design.link} target="_blank" rel="noopener noreferrer" className="inline-block mt-3 text-blue-600">
                Visit Link
              </a>
            )}
            <div className="flex gap-6 mt-6">
              <button onClick={() => handleInteraction(design._id, "like")} className="flex items-center gap-2 text-gray-600">
                <FaHeart /> {design.likes || 0}
              </button>
              <button onClick={() => handleInteraction(design._id, "comment")} className="flex items-center gap-2 text-gray-600">
                <FaCommentAlt /> {comments[design._id]?.length || 0}
              </button>
              <button onClick={() => handleInteraction(design._id, "share")} className="flex items-center gap-2 text-gray-600">
                <FaShareAlt />
              </button>
            </div>

            {activeCommentBox === design._id && (
              <div className="mt-6 border-t pt-4">
                {comments[design._id]?.map((c) => (
                  <CommentItem key={c._id} comment={c} designId={design._id} />
                ))}

                {/* New comment */}
                <div className="mt-4">
                  <textarea
                    value={commentInputs[design._id] || ""}
                    onChange={(e) => setCommentInputs((prev) => ({ ...prev, [design._id]: e.target.value }))}
                    placeholder="Write a comment..."
                    className="w-full border rounded-lg p-2"
                  />
                  <button
                    onClick={() => {
                      if (!commentInputs[design._id]?.trim()) return;
                      const token = localStorage.getItem("olatinnToken");
                      fetch(`${baseUrl}/olatinn/api/designComments/${design._id}`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                        body: JSON.stringify({ text: commentInputs[design._id] }),
                      })
                        .then((res) => res.json())
                        .then((newComment: CommentType) => {
                          setComments((prev) => ({
                            ...prev,
                            [design._id]: [newComment, ...(prev[design._id] || [])],
                          }));
                          setCommentInputs((prev) => ({ ...prev, [design._id]: "" }));
                        });
                    }}
                    className="bg-[#000271] text-white px-4 py-2 rounded mt-2 hover:bg-[#17acdd]"
                  >
                    Post Comment
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default DesignFeed;
