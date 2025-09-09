import React from 'react'
import LandingPage from '../index/landpage/LandingPage'
import TechTermsSection from '../index/techterms/TechTermSection'
import BusinessTechSection from '../index/businesstech/BusinessTechSection'
import AboutUsSection from '../index/aboutsection/AboutUsSection'

const HomePage = () => {
  return (
    <div>
      <div>
        <LandingPage />
      </div>
      <div>
        <TechTermsSection />
      </div>
      <div>
        <BusinessTechSection />
      </div>
      <div>
        <AboutUsSection />
      </div>
    </div>
  )
}

export default HomePage