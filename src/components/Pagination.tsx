import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/24/outline"
import { Button, IconButton } from "@material-tailwind/react"
import React, { type Dispatch, type SetStateAction } from "react"

export function CircularPagination(props: {
  activePage: number
  setActivePage: Dispatch<SetStateAction<number>>
  maxPages: number
}) {
  const { activePage, setActivePage, maxPages } = props

  const getItemProps = (index) =>
    ({
      variant: activePage === index ? "filled" : "text",
      color: "gray",
      onClick: () => setActivePage(index),
      className: "rounded-full"
    }) as any

  const next = () => {
    if (activePage === maxPages) return

    setActivePage(activePage + 1)
  }

  const prev = () => {
    if (activePage === 1) return

    setActivePage(activePage - 1)
  }

  return (
    <div className="flex items-center gap-4">
      <Button
        variant="text"
        className="flex items-center gap-2 rounded-full"
        onClick={prev}
        disabled={activePage === 1}>
        <ArrowLeftIcon strokeWidth={2} className="h-4 w-4" /> Previous
      </Button>
      <div className="flex items-center gap-2">
        {Array.from({ length: maxPages }, (_, i) => i + 1).map((i) => (
          <IconButton key={i} {...getItemProps(i)}>
            {i}
          </IconButton>
        ))}
      </div>
      <Button
        variant="text"
        className="flex items-center gap-2 rounded-full"
        onClick={next}
        disabled={activePage === 5}>
        Next
        <ArrowRightIcon strokeWidth={2} className="h-4 w-4" />
      </Button>
    </div>
  )
}
