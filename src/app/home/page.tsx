import React from 'react'
import LandingPage from '../index/landpage/LandingPage'
import TechTermsSection from '../index/techterms/TechTermSection'
import BusinessTechSection from '../index/businesstech/BusinessTechSection'
import AboutUsSection from '../index/aboutsection/AboutUsSection'
import DataAnalyticsSection from '../index/data/DataAnalyticSection'
import AuthenticationSection from '../index/authentication/AuthenticationSection'
import GoalsSection from '../index/goals/GoalsSection'
import StructuredData from '../index/structure/StructuredData'
import TrustSection from '../index/trust/TrustSection'
import ServiceSection from '../index/servicesection/ServiceSection'



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
      <div>
        <GoalsSection />
      </div>
      <div>
        <DataAnalyticsSection />
      </div>
      <div>
        <StructuredData />
      </div>
      <div>
        <AuthenticationSection />
      </div>
      <div>
        <TrustSection />
      </div>
      <div>
        <ServiceSection />
      </div>
    </div>
  )
}

export default HomePage