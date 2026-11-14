import type { Locale } from "./config";

/** Interface chrome only (buttons, form labels, states). Site content lives in Supabase. */
const ui = {
  ar: {
    skipToContent: "انتقل إلى المحتوى", home: "الرئيسية", about: "من نحن", services: "الخدمات", portfolio: "أعمالنا",
    contact: "تواصل معنا", privacy: "سياسة الخصوصية", menu: "القائمة", close: "إغلاق", play: "تشغيل الفيديو", language: "English",
    loading: "جارٍ التحميل…", empty: "لا يوجد محتوى منشور بعد.", error: "حدث خطأ أثناء تحميل المحتوى. حاول مرة أخرى.",
    retry: "إعادة المحاولة", notFoundTitle: "الصفحة غير موجودة", notFoundBody: "الرابط الذي فتحته غير صحيح أو تم حذف الصفحة.",
    backHome: "العودة للرئيسية", viewProject: "عرض المشروع", viewService: "تفاصيل الخدمة", allProjects: "كل الأعمال",
    allServices: "كل الخدمات", visitProject: "زيارة المشروع", challenge: "التحدي", solution: "الحل", results: "النتائج",
    gallery: "المعرض", client: "العميل", category: "التصنيف", whatsapp: "تواصل عبر واتساب", features: "المميزات",
    noProjects: "لا توجد أعمال منشورة بعد.", noServices: "لا توجد خدمات منشورة بعد.", noTestimonials: "لا توجد آراء منشورة بعد.",
    formTitle: "ابدأ مشروعك", name: "الاسم", company: "الشركة", country: "الدولة", email: "البريد الإلكتروني",
    whatsappNumber: "رقم واتساب", service: "الخدمة المطلوبة", budget: "الميزانية", details: "تفاصيل المشروع",
    selectOne: "اختر", other: "أخرى", send: "إرسال الطلب", sending: "جارٍ الإرسال…",
    sent: "تم استلام طلبك. سنتواصل معك قريبًا.", sendAnother: "إرسال طلب آخر",
    required: "هذا الحقل مطلوب.", invalidEmail: "أدخل بريدًا إلكترونيًا صحيحًا.", invalidPhone: "أدخل رقمًا صحيحًا مع رمز الدولة.",
    tooShort: "اكتب 10 أحرف على الأقل.", submitError: "تعذر إرسال الطلب. حاول مرة أخرى بعد قليل.",
    budgetOptions: ["أقل من 1,000 دولار", "1,000 – 5,000 دولار", "5,000 – 15,000 دولار", "أكثر من 15,000 دولار", "لست متأكدًا"],
  },
  en: {
    skipToContent: "Skip to content", home: "Home", about: "About", services: "Services", portfolio: "Portfolio",
    contact: "Contact", privacy: "Privacy Policy", menu: "Menu", close: "Close", play: "Play video", language: "العربية",
    loading: "Loading…", empty: "Nothing has been published yet.", error: "Something went wrong while loading content. Try again.",
    retry: "Try again", notFoundTitle: "Page not found", notFoundBody: "The link is wrong or the page was removed.",
    backHome: "Back to home", viewProject: "View project", viewService: "Service details", allProjects: "All work",
    allServices: "All services", visitProject: "Visit project", challenge: "Challenge", solution: "Solution", results: "Results",
    gallery: "Gallery", client: "Client", category: "Category", whatsapp: "Chat on WhatsApp", features: "Features",
    noProjects: "No projects published yet.", noServices: "No services published yet.", noTestimonials: "No testimonials published yet.",
    formTitle: "Start your project", name: "Name", company: "Company", country: "Country", email: "Email",
    whatsappNumber: "WhatsApp number", service: "Service", budget: "Budget", details: "Project details",
    selectOne: "Select", other: "Other", send: "Send request", sending: "Sending…",
    sent: "We received your request and will get back to you soon.", sendAnother: "Send another request",
    required: "This field is required.", invalidEmail: "Enter a valid email address.", invalidPhone: "Enter a valid number with country code.",
    tooShort: "Write at least 10 characters.", submitError: "Couldn't send your request. Please try again shortly.",
    budgetOptions: ["Under $1,000", "$1,000 – $5,000", "$5,000 – $15,000", "Over $15,000", "Not sure yet"],
  },
} as const;

export const t = (locale: Locale) => ui[locale];
