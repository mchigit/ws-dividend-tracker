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

  const renderPageNumbers = () => {
    const delta = 2 // Pages on each side of current page (increased from 1 to 2)
    const pages: (number | string)[] = []

    // Show all pages if total is small enough
    if (maxPages <= 10) {
      return Array.from({ length: maxPages }, (_, i) => i + 1)
    }

    // Always show first page
    pages.push(1)

    // Determine range around current page
    let rangeStart = Math.max(2, activePage - delta)
    let rangeEnd = Math.min(maxPages - 1, activePage + delta)

    // Expand range if near the start
    if (activePage <= delta + 2) {
      rangeEnd = Math.min(maxPages - 1, delta * 2 + 3)
    }

    // Expand range if near the end
    if (activePage >= maxPages - delta - 1) {
      rangeStart = Math.max(2, maxPages - delta * 2 - 2)
    }

    // Add left ellipsis if needed
    if (rangeStart > 2) {
      pages.push("...")
    }

    // Add middle range
    for (let i = rangeStart; i <= rangeEnd; i++) {
      pages.push(i)
    }

    // Add right ellipsis if needed
    if (rangeEnd < maxPages - 1) {
      pages.push("...")
    }

    // Always show last page
    if (maxPages > 1) {
      pages.push(maxPages)
    }

    return pages
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
        {renderPageNumbers().map((page, idx) =>
          page === "..." ? (
            <span key={`ellipsis-${idx}`} className="px-2 text-gray-400">
              ...
            </span>
          ) : (
            <IconButton key={page} {...getItemProps(page as number)}>
              {page}
            </IconButton>
          )
        )}
      </div>
      <Button
        variant="text"
        className="flex items-center gap-2 rounded-full"
        onClick={next}
        disabled={activePage === maxPages}>
        Next
        <ArrowRightIcon strokeWidth={2} className="h-4 w-4" />
      </Button>
    </div>
  )
}
