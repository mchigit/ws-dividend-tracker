import { XMarkIcon } from "@heroicons/react/20/solid"
import { useState } from "react"

export default function OldDataBanner() {
  const [isDismissed, setIsDismissed] = useState(false)

  if (isDismissed) {
    return null
  }

  return (
    <div className="flex items-center gap-x-6 bg-gray-900 px-6 py-2.5 sm:px-3.5 sm:before:flex-1">
      <p className="text-sm leading-6 text-white">
        <a href="https://www.wealthsimple.com/">
          <strong className="font-semibold">WS Dividend</strong>
          <svg
            viewBox="0 0 2 2"
            aria-hidden="true"
            className="mx-2 inline h-0.5 w-0.5 fill-current">
            <circle r={1} cx={1} cy={1} />
          </svg>
          Your data might be out of date. Login to WealthSimple to refresh.
        </a>
      </p>
      <div className="flex flex-1 justify-end">
        <button
          onClick={() => {
            setIsDismissed(true)
          }}
          type="button"
          className="-m-3 p-3 focus-visible:outline-offset-[-4px]">
          <span className="sr-only">Dismiss</span>
          <XMarkIcon aria-hidden="true" className="h-5 w-5 text-white" />
        </button>
      </div>
    </div>
  )
}
