-- Corrected MariaDB 10.6 Compatible Export (v2 - Fixed all product rows)

-- Data for table `categories`
INSERT INTO `categories` (`id`, `name`, `nameAr`, `slug`, `description`, `descriptionAr`, `imageUrl`) VALUES
(1, 'Feeders', 'معالف', 'feeders', 'Automatic and manual feeding solutions for all flock sizes.', 'حلول تغذية أوتوماتيكية ويدوية لجميع أحجام قطعان الدواجن.', '/uploads/category-1744437264811-42373139.webp'),
(2, 'Waterers', 'مساقي', 'waterers', 'Clean, efficient watering systems with advanced nipple technology.', 'أنظمة شرب نظيفة وفعالة مع تقنية حلمات متطورة.', 'https://images.unsplash.com/photo-1598970434795-0c54fe7c0648?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80'),
(3, 'Coop Equipment', 'معدات العشة', 'coop-equipment', 'Everything you need for a comfortable, secure chicken coop.', 'كل ما تحتاجه لعشة دجاج مريحة وآمنة.', 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80'),
(4, 'Health & Care', 'الصحة والرعاية', 'health-care', 'Products to maintain flock health and hygiene.', 'منتجات للحفاظ على صحة ونظافة قطيع الدواجن.', 'https://images.unsplash.com/photo-1567450121326-28da3695ef35?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80');

-- Data for table `session`
INSERT INTO `session` (`sid`, `sess`, `expire`) VALUES
('yKjYv2rDGUzAXKOl5nJhFI709tyChKz0', '[object Object]', '2025-05-12 06:18:35'),
('wXg52tKkKfWs57cianf5ip8vmEApUV4a', '[object Object]', '2025-05-15 19:44:18'),
('rAdly-hbuuoraR3FfR1GVb81-6fmat-F', '[object Object]', '2025-05-14 14:10:25'),
('OK-SCPQRsw2qzjvJKXfLHKolF0wAfZv6', '[object Object]', '2025-05-15 20:01:24');

-- Data for table `product_images`
INSERT INTO `product_images` (`id`, `productId`, `url`, `isPrimary`, `displayOrder`, `alt`, `createdAt`) VALUES
(1, 8, '/uploads/product-1744382460494-302235375.png', 0, 0, '', '2025-04-11T14:41:00.803Z'),
(2, 8, '/uploads/product-1744382485355-928934338.jpeg', 1, 0, '', '2025-04-11T14:41:25.403Z'),
(3, 5, '/uploads/product-1744384367316-308351605.jpg', 1, 0, '', '2025-04-11T15:12:47.757Z'),
(4, 5, '/uploads/product-1744384403682-876970820.PNG', 0, 0, '', '2025-04-11T15:13:23.733Z'),
(5, 5, '/uploads/product-1744384414956-22601088.webp', 0, 0, '', '2025-04-11T15:13:35.073Z'),
(7, 3, '/uploads/product-1744562463247-749169680.avif', 0, 0, '', '2025-04-13T16:41:03.317Z'),
(8, 3, '/uploads/product-1744562531256-301921671.avif', 1, 0, '', '2025-04-13T16:42:11.305Z'),
(9, 3, '/uploads/product-1744562537548-228329156.avif', 0, 0, '', '2025-04-13T16:42:17.635Z'),
(10, 3, '/uploads/product-1744562556236-945389571.avif', 0, 0, '', '2025-04-13T16:42:36.283Z'),
(11, 9, '/uploads/product-1744600168524-562530926.jpeg', 1, 0, '', '2025-04-14T03:09:29.643Z');

-- Data for table `products`
-- Note: Corrected data structure and removed malformed/duplicate entries
-- Note: Fixed column count mismatch for ALL product IDs
INSERT INTO `products` (`id`, `name`, `nameAr`, `slug`, `description`, `descriptionAr`, `price`, `categoryId`, `imageUrl`, `featured`, `inStock`, `badge`, `badgeAr`, `originalPrice`, `additionalImages`, `videoUrl`, `specificationImages`, `descriptionImages`, `sku`, `weight`, `dimensions`, `warrantyInfo`, `features`, `specs`, `tags`, `quantity`, `metaTitle`, `metaDescription`, `keyFeatures`, `keyBenefits`, `useCaseCommercial`, `useCaseBackyard`, `maintenanceTips`, `keyFeaturesAr`, `keyBenefitsAr`, `useCaseCommercialAr`, `useCaseBackyardAr`, `maintenanceTipsAr`, `keyFeaturesTitle`, `useCaseCommercialTitle`, `useCaseBackyardTitle`, `maintenanceTipTitle`, `keyFeaturesTitleAr`, `keyBenefitsTitleAr`, `maintenanceTipTitleAr`, `keyBenefitsTitle`, `useCaseCommercialTitleAr`, `useCaseBackyardTitleAr`, `useCasesTitle`, `useCasesTitleAr`, `published`) VALUES
(
    2, -- id
    'Premium Watering System', -- name
    'نظام سقي متميز', -- nameAr
    'premium-watering-system', -- slug
    'Complete watering solution with nipple drinkers. Keeps water clean and prevents spillage.', -- description
    'حل متكامل للسقي مع حلمات شرب. يحافظ على نظافة المياه ويمنع الانسكاب.', -- descriptionAr
    '64.99', -- price
    2, -- categoryId
    'https://images.unsplash.com/photo-1629385918123-8872c6d907ac?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80', -- imageUrl
    1, -- featured
    1, -- inStock
    'new', -- badge
    NULL, -- badgeAr
    NULL, -- originalPrice
    NULL, -- additionalImages
    NULL, -- videoUrl
    NULL, -- specificationImages
    NULL, -- descriptionImages
    NULL, -- sku
    NULL, -- weight
    NULL, -- dimensions
    NULL, -- warrantyInfo
    '• Maintains fresh, clean water supply at all times\n• Prevents water contamination with innovative design\n• Reduces water waste significantly\n• Temperature-regulated to prevent freezing in cold weather\n• Easy to clean and refill', -- features
    NULL, -- specs
    '', -- tags
    0, -- quantity
    NULL, -- metaTitle
    NULL, -- metaDescription
    NULL, -- keyFeatures <<-- FIXED
    'This premium watering system is designed specifically for poultry farmers who prioritize water quality, efficiency, and reducing waste for their birds.', -- keyBenefits
    'Ideal for large commercial operations where water quality directly impacts bird health and production metrics while reducing labor costs.', -- useCaseCommercial
    'Perfect for hobby farmers who want to ensure their flock stays properly hydrated with minimal maintenance and waste.', -- useCaseBackyard
    '1. Flush system weekly to prevent mineral buildup\n2. Clean filters every 1-2 months\n3. Check pressure regulator quarterly\n4. Inspect for leaks or damage monthly\n5. Sanitize completely every 6 months', -- maintenanceTips
    'تم تصميم نظام السقي المتميز هذا خصيصًا لمزارعي الدواجن الذين يعطون الأولوية لجودة المياه والكفاءة وتقليل الهدر لطيورهم.', -- keyFeaturesAr
    '• يحافظ على إمداد المياه النظيفة والعذبة في جميع الأوقات\n• يمنع تلوث المياه بتصميم مبتكر\n• يقلل من هدر المياه بشكل كبير\n• منظم درجة الحرارة لمنع التجمد في الطقس البارد\n• سهل التنظيف وإعادة الملء', -- keyBenefitsAr
    'مثالي للعمليات التجارية الكبيرة حيث تؤثر جودة المياه مباشرة على صحة الطيور ومؤشرات الإنتاج مع تقليل تكاليف العمالة.', -- useCaseCommercialAr
    'مثالي للمزارعين الهواة الذين يريدون التأكد من بقاء قطيعهم رطبًا بشكل صحيح مع الحد الأدنى من الصيانة والهدر.', -- useCaseBackyardAr
    '1. اغسل النظام أسبوعيًا لمنع تراكم المعادن\n2. نظف المرشحات كل 1-2 شهر\n3. تحقق من منظم الضغط كل ثلاثة أشهر\n4. افحص عن وجود تسربات أو تلف شهريًا\n5. عقم بالكامل كل 6 أشهر', -- maintenanceTipsAr
    'Key Features', -- keyFeaturesTitle
    'Commercial Farms', -- useCaseCommercialTitle
    'Backyard Coops', -- useCaseBackyardTitle
    'Maintenance Tips', -- maintenanceTipTitle
    'الميزات الرئيسية', -- keyFeaturesTitleAr
    'الفوائد الرئيسية', -- keyBenefitsTitleAr
    'نصائح الصيانة', -- maintenanceTipTitleAr
    'Key Benefits', -- keyBenefitsTitle
    'المزارع التجارية', -- useCaseCommercialTitleAr
    'أقفاص الفناء الخلفي', -- useCaseBackyardTitleAr
    'Use Cases', -- useCasesTitle
    'حالات الاستخدام', -- useCasesTitleAr
    0 -- published
),
(
    3, -- id
    'Deluxe Nesting Boxes (Set of 4)', -- name
    'صناديق تعشيش فاخرة (مجموعة من 4)', -- nameAr
    'deluxe-nesting-boxes', -- slug
    '<p>Comfortable, easy-to-clean nesting boxes with roll-away egg collection system.</p>', -- description
    '<p>صناديق تعشيش مريحة سهلة التنظيف مع نظام تجميع البيض المتدحرج.</p>', -- descriptionAr
    '30', -- price
    3, -- categoryId
    '/uploads/product-1744562531256-301921671.avif', -- imageUrl
    1, -- featured
    1, -- inStock
    NULL, -- badge
    NULL, -- badgeAr
    '74.99', -- originalPrice
    NULL, -- additionalImages
    NULL, -- videoUrl
    NULL, -- specificationImages
    NULL, -- descriptionImages
    '', -- sku
    '', -- weight
    '', -- dimensions
    NULL, -- warrantyInfo
    '• Comfortable nesting surface encourages laying\n• Roll-away design keeps eggs clean and protected\n• Easy access for egg collection\n• Durable construction for years of use\n• Designed to prevent egg-eating behavior', -- features
    NULL, -- specs
    '', -- tags
    0, -- quantity
    NULL, -- metaTitle
    NULL, -- metaDescription
    NULL, -- keyFeatures <<-- FIXED
    'These deluxe nesting boxes are designed for optimal egg production, egg protection, and hen comfort using premium materials and thoughtful design.', -- keyBenefits
    'Perfect for commercial egg producers seeking to maximize production while minimizing labor costs associated with egg collection and cleaning.', -- useCaseCommercial
    'Ideal for backyard chicken keepers who want to simplify egg collection and ensure clean, unbroken eggs for family consumption.', -- useCaseBackyard
    '1. Remove and wash nesting material monthly\n2. Check roll-away mechanism weekly for proper function\n3. Disinfect boxes quarterly with poultry-safe cleaner\n4. Inspect for wear or damage seasonally\n5. Keep lids and collection areas clean daily', -- maintenanceTips
    'تم تصميم صناديق التعشيش الفاخرة هذه لتحقيق أمثل إنتاج للبيض وحماية البيض وراحة الدجاج باستخدام مواد متميزة وتصميم مدروس.', -- keyFeaturesAr
    '• سطح تعشيش مريح يشجع على وضع البيض\n• تصميم متدحرج يحافظ على نظافة البيض وحمايته\n• سهولة الوصول لجمع البيض\n• بناء متين لسنوات من الاستخدام\n• مصمم لمنع سلوك أكل البيض', -- keyBenefitsAr
    'مثالي لمنتجي البيض التجاريين الذين يسعون إلى زيادة الإنتاج إلى أقصى حد مع تقليل تكاليف العمالة المرتبطة بجمع البيض وتنظيفه.', -- useCaseCommercialAr
    'مثالي لمربي الدجاج في الفناء الخلفي الذين يرغبون في تبسيط جمع البيض وضمان بيض نظيف وغير مكسور للاستهلاك العائلي.', -- useCaseBackyardAr
    '1. إزالة وغسل مواد التعشيش شهريًا\n2. فحص آلية التدحرج أسبوعيًا للتأكد من عملها بشكل صحيح\n3. تطهير الصناديق كل ثلاثة أشهر بمنظف آمن للدواجن\n4. فحص التآكل أو التلف موسميًا\n5. الحفاظ على نظافة الأغطية ومناطق التجميع يوميًا', -- maintenanceTipsAr
    'Key Features', -- keyFeaturesTitle
    'Commercial Farms', -- useCaseCommercialTitle
    'Backyard Coops', -- useCaseBackyardTitle
    'Maintenance Tips', -- maintenanceTipTitle
    'الميزات الرئيسية', -- keyFeaturesTitleAr
    'الفوائد الرئيسية', -- keyBenefitsTitleAr
    'نصائح الصيانة', -- maintenanceTipTitleAr
    'Key Benefits', -- keyBenefitsTitle
    'المزارع التجارية', -- useCaseCommercialTitleAr
    'أقفاص الفناء الخلفي', -- useCaseBackyardTitleAr
    'Use Cases', -- useCasesTitle
    'حالات الاستخدام', -- useCasesTitleAr
    1 -- published
),
(
    4, -- id
    'Portable Chicken Coop', -- name
    'عشة دجاج متنقلة', -- nameAr
    'portable-chicken-coop', -- slug
    '<p>Easy-to-move coop with predator-proof design. Perfect for small to medium flocks.</p>', -- description
    '<p>عشة سهلة النقل بتصميم مضاد للحيوانات المفترسة. مثالية للقطعان الصغيرة والمتوسطة.</p>', -- descriptionAr
    '349.99', -- price
    3, -- categoryId
    'https://images.unsplash.com/photo-1586208958839-06c17cacdf08?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80', -- imageUrl
    1, -- featured
    1, -- inStock
    NULL, -- badge
    NULL, -- badgeAr
    '149.99', -- originalPrice
    NULL, -- additionalImages
    NULL, -- videoUrl
    NULL, -- specificationImages
    NULL, -- descriptionImages
    '', -- sku
    '', -- weight
    '', -- dimensions
    NULL, -- warrantyInfo
    '• Easy to relocate to fresh ground\n• Predator-proof design with secure locks\n• Weather resistant for all seasons\n• Provides both shelter and outdoor access\n• Simple to clean and maintain', -- features
    NULL, -- specs
    '', -- tags
    0, -- quantity
    NULL, -- metaTitle
    NULL, -- metaDescription
    NULL, -- keyFeatures <<-- FIXED
    'This portable chicken coop is designed specifically for poultry farmers who value mobility, durability, and the welfare of their birds.', -- keyBenefits
    'Ideal for small commercial farms that rotate birds across different areas of pasture while maintaining protection from predators.', -- useCaseCommercial
    'Perfect for backyard poultry keepers who want to move their chickens around the yard to control pests and provide fresh foraging.', -- useCaseBackyard
    '1. Clean the coop thoroughly every 2-3 weeks\n2. Check wheels and moving parts monthly\n3. Inspect for damage or wear after extreme weather\n4. Oil hinges and latches as needed\n5. Replace bedding material regularly', -- maintenanceTips
    'تم تصميم عشة الدجاج المتنقلة هذه خصيصًا لمربي الدواجن الذين يقدرون سهولة التنقل والمتانة ورفاهية طيورهم.', -- keyFeaturesAr
    '• سهلة النقل إلى أرض جديدة\n• تصميم مضاد للحيوانات المفترسة مع أقفال آمنة\n• مقاومة للعوامل الجوية في جميع المواسم\n• توفر المأوى والوصول إلى الخارج\n• سهلة التنظيف والصيانة', -- keyBenefitsAr
    'مثالية للمزارع التجارية الصغيرة التي تناوب الطيور عبر مناطق مختلفة من المراعي مع الحفاظ على الحماية من الحيوانات المفترسة.', -- useCaseCommercialAr
    'مثالية لمربي الدواجن في الفناء الخلفي الذين يرغبون في تحريك دجاجهم حول الفناء للسيطرة على الآفات وتوفير العلف الطازج.', -- useCaseBackyardAr
    '1. نظف العشة جيدًا كل 2-3 أسابيع\n2. تحقق من العجلات والأجزاء المتحركة شهريًا\n3. افحص للتأكد من عدم وجود تلف أو تآكل بعد الطقس القاسي\n4. زيت المفصلات والمزاليج حسب الحاجة\n5. استبدل مواد الفراش بانتظام', -- maintenanceTipsAr
    'Key Features', -- keyFeaturesTitle
    'Commercial Farms', -- useCaseCommercialTitle
    'Backyard Coops', -- useCaseBackyardTitle
    'Maintenance Tips', -- maintenanceTipTitle
    'الميزات الرئيسية', -- keyFeaturesTitleAr
    'الفوائد الرئيسية', -- keyBenefitsTitleAr
    'نصائح الصيانة', -- maintenanceTipTitleAr
    'Key Benefits', -- keyBenefitsTitle
    'المزارع التجارية', -- useCaseCommercialTitleAr
    'أقفاص الفناء الخلفي', -- useCaseBackyardTitleAr
    'Use Cases', -- useCasesTitle
    'حالات الاستخدام', -- useCasesTitleAr
    1 -- published
),
(
    5, -- id
    'Poultry Health Kit', -- name
    'طقم صحة الدواجن', -- nameAr
    'poultry-health-kit', -- slug
    '<p>Complete kit with essential supplements and medications for maintaining flock health.</p>', -- description
    '<p>طقم متكامل مع المكملات الغذائية والأدوية الضرورية للحفاظ على صحة القطيع.</p>', -- descriptionAr
    '49.99', -- price
    4, -- categoryId
    '/uploads/product-1744384367316-308351605.jpg', -- imageUrl
    0, -- featured
    1, -- inStock
    'bestseller', -- badge
    NULL, -- badgeAr
    NULL, -- originalPrice
    NULL, -- additionalImages
    NULL, -- videoUrl
    NULL, -- specificationImages
    NULL, -- descriptionImages
    '', -- sku
    '', -- weight
    '', -- dimensions
    '', -- warrantyInfo
    '• Complete set of poultry-specific medications and treatments\n• Easy-to-follow diagnostic guide included\n• All-natural supplement options included\n• Specialized applicators for precise administration\n• Extended shelf life for emergency preparedness', -- features
    NULL, -- specs
    '', -- tags
    0, -- quantity
    '', -- metaTitle
    '', -- metaDescription
    NULL, -- keyFeatures <<-- FIXED
    'This comprehensive health kit contains all essential supplies for preventing and treating common poultry ailments, promoting flock wellness.', -- keyBenefits
    'Essential for commercial operations to quickly address health issues before they impact production or spread throughout the flock.', -- useCaseCommercial
    'Perfect for hobby farmers who want to be prepared for common health issues without veterinary visits for every minor ailment.', -- useCaseBackyard
    '1. Check expiration dates quarterly\n2. Store in cool, dry location away from direct sunlight\n3. Replace used items promptly\n4. Keep diagnostic manual clean and accessible\n5. Review treatment protocols annually', -- maintenanceTips
    'تحتوي مجموعة الصحة الشاملة هذه على جميع المستلزمات الأساسية للوقاية من أمراض الدواجن الشائعة وعلاجها، وتعزيز صحة القطيع.', -- keyFeaturesAr
    '• مجموعة كاملة من الأدوية والعلاجات الخاصة بالدواجن\n• دليل تشخيصي سهل الاتباع مضمن\n• خيارات المكملات الطبيعية بالكامل مضمنة\n• أجهزة تطبيق متخصصة للإدارة الدقيقة\n• عمر تخزين طويل للتأهب للطوارئ', -- keyBenefitsAr
    'ضروري للعمليات التجارية لمعالجة المشاكل الصحية بسرعة قبل أن تؤثر على الإنتاج أو تنتشر في جميع أنحاء القطيع.', -- useCaseCommercialAr
    'مثالي للمزارعين الهواة الذين يرغبون في الاستعداد للمشاكل الصحية الشائعة دون زيارات بيطرية لكل علة بسيطة.', -- useCaseBackyardAr
    '1. تحقق من تواريخ انتهاء الصلاحية كل ثلاثة أشهر\n2. تخزين في مكان بارد وجاف بعيدًا عن أشعة الشمس المباشرة\n3. استبدال العناصر المستخدمة على الفور\n4. الحفاظ على دليل التشخيص نظيفًا ويمكن الوصول إليه\n5. مراجعة بروتوكولات العلاج سنويًا', -- maintenanceTipsAr
    'Key Features', -- keyFeaturesTitle
    'Commercial Farms', -- useCaseCommercialTitle
    'Backyard Coops', -- useCaseBackyardTitle
    'Maintenance Tips', -- maintenanceTipTitle
    'الميزات الرئيسية', -- keyFeaturesTitleAr
    'الفوائد الرئيسية', -- keyBenefitsTitleAr
    'نصائح الصيانة', -- maintenanceTipTitleAr
    'Key Benefits', -- keyBenefitsTitle
    'المزارع التجارية', -- useCaseCommercialTitleAr
    'أقفاص الفناء الخلفي', -- useCaseBackyardTitleAr
    'Use Cases', -- useCasesTitle
    'حالات الاستخدام', -- useCasesTitleAr
    1 -- published
),
(
    7, -- id
    'Hanging Feeder', -- name
    'معلقة تعليق', -- nameAr
    'hanging-feeder', -- slug
    'Durable hanging feeder that reduces feed waste and contamination.', -- description
    'معلفة معلقة متينة تقلل من هدر العلف والتلوث.', -- descriptionAr
    '34.99', -- price
    1, -- categoryId
    'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80', -- imageUrl
    0, -- featured
    1, -- inStock
    NULL, -- badge
    NULL, -- badgeAr
    NULL, -- originalPrice
    NULL, -- additionalImages
    NULL, -- videoUrl
    NULL, -- specificationImages
    NULL, -- descriptionImages
    '', -- sku
    '', -- weight
    '', -- dimensions
    '', -- warrantyInfo
    '• Adjustable height for birds of different sizes\n• Anti-waste lip prevents feed spillage\n• Weather protection cover keeps feed dry\n• Large capacity reduces filling frequency\n• Durable construction for years of service', -- features
    NULL, -- specs
    '', -- tags
    0, -- quantity
    NULL, -- metaTitle
    NULL, -- metaDescription
    NULL, -- keyFeatures <<-- FIXED
    'This innovative hanging feeder is designed to minimize waste, prevent contamination, and provide easy access to feed for your poultry.', -- keyBenefits
    'Ideal for commercial operations looking to reduce feed costs through less waste while ensuring consistent feed access.', -- useCaseCommercial
    'Perfect for backyard flocks where convenience and feed conservation are priorities for the poultry keeper.', -- useCaseBackyard
    '1. Empty and clean weekly to prevent mold\n2. Check hanging mechanism monthly for security\n3. Inspect for damage after severe weather\n4. Lubricate adjustment mechanisms quarterly\n5. Replace damaged parts immediately to prevent feed waste', -- maintenanceTips
    'تم تصميم وحدة التغذية المعلقة المبتكرة هذه لتقليل الهدر ومنع التلوث وتوفير وصول سهل إلى العلف للدواجن الخاصة بك.', -- keyFeaturesAr
    '• ارتفاع قابل للتعديل للطيور من أحجام مختلفة\n• شفة مضادة للهدر تمنع انسكاب العلف\n• غطاء حماية من الطقس يحافظ على جفاف العلف\n• سعة كبيرة تقلل من تكرار الملء\n• بناء متين لسنوات من الخدمة', -- keyBenefitsAr
    'مثالي للعمليات التجارية التي تتطلع إلى تقليل تكاليف العلف من خلال تقليل الهدر مع ضمان الوصول المستمر إلى العلف.', -- useCaseCommercialAr
    'مثالي لقطعان الفناء الخلفي حيث تكون الراحة والحفاظ على العلف من الأولويات لمربي الدواجن.', -- useCaseBackyardAr
    '1. تفريغ وتنظيف أسبوعيًا لمنع العفن\n2. تحقق من آلية التعليق شهريًا للتأكد من الأمان\n3. افحص للتأكد من عدم وجود تلف بعد الطقس القاسي\n4. تزييت آليات الضبط كل ثلاثة أشهر\n5. استبدال الأجزاء التالفة على الفور لمنع هدر العلف', -- maintenanceTipsAr
    'Key Features', -- keyFeaturesTitle
    'Commercial Farms', -- useCaseCommercialTitle
    'Backyard Coops', -- useCaseBackyardTitle
    'Maintenance Tips', -- maintenanceTipTitle
    'الميزات الرئيسية', -- keyFeaturesTitleAr
    'الفوائد الرئيسية', -- keyBenefitsTitleAr
    'نصائح الصيانة', -- maintenanceTipTitleAr
    'Key Benefits', -- keyBenefitsTitle
    'المزارع التجارية', -- useCaseCommercialTitleAr
    'أقفاص الفناء الخلفي', -- useCaseBackyardTitleAr
    'Use Cases', -- useCasesTitle
    'حالات الاستخدام', -- useCasesTitleAr
    1 -- published
),
(
    8, -- id
    'Gravity Waterer (5 gallon)', -- name
    'مسقاة', -- nameAr
    'gravity-waterer', -- slug
    '<p>Large capacity gravity waterer that keeps chickens hydrated for days without refilling.</p><p class="ql-align-center"><img src="https://media.istockphoto.com/id/1917491709/photo/aerial-view-of-green-forests-with-earth-green-planet-in-your-hands-save-earth-texture-of.jpg?s=2048x2048&amp;w=is&amp;k=20&amp;c=Z62XZl7x21pAoWYGVC1pBmKkIAUMBvbjm5xvaAGE_Xo=" height="233" width="414"></p><p><br></p><p><br></p><p><br></p><p><br></p><p><br></p><p><br></p><p><br></p><p><br></p><p><br></p><p><br></p><p><br></p><p><br></p><p><br></p><p><br></p><p><br></p>', -- description
    '<p>مسقاة جاذبية كبيرة السعة تحافظ على ترطيب الدجاج لأيام بدون إعادة ملء.</p>', -- descriptionAr
    '42.99', -- price
    2, -- categoryId
    '/uploads/product-1744382485355-928934338.jpeg', -- imageUrl
    1, -- featured
    1, -- inStock
    'sale', -- badge
    NULL, -- badgeAr
    '59.99', -- originalPrice
    NULL, -- additionalImages
    NULL, -- videoUrl
    NULL, -- specificationImages
    NULL, -- descriptionImages
    '', -- sku
    '', -- weight
    '', -- dimensions
    '', -- warrantyInfo
    '• Maintains water level automatically\n• Reduces labor with less frequent refilling\n• Prevents contamination with specialized design\n• Durable construction withstands pecking and weather\n• Easy to clean with removable components', -- features
    NULL, -- specs
    '', -- tags
    0, -- quantity
    '', -- metaTitle
    '', -- metaDescription
    NULL, -- keyFeatures <<-- FIXED
    'This efficient gravity waterer is designed to provide a reliable water supply to your poultry with minimal maintenance and maximum cleanliness.', -- keyBenefits
    'Perfect for commercial operations where reliable, low-maintenance watering solutions maximize efficiency and minimize labor costs.', -- useCaseCommercial
    'Ideal for backyard flocks where owners want to ensure continuous water access even during busy schedules or short absences.', -- useCaseBackyard
    '1. Rinse and refill with fresh water every 2-3 days\n2. Clean thoroughly with poultry-safe disinfectant weekly\n3. Check valve function monthly\n4. Inspect for cracks or damage seasonally\n5. Descale with vinegar solution quarterly in hard water areas', -- maintenanceTips
    'تم تصميم سقاية الجاذبية الفعالة هذه لتوفير إمدادات مياه موثوقة للدواجن مع الحد الأدنى من الصيانة وأقصى قدر من النظافة.', -- keyFeaturesAr
    '• يحافظ على مستوى الماء تلقائيًا\n• يقلل من العمالة مع إعادة الملء بشكل أقل تكرارًا\n• يمنع التلوث بتصميم متخصص\n• بناء متين يتحمل النقر والطقس\n• سهل التنظيف مع مكونات قابلة للإزالة', -- keyBenefitsAr
    'مثالي للعمليات التجارية حيث تعمل حلول الري الموثوقة منخفضة الصيانة على زيادة الكفاءة وتقليل تكاليف العمالة.', -- useCaseCommercialAr
    'مثالي لقطعان الفناء الخلفي حيث يرغب المالكون في ضمان الوصول المستمر إلى المياه حتى أثناء الجداول المزدحمة أو الغيابات القصيرة.', -- useCaseBackyardAr
    '1. شطف وإعادة ملء بالماء العذب كل 2-3 أيام\n2. تنظيف بشكل كامل باستخدام مطهر آمن للدواجن أسبوعيًا\n3. تحقق من وظيفة الصمام شهريًا\n4. فحص للتأكد من عدم وجود تشققات أو تلف موسميًا\n5. إزالة الترسبات بمحلول الخل كل ثلاثة أشهر في مناطق المياه العسرة', -- maintenanceTipsAr
    'Key Features', -- keyFeaturesTitle
    'Commercial Farms', -- useCaseCommercialTitle
    'Backyard Coops', -- useCaseBackyardTitle
    'Maintenance Tips', -- maintenanceTipTitle
    'الميزات الرئيسية', -- keyFeaturesTitleAr
    'الفوائد الرئيسية', -- keyBenefitsTitleAr
    'نصائح الصيانة', -- maintenanceTipTitleAr
    'Key Benefits', -- keyBenefitsTitle
    'المزارع التجارية', -- useCaseCommercialTitleAr
    'أقفاص الفناء الخلفي', -- useCaseBackyardTitleAr
    'Use Cases', -- useCasesTitle
    'حالات الاستخدام', -- useCasesTitleAr
    1 -- published
),
(
    9, -- id
    'Test Product', -- name
    'منتج اختبار', -- nameAr
    'test-product', -- slug
    '<p>This is a test product description.</p>', -- description
    '<p>هذا وصف منتج اختباري.</p>', -- descriptionAr
    '129.99', -- price
    3, -- categoryId
    '/uploads/product-1744600168524-562530926.jpeg', -- imageUrl
    1, -- featured
    1, -- inStock
    NULL, -- badge
    NULL, -- badgeAr
    '74.99', -- originalPrice
    NULL, -- additionalImages
    NULL, -- videoUrl
    NULL, -- specificationImages
    NULL, -- descriptionImages
    'TEST-SKU', -- sku
    '1kg', -- weight
    '10x10x10', -- dimensions
    '1 year warranty', -- warrantyInfo
    'Feature A\nFeature B', -- features
    'Spec 1: Value\nSpec 2: Value', -- specs
    'test, product', -- tags
    10, -- quantity
    'Test Product Meta Title', -- metaTitle
    'Test Product Meta Description', -- metaDescription
    'Key Feature 1\nKey Feature 2', -- keyFeatures <<-- NOTE: This one HAD a value, keeping it.
    'Benefit 1\nBenefit 2', -- keyBenefits
    'Commercial Use Case Description', -- useCaseCommercial
    'Backyard Use Case Description', -- useCaseBackyard
    'Maintenance Tip 1\nMaintenance Tip 2', -- maintenanceTips
    'الميزة الرئيسية 1\nالميزة الرئيسية 2', -- keyFeaturesAr
    'الفائدة 1\nالفائدة 2', -- keyBenefitsAr
    'وصف حالة الاستخدام التجاري', -- useCaseCommercialAr
    'وصف حالة استخدام الفناء الخلفي', -- useCaseBackyardAr
    'نصيحة الصيانة 1\nنصيحة الصيانة 2', -- maintenanceTipsAr
    'Key Features', -- keyFeaturesTitle
    'Commercial Farms', -- useCaseCommercialTitle
    'Backyard Coops', -- useCaseBackyardTitle
    'Maintenance Tips', -- maintenanceTipTitle
    'الميزات الرئيسية', -- keyFeaturesTitleAr
    'الفوائد الرئيسية', -- keyBenefitsTitleAr
    'نصائح الصيانة', -- maintenanceTipTitleAr
    'Key Benefits', -- keyBenefitsTitle
    'المزارع التجارية', -- useCaseCommercialTitleAr
    'أقفاص الفناء الخلفي', -- useCaseBackyardTitleAr
    'Use Cases', -- useCasesTitle
    'حالات الاستخدام', -- useCasesTitleAr
    1 -- published
);


-- Data for table `inventory_levels`
INSERT INTO `inventory_levels` (`id`, `productId`, `quantity`, `minStockLevel`, `maxStockLevel`, `lastUpdated`) VALUES
(1, 8, 25, 5, 100, '2025-04-12T06:16:39.095Z'),
(2, 3, 42, 5, 100, '2025-04-12T06:16:39.095Z'),
(3, 5, 15, 5, 100, '2025-04-12T06:16:39.095Z'),
(4, 7, 30, 5, 100, '2025-04-12T06:16:39.095Z'),
(5, 4, 10, 5, 100, '2025-04-12T06:16:39.095Z'),
(6, 2, 33, 5, 100, '2025-04-12T06:16:39.095Z');

-- Data for table `inventory_transactions`
INSERT INTO `inventory_transactions` (`id`, `productId`, `quantity`, `type`, `reason`, `createdAt`, `createdBy`, `referenceId`, `notes`) VALUES
(1, 8, 30, 'receive', 'Initial stock', '2025-04-12T06:16:50.170Z', 1, NULL, 'Initial inventory count'),
(2, 8, -5, 'adjust', 'Inventory count', '2025-04-12T06:16:50.170Z', 1, NULL, 'Adjustment after physical count'),
(3, 3, 50, 'receive', 'Purchase order', '2025-04-12T06:16:50.170Z', 1, NULL, 'Restock from supplier'),
(4, 3, -8, 'sale', 'Order #1001', '2025-04-12T06:16:50.170Z', 1, NULL, 'Customer purchase'),
(5, 5, 20, 'receive', 'Initial stock', '2025-04-12T06:16:50.170Z', 1, NULL, 'Initial inventory count'),
(6, 5, -5, 'adjust', 'Damaged goods', '2025-04-12T06:16:50.170Z', 1, NULL, 'Items damaged during shipping'),
(7, 2, 40, 'receive', 'Purchase order', '2025-04-12T06:16:50.170Z', 1, NULL, 'New shipment arrival'),
(8, 2, -7, 'sale', 'Order #1002', '2025-04-12T06:16:50.170Z', 1, NULL, 'Customer purchase');

-- Data for table `users`
-- Note: Using defaultShippingAddressId (INT) instead of default_shipping_address_id (TEXT) for consistency
INSERT INTO `users` (`id`, `username`, `password`, `role`, `email`, `defaultShippingAddressId`, `default_shipping_address_id`) VALUES
(1, 'admin', 'e01bbab46d46db475c5243dcaa03ba40e37b669729059aadb22fd6402e04507f30baf7d9bfc323c315a9b2a5878f67c87d80d478cb957519fd60e0421db9e0a6.b75b919a89c93cb7bdc063b14b796585', 'admin', NULL, 1, NULL), -- Assuming 1 refers to addresses.id = 1
(2, 'omar', '0260c115623226202d077fbdb0f797e20ec2396bf0477486dca73f98b64c0137f238df6fcd80011d8b6a19866f46ede4d1d7c5a0a70841f4a42c5edea21156b1.8eb7fff16c6080277ca83e77ca5fad64', 'user', NULL, NULL, NULL),
(3, 'omar1', 'b61d1198c050d62fac097a98b3198c7c51c0629a335f9a9326745ef41da3050249ae92c7147a26c3e079791f909318eef572f9ab33245db980d78d91e21f85fa.43b03a98a5706c3e42400e3476501a2e', 'user', 'oplayer88@gmail.com', NULL, NULL);


-- Data for table `orders`
INSERT INTO `orders` (`id`, `user_id`, `order_number`, `status`, `total_amount`, `currency`, `payment_status`, `shipping_method`, `shipping_cost`, `shipping_address_id`, `billing_address_id`, `payment_method_id`, `notes`, `created_at`, `updated_at`) VALUES
(4, 1, 'ORD-20250413-1019', 'shipped', '392.98', 'USD', 'paid', 'standard', '0.00', NULL, NULL, NULL, NULL, '2025-04-13T07:06:12.754Z', '2025-04-13T09:04:20.599Z'),
(5, 1, 'ORD-20250413-1877', 'processing', '172.98', 'USD', 'paid', 'standard', '0.00', NULL, NULL, NULL, NULL, '2025-04-13T07:07:44.151Z', '2025-04-13T09:04:12.726Z'),
(6, 1, 'ORD-20250413-6815', 'pending', '129.99', 'USD', 'pending', 'standard', '0.00', NULL, NULL, NULL, NULL, '2025-04-13T14:13:27.771Z', '2025-04-13T14:13:27.771Z'),
(7, 1, 'ORD-20250414-9903', 'pending', '42.99', 'OMR', 'pending', 'standard', '0.00', NULL, NULL, NULL, NULL, '2025-04-14T03:34:36.977Z', '2025-04-14T03:34:36.977Z'),
(8, 1, 'ORD-20250414-3435', 'pending', '349.99', 'OMR', 'pending', 'standard', '0.00', NULL, NULL, NULL, NULL, '2025-04-14T03:46:32.159Z', '2025-04-14T03:46:32.159Z'),
(9, 1, 'ORD-20250414-9930', 'pending', '379.99', 'OMR', 'pending', 'standard', '0.00', NULL, NULL, NULL, NULL, '2025-04-14T10:56:15.102Z', '2025-04-14T10:56:15.102Z'),
(10, 1, 'ORD-20250414-6659', 'pending', '30', 'OMR', 'pending', 'standard', '0.00', NULL, NULL, NULL, NULL, '2025-04-14T12:25:24.975Z', '2025-04-14T12:25:24.975Z'),
(11, 1, 'ORD-20250414-7960', 'pending', '128.97', 'OMR', 'pending', 'standard', '0.00', NULL, NULL, NULL, NULL, '2025-04-14T13:01:33.231Z', '2025-04-14T13:01:33.231Z'),
(12, 1, 'ORD-20250414-1634', 'pending', '85.98', 'OMR', 'pending', 'standard', '0.00', NULL, NULL, NULL, NULL, '2025-04-14T13:03:13.845Z', '2025-04-14T13:03:13.845Z'),
(13, 1, 'ORD-20250414-6987', 'pending', '42.99', 'OMR', 'pending', 'standard', '0.00', NULL, NULL, NULL, NULL, '2025-04-14T13:12:06.249Z', '2025-04-14T13:12:06.249Z'),
(14, 1, 'ORD-20250414-9460', 'shipped', '42.99', 'OMR', 'paid', 'standard', '0.00', '2', '2', NULL, NULL, '2025-04-14T13:31:53.737Z', '2025-04-15T12:40:42.761Z');

-- Data for table `order_items`
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `quantity`, `unit_price`, `subtotal`, `created_at`, `updated_at`) VALUES
(1, 4, 4, 1, '349.99', '349.99', '2025-04-13T07:06:12.800Z', '2025-04-13T07:06:12.800Z'),
(2, 4, 8, 1, '42.99', '42.99', '2025-04-13T07:06:12.905Z', '2025-04-13T07:06:12.905Z'),
(3, 5, 8, 1, '42.99', '42.99', '2025-04-13T07:07:44.187Z', '2025-04-13T07:07:44.187Z'),
(4, 5, 3, 1, '129.99', '129.99', '2025-04-13T07:07:44.188Z', '2025-04-13T07:07:44.188Z'),
(5, 6, 9, 1, '129.99', '129.99', '2025-04-13T14:13:27.807Z', '2025-04-13T14:13:27.807Z'),
(6, 7, 8, 1, '42.99', '42.99', '2025-04-14T03:34:37.013Z', '2025-04-14T03:34:37.013Z'),
(7, 8, 4, 1, '349.99', '349.99', '2025-04-14T03:46:32.198Z', '2025-04-14T03:46:32.198Z'),
(8, 9, 3, 1, '30', '30', '2025-04-14T10:56:15.192Z', '2025-04-14T10:56:15.192Z'),
(9, 9, 4, 1, '349.99', '349.99', '2025-04-14T10:56:15.251Z', '2025-04-14T10:56:15.251Z'),
(10, 10, 3, 1, '30', '30', '2025-04-14T12:25:25.020Z', '2025-04-14T12:25:25.020Z'),
(11, 11, 8, 3, '42.99', '128.97', '2025-04-14T13:01:33.276Z', '2025-04-14T13:01:33.276Z'),
(12, 12, 8, 2, '42.99', '85.98', '2025-04-14T13:03:13.883Z', '2025-04-14T13:03:13.883Z'),
(13, 13, 8, 1, '42.99', '42.99', '2025-04-14T13:12:06.287Z', '2025-04-14T13:12:06.287Z'),
(14, 14, 8, 1, '42.99', '42.99', '2025-04-14T13:31:53.775Z', '2025-04-14T13:31:53.775Z');

