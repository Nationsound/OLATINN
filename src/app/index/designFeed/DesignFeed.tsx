"use client";

import React, { useState, useEffect, ChangeEvent, useCallback } from "react";
import { FaHeart, FaCommentAlt, FaShareAlt, FaEdit, FaTrash } from "react-icons/fa";
import { useRouter } from "next/navigation";
import Image from "next/image";

const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// Utility: convert string to color
const stringToColor = (str: string) => {
  if (!str) return "#6B7280";
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  const c = (hash & 0x00ffffff).toString(16).toUpperCase();
  return "#" + "00000".substring(0, 6 - c.length) + c;
};

// JWT payload type
interface JwtPayload {
  id?: string;
  [key: string]: string | number | boolean | undefined;
}

// Decode JWT
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

// Helper: get display name
const getUserName = (user?: User) => user?.fullName || user?.firstName || user?.name || "User";

// Helper: authorized fetch
const authorizedFetch = async <T = unknown>(
  url: string,
  method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE" = "GET",
  body?: Record<string, unknown>
): Promise<T> => {
  const token = localStorage.getItem("olatinnToken");
  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  return res.json() as Promise<T>;
};

// Avatar Component
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

// Recursive comment update helper
const updateCommentTree = (comments: CommentType[], updated: CommentType): CommentType[] =>
  comments.map((c) =>
    c._id === updated._id
      ? updated
      : { ...c, replies: c.replies ? updateCommentTree(c.replies, updated) : [] }
  );

