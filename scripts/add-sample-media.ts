import { storage } from "../server/storage";

async function main() {
  try {
    // Find a product to update (using Automatic Coop Door)
    const product = await storage.getProductBySlug("automatic-coop-door");
    
    if (!product) {
      console.error("Product not found");
      process.exit(1);
    }
    
    console.log(`Updating product: ${product.name} (ID: ${product.id})`);
    
    // Sample video and images
    const mediaData = {
      videoUrl: "https://storage.googleapis.com/webfundamentals-assets/videos/chrome.mp4", // Sample video
      additionalImages: [
        "https://images.unsplash.com/photo-1510137600163-2729bc6959ed?q=80&w=800", // Chicken farm
        "https://images.unsplash.com/photo-1583396618422-324632bc740c?q=80&w=800", // Close-up of chicken coop
        "https://images.unsplash.com/photo-1590246815117-be29970f41dd?q=80&w=800"  // Modern chicken coop
      ],
      descriptionImages: [
        "https://images.unsplash.com/photo-1583396618422-324632bc740c?q=80&w=800", // Coop closeup
        "https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?q=80&w=800"     // Farm equipment
      ],
      specificationImages: [
        "https://images.unsplash.com/photo-1516467508483-a7212febe31a?q=80&w=800", // Technical diagram-like image
      ]
    };
    
    // Update the product with sample media
    const updatedProduct = await storage.updateProductMedia(product.id, mediaData);
    
    console.log("Product updated successfully with sample media:");
    console.log("- Video URL:", updatedProduct.videoUrl);
    console.log("- Additional Images:", updatedProduct.additionalImages?.length || 0);
    console.log("- Description Images:", updatedProduct.descriptionImages?.length || 0);
    console.log("- Specification Images:", updatedProduct.specificationImages?.length || 0);
    
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

main();