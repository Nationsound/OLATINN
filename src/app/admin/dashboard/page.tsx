"use client"
import AdminBlogForm from '@/app/components/adminBlog/AdminBlogForm'
import AdminChat from '@/app/components/adminChat/adminChat'
import AdminDashboard from '@/app/components/adminDetails/AdminDashboard'
import DesignTemplate from '@/app/index/designtemplate/DesignTemplate'
import React from 'react'

const page = () => {
  return (
    <div>
      <div>
        <AdminDashboard />
      </div>
      <div className='flex gap-8 justify-around'>
        <div>
        <DesignTemplate />
      </div>
      <div>
        <AdminBlogForm />
      </div>
      </div>
      <div>
        <AdminChat />
      </div>
      
    </div>
  )
}

export default page