const DesignFeed: React.FC = () => {
  const router = useRouter();

  const [designs, setDesigns] = useState<Design[]>([]);
  const [comments, setComments] = useState<Record<string, CommentType[]>>({});
  const [activeCommentBox, setActiveCommentBox] = useState<Design["_id"] | null>(null);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [activeReplyBox, setActiveReplyBox] = useState<CommentType["_id"] | null>(null);
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});
  const [currentUserId, setCurrentUserId] = useState<string>("");

  // Fetch comments
  const fetchComments = useCallback(async (designId: string) => {
    try {
      const data = await authorizedFetch<CommentType[]>(`${baseUrl}/olatinn/api/designComments/${designId}`);
      setComments((prev) => ({ ...prev, [designId]: data }));
    } catch (err) {
      console.error(err);
    }
  }, []);

  // Fetch current user and designs
  useEffect(() => {
    const token = localStorage.getItem("olatinnToken");
    if (token) {
      const payload = parseJwt(token);
      if (payload?.id) setCurrentUserId(payload.id);
    }

    const fetchDesigns = async () => {
      try {
        const data = await authorizedFetch<Design[]>(`${baseUrl}/olatinn/api/designs`);
        setDesigns(data);

        // Fetch comments for each design
        data.forEach((d) => fetchComments(d._id));
      } catch (err) {
        console.error(err);
      }
    };

    fetchDesigns();
  }, [fetchComments]);

  // Handle interactions
  const handleInteraction = async (designId: string, action: "like" | "comment" | "share") => {
    if (!currentUserId) return router.push("/signup");

    if (action === "comment") {
      setActiveCommentBox(activeCommentBox === designId ? null : designId);
    }

    if (action === "like") {
      try {
        const updated = await authorizedFetch<Design>(`${baseUrl}/olatinn/api/designs/like/${designId}`, "PATCH");
        setDesigns((prev) => prev.map((d) => (d._id === designId ? updated : d)));
      } catch (err) {
        console.error(err);
      }
    }

    if (action === "share") {
      navigator.clipboard.writeText(`${window.location.origin}/design/${designId}`);
      alert("Design link copied!");
    }
  };

  // Comment item recursive component
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
              {/* Like comment */}
              <button
                className="flex items-center gap-1 text-red-500"
                onClick={async () => {
                  if (!currentUserId) return router.push("/signup");
                  try {
                    const updated = await authorizedFetch<CommentType>(
                      `${baseUrl}/olatinn/api/designComments/like/${comment._id}`,
                      "PATCH"
                    );
                    setComments((prev) => ({
                      ...prev,
                      [designId]: updateCommentTree(prev[designId], updated),
                    }));
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

              {/* Edit/Delete own comment */}
              {comment.user._id === currentUserId && (
                <>
                  <button
                    className="text-blue-500 flex items-center gap-1"
                    onClick={async () => {
                      const newText = prompt("Edit comment", comment.text);
                      if (!newText) return;
                      const updated = await authorizedFetch<CommentType>(
                        `${baseUrl}/olatinn/api/designComments/${comment._id}`,
                        "PUT",
                        { text: newText }
                      );
                      setComments((prev) => ({
                        ...prev,
                        [designId]: updateCommentTree(prev[designId], updated),
                      }));
                    }}
                  >
                    <FaEdit /> Edit
                  </button>

                  <button
                    className="text-red-700 flex items-center gap-1"
                    onClick={async () => {
                      if (!confirm("Delete this comment?")) return;
                      await authorizedFetch(`${baseUrl}/olatinn/api/designComments/${comment._id}`, "DELETE");
                      const deleteRecursively = (comments: CommentType[]): CommentType[] =>
                        comments
                          .filter((c) => c._id !== comment._id)
                          .map((c) => ({ ...c, replies: c.replies ? deleteRecursively(c.replies) : [] }));
                      setComments((prev) => ({ ...prev, [designId]: deleteRecursively(prev[designId]) }));
                    }}
                  >
                    <FaTrash /> Delete
                  </button>
                </>
              )}
            </div>

            {/* Reply box */}
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
                    const newReply = await authorizedFetch<CommentType>(
                      `${baseUrl}/olatinn/api/designComments/reply/${comment._id}`,
                      "POST",
                      { text: replyInputs[comment._id] }
                    );
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

            {/* Nested replies */}
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

  // Comment input change handler
  const handleCommentChange = (designId: string) => (e: ChangeEvent<HTMLTextAreaElement>) => {
    setCommentInputs((prev) => ({ ...prev, [designId]: e.target.value }));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 p-4">
  {Array.isArray(designs) &&
    designs.map((design) => (
      <div key={String(design._id)} className="bg-white shadow-lg rounded-2xl overflow-hidden">
        {/* Image */}
        <div className="w-full h-[500px] md:h-[600px] relative bg-gray-200">
          {design.image && typeof design.image === "string" ? (
            <Image
              src={design.image}
              alt={typeof design.title === "string" ? design.title : "Design image"}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              No Image
            </div>
          )}
        </div>

        {/* Text */}
        <div className="p-8">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900">
            {typeof design.title === "string" ? design.title : "Untitled Design"}
          </h2>
          <p className="mt-4 text-lg md:text-xl text-gray-700">
            {typeof design.description === "string"
              ? design.description
              : "No description available."}
          </p>

          {design.link && typeof design.link === "string" && (
            <a
              href={design.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-3 text-blue-600"
            >
              Visit Link
            </a>
          )}

          {/* Buttons */}
          <div className="flex gap-6 mt-6">
            <button
              onClick={() => handleInteraction(design._id, "like")}
              className="flex items-center gap-2 text-gray-600"
            >
              <FaHeart /> {typeof design.likes === "number" ? design.likes : 0}
            </button>
            <button
              onClick={() => handleInteraction(design._id, "comment")}
              className="flex items-center gap-2 text-gray-600"
            >
              <FaCommentAlt />{" "}
              {Array.isArray(comments[design._id]) ? comments[design._id].length : 0}
            </button>
            <button
              onClick={() => handleInteraction(design._id, "share")}
              className="flex items-center gap-2 text-gray-600"
            >
              <FaShareAlt />
            </button>
          </div>

          {/* Comments Section */}
          {activeCommentBox === design._id && (
            <div className="mt-6 border-t pt-4">
              {Array.isArray(comments[design._id]) &&
                comments[design._id].map((c) =>
                  c && typeof c === "object" ? (
                    <CommentItem key={String(c._id)} comment={c} designId={design._id} />
                  ) : null
                )}

              {/* New comment input */}
              <div className="mt-4">
                <textarea
                  value={commentInputs[design._id] || ""}
                  onChange={handleCommentChange(design._id)}
                  placeholder="Write a comment..."
                  className="w-full border rounded-lg p-2"
                />
                <button
                  onClick={async () => {
                    if (!commentInputs[design._id]?.trim()) return;
                    const newComment = await authorizedFetch<CommentType>(
                      `${baseUrl}/olatinn/api/designComments/${design._id}`,
                      "POST",
                      { text: commentInputs[design._id] }
                    );
                    setComments((prev) => ({
                      ...prev,
                      [design._id]: [newComment, ...(prev[design._id] || [])],
                    }));
                    setCommentInputs((prev) => ({ ...prev, [design._id]: "" }));
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
