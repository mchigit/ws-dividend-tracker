import { ExclamationTriangleIcon } from "@heroicons/react/20/solid"

export default function NeedLoginBanner() {
  return (
    <div className="border-l-4 border-yellow-400 bg-yellow-50 p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <ExclamationTriangleIcon
            aria-hidden="true"
            className="h-5 w-5 text-yellow-400"
          />
        </div>
        <div className="ml-3">
          <p className="text-sm text-yellow-700">
            {`Please Login to WealthSimple to view your data.${" "}`}
            <a
              href="https://my.wealthsimple.com/app/login"
              className="font-medium text-yellow-700 underline hover:text-yellow-600">
              Login Here
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
