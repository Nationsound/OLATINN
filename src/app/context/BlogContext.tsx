"use client";
import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { dummyBlogs } from "@/app/index/dummy/DummyData"; // import your new dummy file

type Blog = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string;
  author: string;
  date: string;
  readingTime: number;
  content?: string;      // optional for backend blogs
  createdAt?: string;    // optional for backend blogs
  imageUrl?: string;     // optional fallback
};

type BlogContextType = {
  selectedBlog: Blog | null;
  setSelectedBlog: (blog: Blog | null) => void;
  allBlogs: Blog[];
  setAllBlogs: (blogs: Blog[]) => void;
};

const BlogContext = createContext<BlogContextType | undefined>(undefined);

const API_BASE = "http://localhost:5000/olatinn/api/blogs";

export const BlogProvider = ({ children }: { children: ReactNode }) => {
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const [allBlogs, setAllBlogs] = useState<Blog[]>(dummyBlogs); // start with dummy

  // Fetch backend blogs and merge with dummy
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await fetch(API_BASE);
        if (!res.ok) throw new Error("Failed to fetch blogs from backend");
        const data: Blog[] = await res.json();

        if (Array.isArray(data) && data.length > 0) {
          setAllBlogs([...dummyBlogs, ...data]);
        }
      } catch (err) {
        console.error("Error fetching blogs:", err);
      }
    };
    fetchBlogs();
  }, []);

  return (
    <BlogContext.Provider value={{ selectedBlog, setSelectedBlog, allBlogs, setAllBlogs }}>
      {children}
    </BlogContext.Provider>
  );
};

export const useBlog = () => {
  const context = useContext(BlogContext);
  if (!context) {
    throw new Error("useBlog must be used within a BlogProvider");
  }
  return context;
};
