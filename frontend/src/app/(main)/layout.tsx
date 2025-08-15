import Header from '@/components/header/header'
import Footer from '@/components/footer/footer'
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