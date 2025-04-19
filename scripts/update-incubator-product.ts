import { storage } from "../server/storage";

async function main() {
  try {
    // Get the product by slug
    const product = await storage.getProductBySlug("automatic-chicken-feeder");
    
    if (!product) {
      console.error("Product 'automatic-chicken-feeder' not found");
      process.exit(1);
    }
    
    console.log(`Updating product: ${product.name} (ID: ${product.id})`);
    
    // Update the product with WONEGG Automatic Humidity Control Incubator data
    const updatedProduct = await storage.updateProduct(product.id, {
      name: "WONEGG Automatic Egg Incubator",
      nameAr: "حاضنة بيض أوتوماتيكية من وينيج",
      description: "Automatic chicken egg incubator with humidity control function. Holds 12 chicken eggs with intelligent temperature control system and egg turning function for optimal hatching results.",
      descriptionAr: "حاضنة بيض دجاج أوتوماتيكية مع وظيفة التحكم في الرطوبة. تحمل 12 بيضة دجاج مع نظام التحكم الذكي في درجة الحرارة ووظيفة تقليب البيض للحصول على نتائج تفقيس مثالية.",
      price: "79.99",
      originalPrice: "129.99",
      imageUrl: "https://s.alicdn.com/@sc01/kf/H9c06e0be3bbd4c26bc6b3d08befc4efeS.jpg_720x720q50.jpg",
      additionalImages: [
        "https://s.alicdn.com/@sc01/kf/Hc957a9ff6b884c17891a9a0e4ef6f03fk.jpg_720x720q50.jpg",
        "https://s.alicdn.com/@sc01/kf/Hd1cb5a3ec3264dafaa2b2326c10c3f69F.jpg_720x720q50.jpg",
        "https://s.alicdn.com/@sc01/kf/H2682c01fdcb74063a025e9e0c44c6e03r.jpg_720x720q50.jpg"
      ],
      descriptionImages: [
        "https://s.alicdn.com/@sc01/kf/H5ca1ee3a15a345818ce5e58a3dd55dc7a.jpg_720x720q50.jpg",
        "https://s.alicdn.com/@sc01/kf/H6bd3b37ed84b49f191dc82da0fe0f2b0Z.jpg_720x720q50.jpg"
      ],
      specificationImages: [
        "https://s.alicdn.com/@sc01/kf/H2ecd61c772264b5683fe5da39e22d82bz.jpg_720x720q50.jpg"
      ],
      // Keep same category (feeders)
      videoUrl: "https://video.alicdn.com/play/u/115638007/616736574/1/m.mp4",
      badge: "sale",
      badgeAr: "تخفيض"
    });
    
    console.log("Product updated successfully:", updatedProduct);
    
  } catch (error) {
    console.error("Error updating product:", error);
    process.exit(1);
  }
}

main();