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
        <BrandingSection />
      </div>
      <div>
        <AboutDetails />
      </div>
      <div>
        <CardCarousel />
      </div>
      <div>
        <BrandingSection />
      </div>
    </div>
  )
}

export default page