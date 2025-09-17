"use client"
import AdminBlogForm from '@/app/components/adminBlog/AdminBlogForm'
import AdminChat from '@/app/components/adminChat/adminChat'
import AdminDashboard from '@/app/components/adminDetails/AdminDashboard'
import React from 'react'

const page = () => {
  return (
    <div>
      <div>
        <AdminDashboard />
      </div>
      <div>
        <AdminBlogForm />
      </div>
      <div>
        <AdminChat />
      </div>
    </div>
  )
}

export default page