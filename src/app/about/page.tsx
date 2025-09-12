import React from 'react'
import AboutHeader from '../index/aboutheader/AboutHeader'
import AboutDetails from '../index/aboutdetails/AboutDetails'
import CardCarousel from '../components/cards/CardCarousel'
import BrandingSection from '../index/brand/BrandingSection'

const page = () => {
  return (
    <div>
      <div>
        <AboutHeader />
      </div>
      <div>
        <AboutDetails />
      </div>
      <div>
        <BrandingSection />
      </div>
      <div>
        <CardCarousel />
      </div>
    </div>
  )
}

export default page