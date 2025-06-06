import React from "react";
import { Hero } from "./Hero";
import { NFTList } from "./NFTList";
import { CTA } from './CTA';
import { Footer } from './Footer';
function Landing() {
    return (
        <>
            <Hero />
            <NFTList />
            <CTA />
            <Footer />
        </>
    )
} 

export default Landing;