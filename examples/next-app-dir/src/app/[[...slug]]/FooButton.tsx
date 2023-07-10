'use client'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

export default async function FooButton() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  return (
    <div>
      <button
        onClick={() => {
          // const x = Math.round(Math.random() * 100)
          // const newParams = new URLSearchParams(searchParams.toString())
          // newParams.set('foo', x.toString())
          // const newUrl = `${pathname}?${newParams.toString()}`
          // router.replace(newUrl)

          const x = Math.round(Math.random() * 100)
          const id = Math.round(Math.random() * 10).toString()
          // set a cookie with newParams
          document.cookie = `builder.patch.${id}=${x.toString()};path=/`
          router.refresh()
        }}
      >
        Press me
      </button>
    </div>
  )
}
