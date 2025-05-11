// Script to update a product with description sections
import { db } from "../server/db";
import { products } from "../shared/schema";
import { eq } from "drizzle-orm";

async function updateProductWithDescriptions() {
  try {
    console.log("Updating product with description content...");
    
    // Update the Portable Chicken Coop product (ID 4)
    const result = await db.update(products)
      .set({
        // English content sections
        keyFeatures: "This portable chicken coop is designed specifically for poultry farmers who value mobility, durability, and the welfare of their birds.",
        keyBenefits: "- Easy to relocate to fresh ground\n- Predator-proof design with secure locks\n- Weather resistant for all seasons\n- Provides both shelter and outdoor access\n- Simple to clean and maintain",
        useCaseCommercial: "Ideal for small commercial farms that rotate birds across different areas of pasture while maintaining protection from predators.",
        useCaseBackyard: "Perfect for backyard poultry keepers who want to move their chickens around the yard to control pests and provide fresh foraging.",
        maintenanceTips: "1. Clean the coop thoroughly every 2-3 weeks\n2. Check wheels and moving parts monthly\n3. Inspect for damage or wear after extreme weather\n4. Oil hinges and latches as needed\n5. Replace bedding material regularly",
        
        // Arabic content sections
        keyFeaturesAr: "تم تصميم عشة الدجاج المتنقلة هذه خصيصًا لمربي الدواجن الذين يقدرون سهولة التنقل والمتانة ورفاهية طيورهم.",
        keyBenefitsAr: "- سهلة النقل إلى أرض جديدة\n- تصميم مضاد للحيوانات المفترسة مع أقفال آمنة\n- مقاومة للعوامل الجوية في جميع المواسم\n- توفر المأوى والوصول إلى الخارج\n- سهلة التنظيف والصيانة",
        useCaseCommercialAr: "مثالية للمزارع التجارية الصغيرة التي تناوب الطيور عبر مناطق مختلفة من المراعي مع الحفاظ على الحماية من الحيوانات المفترسة.",
        useCaseBackyardAr: "مثالية لمربي الدواجن في الفناء الخلفي الذين يرغبون في تحريك دجاجهم حول الفناء للسيطرة على الآفات وتوفير العلف الطازج.",
        maintenanceTipsAr: "1. نظف العشة جيدًا كل 2-3 أسابيع\n2. تحقق من العجلات والأجزاء المتحركة شهريًا\n3. افحص للتأكد من عدم وجود تلف أو تآكل بعد الطقس القاسي\n4. زيت المفصلات والمزاليج حسب الحاجة\n5. استبدل مواد الفراش بانتظام"
      })
      .where(eq(products.id, 4))
      .returning();
    
    console.log("Update successful:", result);
    
    // Verify the update by retrieving the product
    const updatedProduct = await db.select().from(products).where(eq(products.id, 4));
    console.log("Updated product:", updatedProduct);
    
    console.log("Product description content updated successfully!");
  } catch (error) {
    console.error("Error updating product:", error);
  }
}

// Run the function
updateProductWithDescriptions();