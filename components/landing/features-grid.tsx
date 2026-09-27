import { 
  Play, 
  FileText, 
  CheckCircle2, 
  Smartphone, 
  ShieldCheck, 
  BellRing,
  Sparkles,
  Zap,
  BookmarkCheck,
  Search,
  MonitorPlay
} from "lucide-react";

export function FeaturesGrid() {
  return (
    <section id="features" className="py-20 sm:py-28 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-bold text-primary mb-4 backdrop-blur-md shadow-xs">
            <Sparkles className="h-3.5 w-3.5" />
            <span>إمكانيات فائقة ومدروسة</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground tracking-tight leading-tight mb-4">
            كل ما تحتاجه لتفوقك الدراسي
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground font-normal">
            صممت المنصة بعناية لتمنحك أقصى درجات التركيز والتنظيم بدون أي مشتتات
          </p>
        </div>

        {/* Bento Grid with Pure Apple Frosted Glass Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* Bento Item 1 - Large Feature (2 cols) */}
          <div className="md:col-span-2 glass-card-interactive p-7 sm:p-9 flex flex-col justify-between overflow-hidden group">
            <div className="relative z-10 max-w-lg mb-8">
              <div className="h-13 w-13 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/25 mb-5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <MonitorPlay className="h-6 w-6" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2.5">
                مشاهدة سينمائية نظيفة بدون إعلانات
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                مشغل فيديو ذكي مدمج يعرض شروحات اليوتيوب مباشرة بدون اقتراحات جانبية أو إعلانات تقطع حبل أفكارك، مع دعم التحكم بالسرعات والمفضلة.
              </p>
            </div>

            {/* Visual simulation bar */}
            <div className="relative z-10 p-4 rounded-2xl bg-zinc-950 text-white border border-zinc-800 flex items-center justify-between gap-4 shadow-xl group-hover:border-primary/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/40">
                  <Play className="h-4 w-4 fill-white ml-0.5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-zinc-100">المحاضرة الثالثة — شرح كامل</div>
                  <div className="text-[10px] text-zinc-400">جودة 1080p | وضع التركيز الفائق</div>
                </div>
              </div>
              <span className="text-[10px] font-mono px-3 py-1 rounded-lg bg-zinc-800 text-blue-400 border border-zinc-700">
                1.5x سرعة
              </span>
            </div>
          </div>

          {/* Bento Item 2 - PWA Application */}
          <div className="glass-card-interactive p-7 sm:p-8 flex flex-col justify-between overflow-hidden group">
            <div className="relative z-10">
              <div className="h-13 w-13 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-purple-500/25 mb-5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <Smartphone className="h-6 w-6" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2">
                تطبيق PWA أصلي
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-6">
                ثبّت المنصة مباشرة على جوالك أو جهازك اللوحي لتعمل كتطبيق سريع جداً بضغطة زر واحدة.
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-center text-xs font-bold text-purple-600 dark:text-purple-300 group-hover:bg-purple-500/15 transition-colors">
              ⚡ متاح على iOS & Android
            </div>
          </div>

          {/* Bento Item 3 - PDF & Files */}
          <div className="glass-card-interactive p-7 sm:p-8 flex flex-col justify-between overflow-hidden group">
            <div>
              <div className="h-13 w-13 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/25 mb-5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <FileText className="h-6 w-6" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2">
                مذكرات وملخصات PDF
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                استعراض سريع للمذكرات مباشرة داخل المنصة أو تحميلها وطباعتها بنقرة زر بدون أي تعقيد.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
              <span>معاينة فورية وتحميل مباشر</span>
            </div>
          </div>

          {/* Bento Item 4 - Progress & Bookmarks */}
          <div className="glass-card-interactive p-7 sm:p-8 flex flex-col justify-between overflow-hidden group">
            <div>
              <div className="h-13 w-13 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/25 mb-5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <BookmarkCheck className="h-6 w-6" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2">
                تتبع الإنجاز والمفضلة
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                حدد الدروس المكتملة واحتفظ بالمحاضرات الهامة في مفضلتك للرجوع السريع قبل الاختبارات.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400">
              <CheckCircle2 className="h-4 w-4" />
              <span>إحصائيات تقدم دقيقة لكل مادة</span>
            </div>
          </div>

          {/* Bento Item 5 - Announcements & Updates */}
          <div className="glass-card-interactive p-7 sm:p-8 flex flex-col justify-between overflow-hidden group">
            <div>
              <div className="h-13 w-13 rounded-2xl bg-gradient-to-tr from-rose-500 to-red-600 text-white flex items-center justify-center shadow-lg shadow-rose-500/25 mb-5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <BellRing className="h-6 w-6" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2">
                إعلانات وتنبيهات فورية
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                ابقَ على اطلاع دائم بأي تحديثات أو محاضرات جديدة يضيفها الأستاذ يوسف أسامة.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-2 text-xs font-bold text-rose-600 dark:text-rose-400">
              <CheckCircle2 className="h-4 w-4" />
              <span>تنبيهات فورية في لوحة الطالب</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}

