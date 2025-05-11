import { storage } from "../server/storage";

async function main() {
  try {
    // Delete product by slug
    const slug = "automatic-chicken-feeder";
    const product = await storage.getProductBySlug(slug);
    
    if (!product) {
      console.error(`Product with slug '${slug}' not found`);
      process.exit(1);
    }
    
    console.log(`Found product to delete: ${product.name} (ID: ${product.id})`);
    
    const isDeleted = await storage.deleteProduct(product.id);
    
    if (isDeleted) {
      console.log(`Successfully deleted product: ${product.name}`);
    } else {
      console.error(`Failed to delete product: ${product.name}`);
      process.exit(1);
    }
    
  } catch (error) {
    console.error("Error deleting product:", error);
    process.exit(1);
  }
}

main();