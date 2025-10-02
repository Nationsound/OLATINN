import BlogDetails from '@/app/index/blogdetails/BlogDetails'
import BlogHeader from '@/app/index/blogheader/BlogHeader'
import React from 'react'
import { NextSeo } from 'next-seo'

const Page = () => {
  return (
    <>
      {/* ✅ SEO for Blog Details Page */}
      <NextSeo
        title="OLATINN Blog - Tech, Innovation & Insights"
        description="Explore OLATINN blog posts on technology, scalable infrastructure, design, and innovation. Stay updated with our latest insights and projects."
        canonical="https://www.olatinnlimited.com/blog"
        openGraph={{
          url: "https://www.olatinnlimited.com/blog",
          title: "OLATINN Blog - Tech, Innovation & Insights",
          description:
            "Explore OLATINN blog posts on technology, scalable infrastructure, design, and innovation.",
          images: [
            {
              url: "https://olatinnlimited.com/images/og-blog.jpg",
              width: 1200,
              height: 630,
              alt: "OLATINN Blog",
            },
          ],
          siteName: "OLATINN",
        }}
        twitter={{
          handle: "@olatinn",
          site: "@olatinn",
          cardType: "summary_large_image",
        }}
      />

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
