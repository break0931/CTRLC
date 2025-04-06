import React from 'react'

function Container({ children }) {
  return (
    <div className='min-h-screen mx-4 md:mx-20 xl:mx-40 2xl:mx-80 mb-12 mt-2 bg-white'>
        {children}
    </div>
  )
}

export default Container
