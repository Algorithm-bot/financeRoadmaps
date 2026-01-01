export default function Footer() {
    const currentYear = new Date().getFullYear();
  
    return (
      <footer className="w-full border-t border-slate-200/80 bg-white/80 py-8 backdrop-blur-md transition-colors supports-[backdrop-filter]:bg-white/60 dark:border-slate-800/80 dark:bg-slate-950/80">
        <div className="container mx-auto flex max-w-6xl flex-col items-center justify-center gap-4 px-4 text-center">
          
          {/* Main Copyright / Brand Line */}
          <p className="text-xm font-medium text-slate-900 dark:text-slate-200">
            © {currentYear} FinRasta. All rights reserved.
          </p>
  
          {/* Disclaimer Section */}
          <div className="max-w-3xl space-y-2">
            <p className="text-xm leading-relaxed text-slate-500 dark:text-slate-500">
              <span className="font-semibold text-slate-600 dark:text-slate-400">
                Limitation of Liability:
              </span>{" "}
              The content provided herein is for general information only. While we
              strive to keep data current, we make no representations or warranties
              of any kind, express or implied, about the completeness or accuracy of
              the salary and career information. Reliance on this information is strictly at
              your own risk.
            </p>
          </div>
          
        </div>
      </footer>
    );
  }
