import {
  Disclosure,
} from "@headlessui/react"
import appIcon from "data-base64:~assets/appIcon.png"

export default function Header() {
  return (
    <Disclosure as="nav" className="bg-white shadow">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center">
          <div className="flex flex-shrink-0 items-center">
            <img
              alt="WealthSimple Dividend Tracker"
              src={appIcon}
              className="h-12 w-auto"
            />
          </div>
          <div className="sm:ml-6 sm:flex sm:space-x-8">
            <h1 className="text-lg md:ml-0 md:text-2xl font-bold">
              WealthSimple Dividend Tracker
            </h1>
          </div>
        </div>
      </div>
    </Disclosure>
  )
}
