import { 
  Play, 
  FileSpreadsheet, 
  CheckCircle, 
  Zap, 
  ShieldCheck, 
  BellRing,
  Sparkles,
  Smartphone
} from "lucide-react";

export function FeaturesGrid() {
  const features = [
    {
      icon: Play,
      title: "مشاهدة هادئة ومركزة",
      desc: "مشغل فيديو مدمج ونظيف يعرض شروحات اليوتيوب بدون أي إعلانات أو توصيات مشتتة.",
      color: "text-blue-500 bg-blue-50 dark:bg-blue-950/60 border-blue-500/20",
    },
    {
      icon: FileSpreadsheet,
      title: "مذكرات وملفات PDF منظمة",
      desc: "تصفح المذكرات والملخصات بسهولة مع إمكانية التحميل أو الفتح في نافذة جديدة بنقرة واحدة.",
      color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500/20",
    },
    {
      icon: CheckCircle,
      title: "متابعة نسبة الإنجاز",
      desc: "احفظ الدروس المكتملة وعيّن المحاضرات في المفضلة للرجوع إليها ومراجعتها لاحقاً.",
      color: "text-indigo-500 bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500/20",
    },
    {
      icon: Smartphone,
      title: "تجربة تطبيق PWA كاملة",
      desc: "تطبيق سريع جداً، خفيف الوزن، ويعمل بسلاسة فائقة على الهواتف والأجهزة اللوحية والكمبيوتر.",
      color: "text-purple-500 bg-purple-50 dark:bg-purple-950/60 border-purple-500/20",
    },
    {
      icon: ShieldCheck,
      title: "خصوصية وأمان للمحتوى",
      desc: "وصول مخصص للطلاب المصرح لهم فقط بدون تسجيل عام أو مشاركة غير مرغوبة للبيانات.",
      color: "text-amber-500 bg-amber-50 dark:bg-amber-950/60 border-amber-500/20",
    },
    {
      icon: BellRing,
      title: "إعلانات وتحديثات لحظية",
      desc: "تنبيهات فورية بأي إضافات جديدة للمحتوى أو مواعيد هامة للمقررات والمحاضرات.",
      color: "text-rose-500 bg-rose-50 dark:bg-rose-950/60 border-rose-500/20",
    },
  ];

  return (
    <section id="features" className="py-16 sm:py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1 rounded-full border border-indigo-500/20">
            أهم الإمكانيات
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-zinc-900 dark:text-zinc-50 mt-4 mb-3">
            كل ما تحتاجه لتجربة دراسية متكاملة
          </h2>
          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 font-normal">
            صممت المنصة لتركز على الدراسة المباشرة بدون أي حشو أو تعقيد
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/60 backdrop-blur-xs p-6 shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-all text-right"
              >
                <div className={`h-11 w-11 rounded-xl flex items-center justify-center border mb-5 ${item.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
