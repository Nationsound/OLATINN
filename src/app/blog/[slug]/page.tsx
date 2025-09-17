import BlogDetails from '@/app/index/blogdetails/BlogDetails'
import BlogHeader from '@/app/index/blogheader/BlogHeader'
import React from 'react'

const page = () => {
  return (
    <div>
      <div>
        <BlogHeader />
      </div>
      <div>
        <BlogDetails />
      </div>
    </div>
  )
}

export default page