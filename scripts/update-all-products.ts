// Script to update all products with description sections
import { db } from "../server/db";
import { products } from "../shared/schema";
import { eq } from "drizzle-orm";

interface ProductDescriptions {
  [key: string]: {
    keyFeatures: string;
    keyBenefits: string;
    useCaseCommercial: string;
    useCaseBackyard: string;
    maintenanceTips: string;
    keyFeaturesAr: string;
    keyBenefitsAr: string;
    useCaseCommercialAr: string;
    useCaseBackyardAr: string;
    maintenanceTipsAr: string;
  }
}

async function updateAllProductsWithDescriptions() {
  try {
    console.log("Updating all products with description content...");
    
    // Get all products first
    const allProducts = await db.select({
      id: products.id,
      name: products.name,
      slug: products.slug
    }).from(products);
    
    console.log(`Found ${allProducts.length} products to update`);
    
    // Define descriptions for each product based on category
    const productDescriptions: ProductDescriptions = {
      // 1. Premium Watering System
      "premium-watering-system": {
        keyFeatures: "This premium watering system is designed specifically for poultry farmers who prioritize water quality, efficiency, and reducing waste for their birds.",
        keyBenefits: "- Maintains fresh, clean water supply at all times\n- Prevents water contamination with innovative design\n- Reduces water waste significantly\n- Temperature-regulated to prevent freezing in cold weather\n- Easy to clean and refill",
        useCaseCommercial: "Ideal for large commercial operations where water quality directly impacts bird health and production metrics while reducing labor costs.",
        useCaseBackyard: "Perfect for hobby farmers who want to ensure their flock stays properly hydrated with minimal maintenance and waste.",
        maintenanceTips: "1. Flush system weekly to prevent mineral buildup\n2. Clean filters every 1-2 months\n3. Check pressure regulator quarterly\n4. Inspect for leaks or damage monthly\n5. Sanitize completely every 6 months",
        
        keyFeaturesAr: "تم تصميم نظام السقي المتميز هذا خصيصًا لمزارعي الدواجن الذين يعطون الأولوية لجودة المياه والكفاءة وتقليل الهدر لطيورهم.",
        keyBenefitsAr: "- يحافظ على إمداد المياه النظيفة والعذبة في جميع الأوقات\n- يمنع تلوث المياه بتصميم مبتكر\n- يقلل من هدر المياه بشكل كبير\n- منظم درجة الحرارة لمنع التجمد في الطقس البارد\n- سهل التنظيف وإعادة الملء",
        useCaseCommercialAr: "مثالي للعمليات التجارية الكبيرة حيث تؤثر جودة المياه مباشرة على صحة الطيور ومؤشرات الإنتاج مع تقليل تكاليف العمالة.",
        useCaseBackyardAr: "مثالي للمزارعين الهواة الذين يريدون التأكد من بقاء قطيعهم رطبًا بشكل صحيح مع الحد الأدنى من الصيانة والهدر.",
        maintenanceTipsAr: "1. اغسل النظام أسبوعيًا لمنع تراكم المعادن\n2. نظف المرشحات كل 1-2 شهر\n3. تحقق من منظم الضغط كل ثلاثة أشهر\n4. افحص عن وجود تسربات أو تلف شهريًا\n5. عقم بالكامل كل 6 أشهر"
      },
      
      // 2. Deluxe Nesting Boxes
      "deluxe-nesting-boxes": {
        keyFeatures: "These deluxe nesting boxes are engineered for optimal egg production, egg protection, and hen comfort with premium materials and thoughtful design.",
        keyBenefits: "- Comfortable nesting surface encourages laying\n- Roll-away design keeps eggs clean and protected\n- Easy access for egg collection\n- Durable construction for years of use\n- Designed to prevent egg-eating behavior",
        useCaseCommercial: "Perfect for commercial egg producers seeking to maximize production while minimizing labor costs associated with egg collection and cleaning.",
        useCaseBackyard: "Ideal for backyard chicken keepers who want to simplify egg collection and ensure clean, unbroken eggs for family consumption.",
        maintenanceTips: "1. Remove and wash nesting material monthly\n2. Check roll-away mechanism weekly for proper function\n3. Disinfect boxes quarterly with poultry-safe cleaner\n4. Inspect for wear or damage seasonally\n5. Keep lids and collection areas clean daily",
        
        keyFeaturesAr: "تم تصميم صناديق التعشيش الفاخرة هذه لتحقيق أمثل إنتاج للبيض وحماية البيض وراحة الدجاج باستخدام مواد متميزة وتصميم مدروس.",
        keyBenefitsAr: "- سطح تعشيش مريح يشجع على وضع البيض\n- تصميم متدحرج يحافظ على نظافة البيض وحمايته\n- سهولة الوصول لجمع البيض\n- بناء متين لسنوات من الاستخدام\n- مصمم لمنع سلوك أكل البيض",
        useCaseCommercialAr: "مثالي لمنتجي البيض التجاريين الذين يسعون إلى زيادة الإنتاج إلى أقصى حد مع تقليل تكاليف العمالة المرتبطة بجمع البيض وتنظيفه.",
        useCaseBackyardAr: "مثالي لمربي الدجاج في الفناء الخلفي الذين يرغبون في تبسيط جمع البيض وضمان بيض نظيف وغير مكسور للاستهلاك العائلي.",
        maintenanceTipsAr: "1. إزالة وغسل مواد التعشيش شهريًا\n2. فحص آلية التدحرج أسبوعيًا للتأكد من عملها بشكل صحيح\n3. تطهير الصناديق كل ثلاثة أشهر بمنظف آمن للدواجن\n4. فحص التآكل أو التلف موسميًا\n5. الحفاظ على نظافة الأغطية ومناطق التجميع يوميًا"
      },
      
      // 3. Portable Chicken Coop (already updated)
      "portable-chicken-coop": {
        keyFeatures: "This portable chicken coop is designed specifically for poultry farmers who value mobility, durability, and the welfare of their birds.",
        keyBenefits: "- Easy to relocate to fresh ground\n- Predator-proof design with secure locks\n- Weather resistant for all seasons\n- Provides both shelter and outdoor access\n- Simple to clean and maintain",
        useCaseCommercial: "Ideal for small commercial farms that rotate birds across different areas of pasture while maintaining protection from predators.",
        useCaseBackyard: "Perfect for backyard poultry keepers who want to move their chickens around the yard to control pests and provide fresh foraging.",
        maintenanceTips: "1. Clean the coop thoroughly every 2-3 weeks\n2. Check wheels and moving parts monthly\n3. Inspect for damage or wear after extreme weather\n4. Oil hinges and latches as needed\n5. Replace bedding material regularly",
        
        keyFeaturesAr: "تم تصميم عشة الدجاج المتنقلة هذه خصيصًا لمربي الدواجن الذين يقدرون سهولة التنقل والمتانة ورفاهية طيورهم.",
        keyBenefitsAr: "- سهلة النقل إلى أرض جديدة\n- تصميم مضاد للحيوانات المفترسة مع أقفال آمنة\n- مقاومة للعوامل الجوية في جميع المواسم\n- توفر المأوى والوصول إلى الخارج\n- سهلة التنظيف والصيانة",
        useCaseCommercialAr: "مثالية للمزارع التجارية الصغيرة التي تناوب الطيور عبر مناطق مختلفة من المراعي مع الحفاظ على الحماية من الحيوانات المفترسة.",
        useCaseBackyardAr: "مثالية لمربي الدواجن في الفناء الخلفي الذين يرغبون في تحريك دجاجهم حول الفناء للسيطرة على الآفات وتوفير العلف الطازج.",
        maintenanceTipsAr: "1. نظف العشة جيدًا كل 2-3 أسابيع\n2. تحقق من العجلات والأجزاء المتحركة شهريًا\n3. افحص للتأكد من عدم وجود تلف أو تآكل بعد الطقس القاسي\n4. زيت المفصلات والمزاليج حسب الحاجة\n5. استبدل مواد الفراش بانتظام"
      },
      
      // 4. Poultry Health Kit
      "poultry-health-kit": {
        keyFeatures: "This comprehensive health kit contains all essential supplies for preventing and treating common poultry ailments, promoting flock wellness.",
        keyBenefits: "- Complete set of poultry-specific medications and treatments\n- Easy-to-follow diagnostic guide included\n- All-natural supplement options included\n- Specialized applicators for precise administration\n- Extended shelf life for emergency preparedness",
        useCaseCommercial: "Essential for commercial operations to quickly address health issues before they impact production or spread throughout the flock.",
        useCaseBackyard: "Perfect for hobby farmers who want to be prepared for common health issues without veterinary visits for every minor ailment.",
        maintenanceTips: "1. Check expiration dates quarterly\n2. Store in cool, dry location away from direct sunlight\n3. Replace used items promptly\n4. Keep diagnostic manual clean and accessible\n5. Review treatment protocols annually",
        
        keyFeaturesAr: "تحتوي مجموعة الصحة الشاملة هذه على جميع المستلزمات الأساسية للوقاية من أمراض الدواجن الشائعة وعلاجها، وتعزيز صحة القطيع.",
        keyBenefitsAr: "- مجموعة كاملة من الأدوية والعلاجات الخاصة بالدواجن\n- دليل تشخيصي سهل الاتباع مضمن\n- خيارات المكملات الطبيعية بالكامل مضمنة\n- أجهزة تطبيق متخصصة للإدارة الدقيقة\n- عمر تخزين طويل للتأهب للطوارئ",
        useCaseCommercialAr: "ضروري للعمليات التجارية لمعالجة المشاكل الصحية بسرعة قبل أن تؤثر على الإنتاج أو تنتشر في جميع أنحاء القطيع.",
        useCaseBackyardAr: "مثالي للمزارعين الهواة الذين يرغبون في الاستعداد للمشاكل الصحية الشائعة دون زيارات بيطرية لكل علة بسيطة.",
        maintenanceTipsAr: "1. تحقق من تواريخ انتهاء الصلاحية كل ثلاثة أشهر\n2. تخزين في مكان بارد وجاف بعيدًا عن أشعة الشمس المباشرة\n3. استبدال العناصر المستخدمة على الفور\n4. الحفاظ على دليل التشخيص نظيفًا ويمكن الوصول إليه\n5. مراجعة بروتوكولات العلاج سنويًا"
      },
      
      // 5. Gravity Waterer
      "gravity-waterer": {
        keyFeatures: "This efficient gravity waterer is designed to provide a reliable water supply to your poultry with minimal maintenance and maximum cleanliness.",
        keyBenefits: "- Maintains water level automatically\n- Reduces labor with less frequent refilling\n- Prevents contamination with specialized design\n- Durable construction withstands pecking and weather\n- Easy to clean with removable components",
        useCaseCommercial: "Perfect for commercial operations where reliable, low-maintenance watering solutions maximize efficiency and minimize labor costs.",
        useCaseBackyard: "Ideal for backyard flocks where owners want to ensure continuous water access even during busy schedules or short absences.",
        maintenanceTips: "1. Rinse and refill with fresh water every 2-3 days\n2. Clean thoroughly with poultry-safe disinfectant weekly\n3. Check valve function monthly\n4. Inspect for cracks or damage seasonally\n5. Descale with vinegar solution quarterly in hard water areas",
        
        keyFeaturesAr: "تم تصميم سقاية الجاذبية الفعالة هذه لتوفير إمدادات مياه موثوقة للدواجن مع الحد الأدنى من الصيانة وأقصى قدر من النظافة.",
        keyBenefitsAr: "- يحافظ على مستوى الماء تلقائيًا\n- يقلل من العمالة مع إعادة الملء بشكل أقل تكرارًا\n- يمنع التلوث بتصميم متخصص\n- بناء متين يتحمل النقر والطقس\n- سهل التنظيف مع مكونات قابلة للإزالة",
        useCaseCommercialAr: "مثالي للعمليات التجارية حيث تعمل حلول الري الموثوقة منخفضة الصيانة على زيادة الكفاءة وتقليل تكاليف العمالة.",
        useCaseBackyardAr: "مثالي لقطعان الفناء الخلفي حيث يرغب المالكون في ضمان الوصول المستمر إلى المياه حتى أثناء الجداول المزدحمة أو الغيابات القصيرة.",
        maintenanceTipsAr: "1. شطف وإعادة ملء بالماء العذب كل 2-3 أيام\n2. تنظيف بشكل كامل باستخدام مطهر آمن للدواجن أسبوعيًا\n3. تحقق من وظيفة الصمام شهريًا\n4. فحص للتأكد من عدم وجود تشققات أو تلف موسميًا\n5. إزالة الترسبات بمحلول الخل كل ثلاثة أشهر في مناطق المياه العسرة"
      },
      
      // 6. Hanging Feeder
      "hanging-feeder": {
        keyFeatures: "This innovative hanging feeder is designed to minimize waste, prevent contamination, and provide easy access to feed for your poultry.",
        keyBenefits: "- Adjustable height for birds of different sizes\n- Anti-waste lip prevents feed spillage\n- Weather protection cover keeps feed dry\n- Large capacity reduces filling frequency\n- Durable construction for years of service",
        useCaseCommercial: "Ideal for commercial operations looking to reduce feed costs through less waste while ensuring consistent feed access.",
        useCaseBackyard: "Perfect for backyard flocks where convenience and feed conservation are priorities for the poultry keeper.",
        maintenanceTips: "1. Empty and clean weekly to prevent mold\n2. Check hanging mechanism monthly for security\n3. Inspect for damage after severe weather\n4. Lubricate adjustment mechanisms quarterly\n5. Replace damaged parts immediately to prevent feed waste",
        
        keyFeaturesAr: "تم تصميم وحدة التغذية المعلقة المبتكرة هذه لتقليل الهدر ومنع التلوث وتوفير وصول سهل إلى العلف للدواجن الخاصة بك.",
        keyBenefitsAr: "- ارتفاع قابل للتعديل للطيور من أحجام مختلفة\n- شفة مضادة للهدر تمنع انسكاب العلف\n- غطاء حماية من الطقس يحافظ على جفاف العلف\n- سعة كبيرة تقلل من تكرار الملء\n- بناء متين لسنوات من الخدمة",
        useCaseCommercialAr: "مثالي للعمليات التجارية التي تتطلع إلى تقليل تكاليف العلف من خلال تقليل الهدر مع ضمان الوصول المستمر إلى العلف.",
        useCaseBackyardAr: "مثالي لقطعان الفناء الخلفي حيث تكون الراحة والحفاظ على العلف من الأولويات لمربي الدواجن.",
        maintenanceTipsAr: "1. تفريغ وتنظيف أسبوعيًا لمنع العفن\n2. تحقق من آلية التعليق شهريًا للتأكد من الأمان\n3. افحص للتأكد من عدم وجود تلف بعد الطقس القاسي\n4. تزييت آليات الضبط كل ثلاثة أشهر\n5. استبدال الأجزاء التالفة على الفور لمنع هدر العلف"
      },
      
      // 7. Temperature Controller
      "temperature-controller": {
        keyFeatures: "This advanced temperature controller provides precise climate management to ensure optimal conditions for poultry health, growth, and production.",
        keyBenefits: "- Maintains ideal temperature range automatically\n- Improves feed conversion rates through optimal conditions\n- Reduces heat stress and cold-related health issues\n- Smartphone monitoring and alerts via mobile app\n- Energy-efficient operation saves on utility costs",
        useCaseCommercial: "Essential for large commercial operations where temperature control directly impacts growth rates, mortality, and ultimately profitability.",
        useCaseBackyard: "Ideal for serious hobbyists with enclosed coops who want to protect valuable breeds from temperature extremes year-round.",
        maintenanceTips: "1. Calibrate temperature sensors quarterly\n2. Clean air vents and fans monthly\n3. Check wiring connections twice yearly\n4. Update firmware when available\n5. Test alarm and backup systems monthly",
        
        keyFeaturesAr: "يوفر جهاز التحكم في درجة الحرارة المتقدم هذا إدارة دقيقة للمناخ لضمان الظروف المثلى لصحة الدواجن ونموها وإنتاجها.",
        keyBenefitsAr: "- يحافظ على نطاق درجة الحرارة المثالي تلقائيًا\n- يحسن معدلات تحويل العلف من خلال الظروف المثلى\n- يقلل من الإجهاد الحراري ومشاكل الصحة المتعلقة بالبرد\n- مراقبة الهاتف الذكي والتنبيهات عبر تطبيق الجوال\n- تشغيل موفر للطاقة يوفر في تكاليف المرافق",
        useCaseCommercialAr: "ضروري للعمليات التجارية الكبيرة حيث يؤثر التحكم في درجة الحرارة بشكل مباشر على معدلات النمو والوفيات وفي النهاية الربحية.",
        useCaseBackyardAr: "مثالي للهواة الجادين الذين لديهم أقفاص مغلقة ويرغبون في حماية السلالات القيمة من درجات الحرارة القصوى على مدار العام.",
        maintenanceTipsAr: "1. معايرة مستشعرات درجة الحرارة كل ثلاثة أشهر\n2. تنظيف فتحات الهواء والمراوح شهريًا\n3. فحص توصيلات الأسلاك مرتين سنويًا\n4. تحديث البرامج الثابتة عند توفرها\n5. اختبار أنظمة الإنذار والنسخ الاحتياطي شهريًا"
      },
    };
    
    // Update each product with appropriate descriptions
    let updatedCount = 0;
    
    for (const product of allProducts) {
      // Check if we have descriptions for this product
      if (productDescriptions[product.slug]) {
        console.log(`Updating product: ${product.name} (${product.slug})`);
        
        // Get the descriptions for this product
        const descriptions = productDescriptions[product.slug];
        
        // Update the product
        await db.update(products)
          .set(descriptions)
          .where(eq(products.id, product.id));
        
        updatedCount++;
        console.log(`Updated: ${product.name}`);
      } else {
        console.log(`No descriptions found for product: ${product.name} (${product.slug}), skipping...`);
      }
    }
    
    console.log(`Successfully updated ${updatedCount} products with description content!`);
  } catch (error) {
    console.error("Error updating products:", error);
  }
}

// Run the function
updateAllProductsWithDescriptions();