import { KeyRound, LogIn, Compass, Smartphone, ArrowRight } from "lucide-react";

export function QuickGuide() {
  const steps = [
    {
      number: "01",
      icon: KeyRound,
      title: "استلام بيانات الحساب",
      desc: "يقوم الأستاذ يوسف أسامة بإنشاء حسابك الخاص وتزويدك باسم المستخدم وكلمة المرور المؤقتة.",
    },
    {
      number: "02",
      icon: LogIn,
      title: "تسجيل الدخول",
      desc: "اضغط على زر 'تسجيل الدخول' بالأعلى واستخدم اسم المستخدم وكلمة المرور الخاصة بك.",
    },
    {
      number: "03",
      icon: Compass,
      title: "تصفح ومتابعة المحتوى",
      desc: "ستجد المقررات المخصصة لك مقسمة لأقسام ومحاضرات مع إمكانية متابعة نسبة إنجازك وحفظ المفضلة.",
    },
    {
      number: "04",
      icon: Smartphone,
      title: "تثبيت التطبيق على الجوال",
      desc: "يمكنك إضافة المنصة إلى الشاشة الرئيسية (Add to Home Screen) لفتحها كأي تطبيق سلس وسريع.",
    },
  ];

  return (
    <section id="guide" className="py-16 sm:py-24 border-t border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-3 py-1 rounded-full border border-blue-500/20">
            خطوات بسيطة
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-zinc-900 dark:text-zinc-50 mt-4 mb-3">
            دليل الاستخدام السريع
          </h2>
          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 font-normal">
            كل ما تحتاجه للبدء في استخدام المنصة بكل سهولة خلال دقيقة واحدة
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="relative rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-black text-blue-600/30 dark:text-blue-400/30 font-mono">
                      {step.number}
                    </span>
                    <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/20">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                    {step.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
