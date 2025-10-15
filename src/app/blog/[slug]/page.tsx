import BlogDetails from '@/app/index/blogdetails/BlogDetails'
import BlogHeader from '@/app/index/blogheader/BlogHeader'
import React from 'react'


const Page = () => {
  return (
    <>
      <div>
        <BlogHeader />
      </div>
      <div>
        <BlogDetails />
      </div>
    </>
  )
}

export default Page
