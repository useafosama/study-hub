"use client";

import * as React from "react";
import { ChevronDown, HelpCircle, Sparkles } from "lucide-react";

export function FAQSection() {
  const [openIndex, setOpenIndex] = React.useState<number | null>(0);

  const faqs = [
    {
      question: "كيف يمكنني الحصول على حساب في المنصة؟",
      answer: "المنصة خاصة ويتم إنشاء الحسابات وإدارتها حصرياً بواسطة الأستاذ يوسف أسامة. عند اشتراكك سيتم تزويدك باسم المستخدم وكلمة المرور الخاصة بك.",
    },
    {
      question: "هل يمكنني تشغيل المنصة كتطبيق على الهاتف؟",
      answer: "نعم بكل تأكيد! المنصة مبنية بتقنية Progressive Web App (PWA)، ويمكنك الضغط على خيارات المتصفح واختيار 'إضافة إلى الشاشة الرئيسية' لتثبيتها واستخدامها كتطبيق كامل على iOS و Android.",
    },
    {
      question: "هل تعمل الفيديوهات بدون إعلانات مزعجة؟",
      answer: "نعم، يتم تضمين الفيديوهات عبر مشغل مخصص يركز على المحتوى التعليمي مباشرة ويقلل من عناصر التشتيت والإعلانات لضمان تركيزك الكامل.",
    },
    {
      question: "كيف أقوم بتغيير كلمة المرور الخاصة بي؟",
      answer: "يمكنك بعد تسجيل الدخول التوجه لصفحة 'الملف الشخصي' من القائمة وتغيير كلمة المرور الخاصة بك في أي وقت بكل سهولة.",
    },
    {
      question: "ماذا أفعل في حال واجهت أي مشكلة أثناء تسجيل الدخول؟",
      answer: "يرجى التأكد من كتابة اسم المستخدم وكلمة المرور بدقة وبدون مسافات، وفي حال استمرار المشكلة تواصل مباشرة مع الأستاذ يوسف أسامة لإعادة تعيين البيانات فوراً.",
    },
  ];

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-20 sm:py-28 border-t border-white/80 bg-white/30 backdrop-blur-xl">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        
        <div className="text-center mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3.5 py-1 rounded-full border border-blue-200/60 shadow-xs">
            إجابات واضحة
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-zinc-900 mt-4 mb-3 tracking-tight">
            الأسئلة الشائعة
          </h2>
          <p className="text-sm sm:text-base text-zinc-600 font-normal">
            إليك إجابات لأبرز الأسئلة والاستفسارات حول استخدام المنصة
          </p>
        </div>

        <div className="space-y-3.5">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="glass-panel overflow-hidden transition-all duration-300 hover:border-blue-300"
              >
                <button
                  onClick={() => toggle(index)}
                  className="w-full flex items-center justify-between p-5 text-right font-bold text-sm sm:text-base text-zinc-800 hover:text-blue-600 transition-colors cursor-pointer select-none"
                  aria-expanded={isOpen}
                >
                  <span className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-200/60">
                      <HelpCircle className="h-4 w-4" />
                    </div>
                    <span>{faq.question}</span>
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 text-zinc-400 transition-transform duration-300 shrink-0 mr-2 ${
                      isOpen ? "rotate-180 text-blue-600" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-zinc-600 leading-relaxed border-t border-zinc-100 animate-in fade-in slide-in-from-top-1 duration-200">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
