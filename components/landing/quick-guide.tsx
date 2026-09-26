import { KeyRound, LogIn, Compass, Smartphone, ArrowLeft, Check } from "lucide-react";

export function QuickGuide() {
  const steps = [
    {
      number: "01",
      icon: KeyRound,
      title: "استلام بيانات الحساب",
      desc: "يقوم الأستاذ يوسف أسامة بإنشاء حسابك الخاص وتزويدك باسم المستخدم وكلمة المرور المؤقتة.",
      accent: "from-blue-500 to-indigo-600 text-blue-500",
    },
    {
      number: "02",
      icon: LogIn,
      title: "تسجيل الدخول",
      desc: "اضغط على زر 'تسجيل الدخول' بالأعلى واستخدم اسم المستخدم وكلمة المرور الخاصة بك.",
      accent: "from-indigo-500 to-purple-600 text-indigo-500",
    },
    {
      number: "03",
      icon: Compass,
      title: "تصفح ومتابعة المحتوى",
      desc: "ستجد المقررات المخصصة لك مقسمة لأقسام ومحاضرات مع إمكانية متابعة نسبة إنجازك وحفظ المفضلة.",
      accent: "from-purple-500 to-pink-600 text-purple-500",
    },
    {
      number: "04",
      icon: Smartphone,
      title: "تثبيت التطبيق PWA",
      desc: "أضف المنصة إلى شاشتك الرئيسية لتفتح كأي تطبيق أصلي بسرعة استجابة مذهلة.",
      accent: "from-emerald-500 to-teal-600 text-emerald-500",
    },
  ];

  return (
    <section id="guide" className="py-20 sm:py-28 border-t border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/30 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-3.5 py-1 rounded-full border border-blue-500/20">
            خطوات الانضمام
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-zinc-900 dark:text-zinc-50 mt-4 mb-3 tracking-tight">
            دليل البدء السريع
          </h2>
          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 font-normal">
            ابدأ رحلتك التعليمية خلال 4 خطوات بسيطة وسريعة
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="group relative rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 flex flex-col justify-between shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-3xl font-black bg-gradient-to-br from-zinc-400 to-zinc-200 dark:from-zinc-600 dark:to-zinc-800 bg-clip-text text-transparent font-mono">
                      {step.number}
                    </span>
                    <div className="h-12 w-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 flex items-center justify-center border border-zinc-200/80 dark:border-zinc-700/80 group-hover:scale-110 group-hover:border-blue-500/50 transition-all">
                      <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                    {step.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {step.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-[11px] font-semibold text-zinc-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  <span>الخطوة {idx + 1} من 4</span>
                  <Check className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
