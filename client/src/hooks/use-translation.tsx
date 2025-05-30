import { useLanguage } from './use-language';

// Translation function type
export type TranslationFunction = (key: string, fallback?: string) => string;

// Simple translations object with English and Arabic
const translations: Record<string, Record<string, string>> = {
  en: {
    // Authentication & User
    login_register: "Login / Register",
    login: "Login",
    register: "Register",
    logout: "Logout",
    my_account: "My Account",
    my_orders: "My Orders",
    my_addresses: "My Addresses",
    payment_methods: "Payment Methods",
    account_settings: "Account Settings",
    email: "Email",
    password: "Password",
    username: "Username",
    first_name: "First Name",
    last_name: "Last Name",
    phone_number: "Phone Number",
    address: "Address",
    city: "City",
    country: "Country",
    postal_code: "Postal/Zip Code",
    order_notes: "Order Notes (Optional)",
    recent_orders: "Recent Orders",
    most_recent_orders_from_this_customer: "Most recent orders placed by this customer",
    default_shipping_address: "Default Shipping Address",
    customer_id: "Customer ID",
    back_to_customers: "Back to Customers",
    registered_date: "Registered Date",
    not_available: "Not Available",
    orders_placed: "Orders Placed",
    total_spent: "Total Spent",
    customer_since: "Customer Since",
    order_number: "Order Number",
    order_history: "Order History",
    complete_order_history_for_this_customer: "Complete order history for this customer",
    customer_shipping_and_billing_addresses: "Customer Shipping and Billing Addresses",
    // Placeholders
    enter_first_name: "Enter your first name",
    enter_last_name: "Enter your last name",
    enter_email: "Enter your email address",
    enter_phone: "Enter your phone number",
    enter_address: "Enter your street address",
    enter_city: "Enter your city",
    enter_postal_code: "Enter your postal code",
    select_country: "Select your country",
    order_instructions: "Special instructions for delivery or order",
    profile_image_url: "Profile Image URL",
    continue_as_guest: "Continue as Guest",
    continue_as_guest_or_login: "Continue as a guest or log in",
    guest_checkout_message: "You're checking out as a guest. If you have an account, log in for a faster checkout experience.",
    checkout: "Checkout",
    complete_your_purchase: "Complete your purchase by providing your shipping information",
    shipping_information: "Shipping Information",
    delivery_options: "Delivery Options",
    payment_method: "Payment Method",
    order_summary: "Order Summary",
    create_account_for_faster_checkout: "Create an account for faster checkout",
    save_information_create_account: "Save my information and create an account",
    account_benefits: "Create an account to track orders, save addresses, and enjoy a faster checkout experience next time.",
    place_order: "Place Order",
    processing_order: "Processing...",
    return_to_cart: "Return to Cart",
    secure_checkout: "Secure Checkout",
    free_shipping: "Free shipping on orders over $100",
    delivery_timeframe: "Delivery within 3-5 business days",
    bank_transfer_details: "Bank Transfer Details",
    transfer_instructions: "Please transfer the total amount to the following bank account:",
    bank_name: "Bank Name",
    account_number: "Account Number",
    account_holder: "Account Holder",
    transfer_reference: "Please use your order number as a reference when making the transfer. Your order will be shipped once we receive the payment.",
    item_singular: "item",
    items_plural: "items",
    items_in_cart: "items in cart",
    order_subtotal: "Subtotal",
    shipping_cost: "Shipping",
    free_label: "Free",
    order_total: "Total",
    including_taxes_and_fees: "Including taxes and fees",
    quantity_short: "Qty",
    
    // Account Pages
    manage_your_account_settings_and_preferences: "Manage your account settings and preferences",
    manage_your_profile_information: "Manage your personal information",
    profile_settings: "Profile Settings",
    personal_information: "Personal Information",
    update_your_personal_details: "Update your personal information",
    account_summary: "Account Summary",
    overview_of_your_activity: "Overview of your activity on Poultry Gear",
    total_orders: "Total Orders",
    saved_addresses: "Saved Addresses",
    quick_actions: "Quick Actions",
    view_orders: "View Orders",
    manage_addresses: "Manage Addresses",
    edit_account: "Edit Account",
    save_changes: "Save Changes",
    saving: "Saving...",
    edit: "Edit",
    cancel: "Cancel",
    
    // Orders
    view_and_track_your_orders: "View and track your orders",
    order: "Order",
    items: "Items",
    total: "Total",
    date: "Date",
    status: "Status",
    payment: "Payment",
    view_order: "View Order",
    status_updates: "Status Updates",
    no_orders_yet: "No Orders Yet",
    no_orders_message: "You haven't placed any orders yet. Start shopping to see your orders here.",
    start_shopping: "Start Shopping",
    pending: "Pending",
    processing: "Processing",
    shipped: "Shipped",
    delivered: "Delivered",
    order_progress: "Order Progress",
    print_order: "Print Order",
    placed: "Placed",
    order_questions: "Order Questions",
    view_faqs: "View FAQs",
    contact_support: "Contact Support",
    order_details: "Order Details",
    order_timeline: "Order Timeline",
    order_items: "Order Items",
    order_placed: "Order Placed",
    need_help: "Need Help?",
    order_help_message: "If you have any questions about your order or need assistance, please contact our customer support team.",
    back_to_orders: "Back to Orders",
    placed_on: "Placed on",
    tax: "Tax",
    quantity: "Quantity",
    price: "Price",
    included: "Included",
    order_pending_message: "Your order is currently pending payment confirmation. We'll update the status once payment is verified.",
    order_processing_message: "Your order is being processed. We're preparing your items for shipment.",
    order_shipped_message: "Your order has been shipped and is on its way to you. Track your shipment using the provided tracking information.",
    order_delivered_message: "Your order has been delivered. Thank you for shopping with us!",
    order_received_message: "Your order has been received and is being processed.",
    
    // Addresses
    manage_your_shipping_addresses: "Manage your shipping addresses",
    add_new_address: "Add New Address",
    no_addresses_yet: "No Addresses Yet",
    add_your_first_address_message: "You haven't added any addresses yet. Add your first address to make checkout easier.",
    add_your_first_address: "Add Your First Address",
    default: "Default",
    set_as_default: "Set as Default",
    delete: "Delete",
    
    // Payment Methods
    manage_your_payment_methods: "Manage your payment methods",
    add_payment_method: "Add Payment Method",
    no_payment_methods_yet: "No Payment Methods Yet",
    add_your_first_payment_method_message: "You haven't added any payment methods yet. Add your first payment method to make checkout easier.",
    add_your_first_payment_method: "Add Your First Payment Method",
    expires: "Expires",
    
    // Account Settings
    manage_your_account_security: "Manage your account security and privacy settings",
    change_password: "Change Password",
    update_your_password: "Update your account password",
    current_password: "Current Password",
    new_password: "New Password",
    confirm_password: "Confirm Password",
    update_password: "Update Password",
    updating: "Updating...",
    session_security: "Session Security",
    manage_your_active_sessions: "Manage your active login sessions",
    last_login: "Last Login",
    never: "Never",
    logout_all_devices: "Logout from All Devices",
    logout_all_devices_confirmation: "This will log you out from all devices where you're currently logged in. You'll need to log in again on each device.",
    confirm: "Confirm",
    delete_account: "Delete Account",
    permanently_delete_your_account: "Permanently delete your account and all associated data",
    delete_account_warning: "This action cannot be undone. This will permanently delete your account and remove all your data from our servers.",
    are_you_absolutely_sure: "Are you absolutely sure?",
    delete_account_confirmation: "This action cannot be undone. This will permanently delete your account and remove your data from our servers."
  },
  ar: {
    // Authentication & User
    login_register: "تسجيل دخول / تسجيل",
    login: "تسجيل دخول",
    register: "تسجيل",
    logout: "تسجيل خروج",
    my_account: "حسابي",
    my_orders: "طلباتي",
    my_addresses: "عناويني",
    payment_methods: "طرق الدفع",
    account_settings: "إعدادات الحساب",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    username: "اسم المستخدم",
    first_name: "الاسم الأول",
    last_name: "اسم العائلة",
    phone_number: "رقم الهاتف",
    address: "العنوان",
    city: "المدينة",
    country: "الدولة",
    postal_code: "الرمز البريدي",
    order_notes: "ملاحظات الطلب (اختياري)",
    recent_orders: "الطلبات الأخيرة",
    most_recent_orders_from_this_customer: "أحدث الطلبات المقدمة من هذا العميل",
    default_shipping_address: "عنوان الشحن الافتراضي",
    customer_id: "معرف العميل",
    back_to_customers: "العودة إلى العملاء",
    // Placeholders
    enter_first_name: "أدخل اسمك الأول",
    enter_last_name: "أدخل اسم العائلة",
    enter_email: "أدخل عنوان بريدك الإلكتروني",
    enter_phone: "أدخل رقم هاتفك",
    enter_address: "أدخل عنوان الشارع الخاص بك",
    enter_city: "أدخل مدينتك",
    enter_postal_code: "أدخل الرمز البريدي",
    select_country: "اختر بلدك",
    order_instructions: "تعليمات خاصة للتسليم أو الطلب",
    profile_image_url: "رابط صورة الملف الشخصي",
    continue_as_guest: "المتابعة كضيف",
    continue_as_guest_or_login: "المتابعة كضيف أو تسجيل الدخول",
    guest_checkout_message: "أنت تقوم بإتمام الشراء كضيف. إذا كان لديك حساب، قم بتسجيل الدخول للحصول على تجربة دفع أسرع.",
    checkout: "إتمام الطلب",
    complete_your_purchase: "أكمل عملية الشراء بتقديم معلومات الشحن الخاصة بك",
    shipping_information: "معلومات الشحن",
    delivery_options: "خيارات التوصيل",
    payment_method: "طريقة الدفع",
    order_summary: "ملخص الطلب",
    create_account_for_faster_checkout: "إنشاء حساب لتسريع عملية الدفع",
    save_information_create_account: "احفظ معلوماتي وأنشئ حسابًا",
    account_benefits: "أنشئ حسابًا لتتبع الطلبات وحفظ العناوين والاستمتاع بتجربة دفع أسرع في المرة القادمة.",
    place_order: "إتمام الطلب",
    processing_order: "جارِ المعالجة...",
    return_to_cart: "العودة إلى السلة",
    secure_checkout: "دفع آمن",
    free_shipping: "شحن مجاني للطلبات التي تزيد عن $100",
    delivery_timeframe: "التوصيل خلال 3-5 أيام عمل",
    bank_transfer_details: "تفاصيل التحويل المصرفي",
    transfer_instructions: "يرجى تحويل المبلغ الإجمالي إلى الحساب المصرفي التالي:",
    bank_name: "اسم البنك",
    account_number: "رقم الحساب",
    account_holder: "صاحب الحساب",
    transfer_reference: "يرجى استخدام رقم طلبك كمرجع عند إجراء التحويل. سيتم شحن طلبك بمجرد استلام الدفعة.",
    item_singular: "منتج",
    items_plural: "منتجات",
    items_in_cart: "منتجات في السلة",
    order_subtotal: "المجموع الفرعي",
    shipping_cost: "الشحن",
    free_label: "مجاني",
    order_total: "الإجمالي",
    including_taxes_and_fees: "شامل الضرائب والرسوم",
    quantity_short: "الكمية",
    
    // Account Pages
    manage_your_account_settings_and_preferences: "إدارة إعدادات وتفضيلات حسابك",
    manage_your_profile_information: "إدارة معلوماتك الشخصية",
    profile_settings: "إعدادات الملف الشخصي",
    personal_information: "المعلومات الشخصية",
    update_your_personal_details: "تحديث معلوماتك الشخصية",
    account_summary: "ملخص الحساب",
    overview_of_your_activity: "نظرة عامة على نشاطك في بولتري جير",
    total_orders: "إجمالي الطلبات",
    saved_addresses: "العناوين المحفوظة",
    quick_actions: "إجراءات سريعة",
    view_orders: "عرض الطلبات",
    manage_addresses: "إدارة العناوين",
    edit_account: "تعديل الحساب",
    save_changes: "حفظ التغييرات",
    saving: "جاري الحفظ...",
    edit: "تعديل",
    cancel: "إلغاء",
    
    // Orders
    view_and_track_your_orders: "عرض وتتبع طلباتك",
    order: "طلب",
    items: "العناصر",
    total: "الإجمالي",
    view_order: "عرض الطلب",
    status_updates: "تحديثات الحالة",
    no_orders_yet: "لا توجد طلبات بعد",
    no_orders_message: "لم تقم بإجراء أي طلبات بعد. ابدأ التسوق لرؤية طلباتك هنا.",
    start_shopping: "ابدأ التسوق",
    pending: "قيد الانتظار",
    processing: "قيد المعالجة",
    shipped: "تم الشحن",
    delivered: "تم التوصيل",
    order_progress: "تقدم الطلب",
    print_order: "طباعة الطلب",
    placed: "تم الطلب",
    order_questions: "أسئلة حول الطلب",
    view_faqs: "عرض الأسئلة الشائعة",
    contact_support: "اتصل بالدعم",
    order_details: "تفاصيل الطلب",
    order_timeline: "الجدول الزمني للطلب",
    order_items: "عناصر الطلب",
    order_placed: "تم وضع الطلب",
    need_help: "تحتاج مساعدة؟",
    order_help_message: "إذا كان لديك أي أسئلة حول طلبك أو تحتاج إلى مساعدة، يرجى الاتصال بفريق دعم العملاء.",
    back_to_orders: "العودة إلى الطلبات",
    placed_on: "تم الطلب في",
    tax: "ضريبة",
    quantity: "كمية",
    price: "سعر",
    included: "مشمول",
    order_pending_message: "طلبك قيد الانتظار للتأكد من الدفع. سنقوم بتحديث الحالة بمجرد التحقق من الدفع.",
    order_processing_message: "طلبك قيد المعالجة. نقوم بتجهيز الأغراض الخاصة بك للشحن.",
    order_shipped_message: "تم شحن طلبك وهو في طريقه إليك. يمكنك تتبع شحنتك باستخدام معلومات التتبع المقدمة.",
    order_delivered_message: "تم تسليم طلبك. شكرا للتسوق معنا!",
    order_received_message: "تم استلام طلبك وهو قيد المعالجة.",
    
    // Addresses
    manage_your_shipping_addresses: "إدارة عناوين الشحن الخاصة بك",
    add_new_address: "إضافة عنوان جديد",
    no_addresses_yet: "لا توجد عناوين بعد",
    add_your_first_address_message: "لم تقم بإضافة أي عناوين بعد. أضف عنوانك الأول لتسهيل عملية الدفع.",
    add_your_first_address: "أضف عنوانك الأول",
    default: "افتراضي",
    set_as_default: "تعيين كافتراضي",
    delete: "حذف",
    
    // Payment Methods
    manage_your_payment_methods: "إدارة طرق الدفع الخاصة بك",
    add_payment_method: "إضافة طريقة دفع",
    no_payment_methods_yet: "لا توجد طرق دفع بعد",
    add_your_first_payment_method_message: "لم تقم بإضافة أي طرق دفع بعد. أضف طريقة الدفع الأولى الخاصة بك لتسهيل عملية الدفع.",
    add_your_first_payment_method: "أضف طريقة الدفع الأولى",
    expires: "تنتهي الصلاحية",
    
    // Account Settings
    manage_your_account_security: "إدارة أمان وخصوصية حسابك",
    change_password: "تغيير كلمة المرور",
    update_your_password: "تحديث كلمة مرور حسابك",
    current_password: "كلمة المرور الحالية",
    new_password: "كلمة المرور الجديدة",
    confirm_password: "تأكيد كلمة المرور",
    update_password: "تحديث كلمة المرور",
    updating: "جاري التحديث...",
    session_security: "أمان الجلسة",
    manage_your_active_sessions: "إدارة جلسات تسجيل الدخول النشطة",
    last_login: "آخر تسجيل دخول",
    never: "أبدًا",
    logout_all_devices: "تسجيل الخروج من جميع الأجهزة",
    logout_all_devices_confirmation: "سيؤدي هذا إلى تسجيل خروجك من جميع الأجهزة التي قمت بتسجيل الدخول إليها حاليًا. ستحتاج إلى تسجيل الدخول مرة أخرى على كل جهاز.",
    confirm: "تأكيد",
    delete_account: "حذف الحساب",
    permanently_delete_your_account: "حذف حسابك بشكل دائم وجميع البيانات المرتبطة به",
    delete_account_warning: "لا يمكن التراجع عن هذا الإجراء. سيؤدي هذا إلى حذف حسابك بشكل دائم وإزالة جميع بياناتك من خوادمنا.",
    are_you_absolutely_sure: "هل أنت متأكد تمامًا؟",
    delete_account_confirmation: "لا يمكن التراجع عن هذا الإجراء. سيؤدي هذا إلى حذف حسابك بشكل دائم وإزالة بياناتك من خوادمنا."
  }
};

// Hook to access translations
export function useTranslation() {
  const { language } = useLanguage();
  
  // Translation function that returns a translated string or fallback
  const t: TranslationFunction = (key, fallback = key) => {
    const currentTranslations = translations[language] || translations.en;
    return currentTranslations[key] || fallback;
  };
  
  // Flag to check if current language is Arabic
  const isArabic = language === 'ar';
  
  return { t, isArabic };
}