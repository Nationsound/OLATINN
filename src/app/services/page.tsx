import React from 'react'
import ServiceHeader from '../index/serviceheader/ServiceHeader'
import ServicesExplained from '../index/serviceterms/ServiceTerms'
import WebsiteTypes from '../index/websitetypes/WebsiteTypes'
import PricingPlans from '../components/pricingPlan/PricingPlans'
import ConsultationForm from '../components/consultation/ConsultationForm'

const page = () => {
  return (
    <div>
      <div>
        <ServiceHeader />
      </div>
      <div>
        <ServicesExplained />
      </div>
      <div>
        <WebsiteTypes />
      </div>
      <div>
        <PricingPlans />
      </div>
      <div>
        <ConsultationForm />
      </div>
    </div>
  )
}

export default page