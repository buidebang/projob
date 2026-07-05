export class SEOCompiler {
  public static compile(rawContent: string, platform: string): string {
    const cleanBody = rawContent.trim();
    switch (platform.toLowerCase()) {
      case 'twitter':
      case 'x':
        return `🧵 **X Thread Edition (Premium Priority Multiplier)**\n\n🔥 ${cleanBody.substring(0, 250)}...\n\n(لینک‌های مرجع دیتا دیسکاور به دلیل قوانین سیستم ترافیک در کامنت اول قرار گرفت 👇)`;
      case 'linkedin':
        return `📌 **LinkedIn Executive Insight**\n\n${cleanBody}\n\n#سئو_داده_محور #توسعه_سازمانی #دیتابیس`;
      case 'instagram':
        return `📸 **Instagram Conversion Matrix**\n\n🚀 قلاب طلایی ثانیه‌های اول پست\n\n${cleanBody}\n\n.\n.\n.\n💎 @Lextit_Biotech\n#اقیانوس_آبی #تحلیل_داده`;
      case 'youtube':
        return `🎥 **YouTube Unified Funnel Script**\n\n[HIGHT-RETENTION INTRO SHORTS TRAILER]: اسکریپت قلاب ۳ ثانیه‌ای برای میخکوب کردن کاربر موبایل...\n\n[LONG-FORM VIDEO STRUCTURE]:\n${cleanBody}`;
      case 'tiktok':
        return `🎵 **TikTok Vector-Targeting Scenario Script**\n\n[00:00 - 00:03]: فریم متن نئونی پرکننده کل صفحه نمایش گوشی + موزیک ترند اقیانوس آرام\n\n${cleanBody}`;
      case 'threads':
        return `🧵 **Threads Interest-Graph Dispatch**\n\n${cleanBody}\n\n[Topical Node: Unified Ecosystem Conversion Analysis]`;
      case 'dark_social':
        return `📁 **Dark Social Gated Pipeline Block**\n\n${cleanBody}`;
      default:
        return cleanBody;
    }
  }
}
