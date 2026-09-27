import { KeyRound, LogIn, Compass, Smartphone, ArrowLeft, Check } from "lucide-react";

export function QuickGuide() {
  const steps = [
    {
      number: "01",
      icon: KeyRound,
      title: "استلام بيانات الحساب",
      desc: "يقوم الأستاذ يوسف أسامة بإنشاء حسابك الخاص وتزويدك باسم المستخدم وكلمة المرور المؤقتة.",
      gradient: "from-blue-600 to-indigo-600",
    },
    {
      number: "02",
      icon: LogIn,
      title: "تسجيل الدخول",
      desc: "اضغط على زر 'تسجيل الدخول' بالأعلى واستخدم اسم المستخدم وكلمة المرور الخاصة بك.",
      gradient: "from-indigo-600 to-purple-600",
    },
    {
      number: "03",
      icon: Compass,
      title: "تصفح ومتابعة المحتوى",
      desc: "ستجد المقررات المخصصة لك مقسمة لأقسام ومحاضرات مع إمكانية متابعة نسبة إنجازك وحفظ المفضلة.",
      gradient: "from-purple-600 to-pink-600",
    },
    {
      number: "04",
      icon: Smartphone,
      title: "تثبيت التطبيق PWA",
      desc: "أضف المنصة إلى شاشتك الرئيسية لتفتح كأي تطبيق أصلي بسرعة استجابة مذهلة.",
      gradient: "from-emerald-600 to-teal-600",
    },
  ];

  return (
    <section id="guide" className="py-20 sm:py-28 border-t border-border/60 bg-muted/20 relative backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-3.5 py-1 rounded-full border border-primary/20 shadow-xs">
            خطوات الانضمام
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground mt-4 mb-3 tracking-tight">
            دليل البدء السريع
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground font-normal">
            ابدأ رحلتك التعليمية خلال 4 خطوات بسيطة وسريعة
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="group glass-card-interactive p-7 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-3xl font-black bg-gradient-to-br from-muted-foreground/50 to-muted-foreground/20 bg-clip-text text-transparent font-mono group-hover:from-blue-600 group-hover:to-indigo-600 transition-all duration-300">
                      {step.number}
                    </span>
                    <div className={`h-12 w-12 rounded-2xl bg-gradient-to-tr ${step.gradient} text-white flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                      <Icon className="h-6 w-6" />
                    </div>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-foreground mb-2">
                    {step.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {step.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-border/50 flex items-center justify-between text-[11px] font-bold text-muted-foreground group-hover:text-primary transition-colors">
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

