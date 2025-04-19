import { useEffect } from "react";
import HeroSection from "@/components/home/hero-section";
import CategoryShowcase from "@/components/categories/category-showcase";
import FeaturedProducts from "@/components/products/featured-products";
import { Helmet } from "react-helmet";

export default function Home() {
  return (
    <>
      <Helmet>
        <title>Poultry Gear - Premium Poultry Farming Equipment</title>
        <meta name="description" content="Shop high-quality poultry farming equipment including feeders, waterers, coop equipment, and health care products. Free shipping on orders over $100." />
        <meta name="keywords" content="poultry equipment, chicken feeders, poultry farming, chicken waterers, coop equipment" />
        <meta property="og:title" content="Poultry Gear - Premium Poultry Farming Equipment" />
        <meta property="og:description" content="Quality equipment for poultry farmers. Find everything you need for your farm operations." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://poultrygear.com" />
        <link rel="canonical" href="https://poultrygear.com" />
      </Helmet>
      
      <HeroSection />
      <FeaturedProducts />
      <CategoryShowcase />
    </>
  );
}
