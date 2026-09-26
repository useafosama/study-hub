"use client";

import * as React from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

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
    <section id="faq" className="py-16 sm:py-24 border-t border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/30">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-3 py-1 rounded-full border border-blue-500/20">
            إجابات واضحة
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-zinc-900 dark:text-zinc-50 mt-4 mb-3">
            الأسئلة الشائعة
          </h2>
          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 font-normal">
            إليك إجابات لأبرز الأسئلة والاستفسارات حول استخدام المنصة
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 transition-all overflow-hidden shadow-xs"
              >
                <button
                  onClick={() => toggle(index)}
                  className="w-full flex items-center justify-between p-5 text-right font-bold text-sm sm:text-base text-zinc-800 dark:text-zinc-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span className="flex items-center gap-3">
                    <HelpCircle className="h-4 w-4 text-blue-500 shrink-0" />
                    <span>{faq.question}</span>
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 text-zinc-400 transition-transform duration-200 shrink-0 mr-2 ${
                      isOpen ? "rotate-180 text-blue-600" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed border-t border-zinc-100 dark:border-zinc-800/60">
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
