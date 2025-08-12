import Header from '@/components/shared/header'
import Footer from '@/components/shared/footer'
import React from 'react'

const HomeLayout = ({ children }: { children : React.ReactNode }) => {
    return (
        <div>
            <Header />
            <main className="p-6">
                {children}
            </main>
            <Footer />
        </div>
    )
}

export default HomeLayout