-- Data for table `addresses`
INSERT INTO `addresses` (`id`, `userId`, `firstName`, `lastName`, `addressLine1`, `addressLine2`, `city`, `state`, `postalCode`, `country`, `phone`, `isDefault`, `label`, `createdAt`) VALUES
(1, 1, 'omar1', 'almoqbali', 'sohar', '', 'muscut', '', '311', 'OM', '94131544', 1, '', '2025-04-14T13:29:41.832Z'),
(2, 1, 'omar', 'almoqbali', 'sohar', NULL, 'muscut', NULL, '311', 'QA', '94131544', 0, NULL, '2025-04-14T13:31:53.335Z');


-- Data for table `pages`
INSERT INTO `pages` (`id`, `title`, `slug`, `content`, `description`, `is_published`, `meta_title`, `meta_description`, `created_by`, `updated_by`, `created_at`, `updated_at`) VALUES
(9, 'Home', 'home', '<div class=\"container mx-auto px-4 py-8\">\n    <h1 class=\"text-4xl font-bold mb-6\">Welcome to Poultry Gear</h1>\n    <p class=\"text-lg mb-4\">Premium poultry farming equipment for modern farmers.</p>\n    <p>Find the best quality equipment for your poultry farming needs - from feeders and waterers to nesting boxes and coops.</p>\n    <div class=\"mt-6\">\n      <a href=\"/products\" class=\"bg-primary text-white px-4 py-2 rounded\">Shop Now</a>\n    </div>\n  </div>', 'Premium poultry farming equipment and supplies', 1, 'Home - Poultry Gear', 'Premium poultry farming equipment and supplies', 1, 1, '2025-04-15T04:13:19.625Z', '2025-04-15T04:13:19.625Z'),
(10, 'About Us', 'about', '<div class=\"container mx-auto px-4 py-8\">\n    <h1 class=\"text-4xl font-bold mb-6\">About Poultry Gear</h1>\n    <div class=\"prose max-w-none\">\n      <p>Welcome to Poultry Gear, your trusted source for high-quality poultry farming equipment since 2005.</p>\n      \n      <p>At Poultry Gear, we understand the challenges and requirements of modern poultry farming. Our mission is to provide innovative, durable, and efficient equipment that helps farmers improve productivity while maintaining poultry health and welfare.</p>\n      \n      <h2>Our Story</h2>\n      \n      <p>Poultry Gear was founded by a team of agricultural engineers and experienced poultry farmers who saw a need for better equipment in the industry. What began as a small workshop developing specialized feeders has grown into a comprehensive supplier of poultry farming solutions.</p>\n      \n      <h2>Our Commitment</h2>\n      \n      <p>We are committed to:</p>\n      \n      <ul>\n        <li><strong>Quality:</strong> Using premium materials and rigorous testing to ensure our products last</li>\n        <li><strong>Innovation:</strong> Continuously improving our designs based on research and customer feedback</li>\n        <li><strong>Sustainability:</strong> Developing equipment that promotes efficient resource use and reduces waste</li>\n        <li><strong>Customer Support:</strong> Providing expert advice and responsive service to our clients</li>\n      </ul>\n    </div>\n  </div>', 'Learn about Poultry Gear and how we started', 1, 'About Us - Poultry Gear', 'Learn about Poultry Gear and how we started', 1, 1, '2025-04-15T04:14:05.749Z', '2025-04-15T04:14:05.749Z'),
(11, 'FAQ', 'faq', '<div class=\"container mx-auto px-4 py-8\">\n    <h1 class=\"text-4xl font-bold mb-6\">Frequently Asked Questions</h1>\n    <div class=\"prose max-w-none\">\n      <div class=\"space-y-6\">\n        <div>\n          <h3 class=\"text-xl font-semibold\">What types of equipment do you offer?</h3>\n          <p>We offer a complete range of poultry farming equipment including feeders, waterers, nesting boxes, egg collection systems, incubators, brooders, and housing solutions.</p>\n        </div>\n        \n        <div>\n          <h3 class=\"text-xl font-semibold\">Do you offer international shipping?</h3>\n          <p>Yes, we ship to countries across the Middle East, Africa, and parts of Asia. Shipping costs and delivery times vary by location.</p>\n        </div>\n        \n        <div>\n          <h3 class=\"text-xl font-semibold\">What payment methods do you accept?</h3>\n          <p>We accept major credit cards, PayPal, bank transfers, and cash on delivery in select regions.</p>\n        </div>\n        \n        <div>\n          <h3 class=\"text-xl font-semibold\">Do you offer installation services?</h3>\n          <p>Yes, we offer professional installation services for large equipment and complete systems within the UAE and neighboring countries.</p>\n        </div>\n        \n        <div>\n          <h3 class=\"text-xl font-semibold\">What warranty is included with your products?</h3>\n          <p>Most of our products come with a 1-year warranty against manufacturing defects. Premium and commercial-grade equipment may include extended warranties.</p>\n        </div>\n        \n        <div>\n          <h3 class=\"text-xl font-semibold\">Can I return products if they don\'\'t meet my needs?</h3>\n          <p>We offer a 30-day return policy for most unused items in their original packaging. Custom or specialized equipment may have different return terms.</p>\n        </div>\n        \n        <div>\n          <h3 class=\"text-xl font-semibold\">Do you offer consultation for new poultry farms?</h3>\n          <p>Yes, our team of experienced poultry specialists can provide consultation services for farm setup, equipment selection, and optimization.</p>\n        </div>\n        \n        <div>\n          <h3 class=\"text-xl font-semibold\">How can I track my order?</h3>\n          <p>Once your order ships, you will receive a tracking number via email that allows you to monitor the delivery status.</p>\n        </div>\n      </div>\n    </div>\n  </div>', 'Frequently asked questions about our products and services', 1, 'FAQ - Poultry Gear', 'Frequently asked questions about our products and services', 1, 1, '2025-04-15T04:14:35.448Z', '2025-04-15T04:14:35.448Z'),
(12, 'Terms & Conditions', 'terms', '<div class=\"container mx-auto px-4 py-8\">\n    <h1 class=\"text-4xl font-bold mb-6\">Terms & Conditions</h1>\n    <div class=\"prose max-w-none\">\n      <p>Last updated: April 15, 2025</p>\n      \n      <h2>1. Introduction</h2>\n      <p>Welcome to Poultry Gear. These Terms and Conditions govern your use of our website and the purchase of products from our online store.</p>\n      \n      <h2>2. Acceptance of Terms</h2>\n      <p>By accessing our website and placing orders, you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, please do not use our website or services.</p>\n      \n      <h2>3. Product Information</h2>\n      <p>We strive to display our products accurately, but we cannot guarantee that all details and colors are accurate. We reserve the right to modify product specifications without notice.</p>\n      \n      <h2>4. Pricing and Payment</h2>\n      <p>All prices are listed in your selected currency and are subject to change without notice. We accept payment via credit card, bank transfer, and other methods as specified during checkout.</p>\n      \n      <h2>5. Shipping and Delivery</h2>\n      <p>Delivery times vary by location and product availability. We are not responsible for delays caused by customs or other factors outside our control.</p>\n      \n      <h2>6. Returns and Refunds</h2>\n      <p>You may return most unused products in their original packaging within 30 days of delivery for a full refund, minus shipping costs. Custom or specialized equipment may not be eligible for return.</p>\n      \n      <h2>7. Warranty</h2>\n      <p>Most products include a 1-year warranty against manufacturing defects under normal use. Please refer to specific product documentation for detailed warranty information.</p>\n      \n      <h2>8. Privacy Policy</h2>\n      <p>Your use of our website is also governed by our Privacy Policy, which explains how we collect, use, and protect your personal information.</p>\n      \n      <h2>9. Intellectual Property</h2>\n      <p>All content on this website, including text, images, logos, and product designs, is the property of Poultry Gear and is protected by copyright laws.</p>\n      \n      <h2>10. Limitation of Liability</h2>\n      <p>Poultry Gear shall not be liable for any indirect, incidental, or consequential damages resulting from the use of our products or website.</p>\n      \n      <h2>11. Governing Law</h2>\n      <p>These Terms and Conditions are governed by the laws of the United Arab Emirates. Any disputes shall be resolved in the courts of Dubai, UAE.</p>\n      \n      <h2>12. Changes to Terms</h2>\n      <p>We reserve the right to update these Terms and Conditions at any time. Changes will be effective immediately upon posting to the website.</p>\n      \n      <h2>13. Contact Information</h2>\n      <p>If you have any questions about these Terms and Conditions, please contact us at legal@poultrygear.com.</p>\n    </div>\n  </div>', 'Terms and conditions for using our website and services', 1, 'Terms & Conditions - Poultry Gear', 'Terms and conditions for using our website and services', 1, 1, '2025-04-15T04:14:51.246Z', '2025-04-15T04:14:51.246Z');

