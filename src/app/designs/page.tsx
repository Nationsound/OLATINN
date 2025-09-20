import React from 'react'
import DesignHeader from '../index/designheader/DesignHeader'
import DesignFeed from '../index/designFeed/DesignFeed'

const page = () => {
  return (
    <div>
      <div>
        <DesignHeader />
      </div>
      <div>
        <DesignFeed />
      </div>
    </div>
  )
}

export default page