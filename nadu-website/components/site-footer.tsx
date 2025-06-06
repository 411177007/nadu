import Link from "next/link"

export function SiteFooter() {
  return (
    <footer className="border-t bg-muted/40">
      <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            &copy; {new Date().getFullYear()} Nadu 官方代購網站. 版權所有.
          </p>
        </div>
        <div className="flex gap-4">
          <Link href="/terms" className="text-sm text-muted-foreground underline underline-offset-4">
            使用條款
          </Link>
          <Link href="/privacy" className="text-sm text-muted-foreground underline underline-offset-4">
            隱私政策
          </Link>
          <Link href="/contact" className="text-sm text-muted-foreground underline underline-offset-4">
            聯絡我們
          </Link>
        </div>
      </div>
    </footer>
  )
}
