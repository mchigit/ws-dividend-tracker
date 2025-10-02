import "~style.css"

import { ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline"
import {
  Alert,
  Button,
  Dialog,
  Option,
  Select,
  Spinner
} from "@material-tailwind/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import React, { useState } from "react"

import AccountsDashboard from "~components/AccountsDashboard"
import { useFetchRespFromBgQuery } from "~queries"

const queryClient = new QueryClient()

function Popup() {
  const { data, isLoading } = useFetchRespFromBgQuery()
  const [openModal, setOpenModal] = useState(false)
  const [feedbackType, setFeedbackType] = useState("feature")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedbackText, setFeedbackText] = useState("")
  const [email, setEmail] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  const { cashResp, tradeResp, managedRes } = data || {}

  const handleOpenModal = () => {
    if (!openModal) {
      // Reset form when opening
      setFeedbackText("")
      setEmail("")
      setSuccessMessage("")
    }
    setOpenModal(!openModal)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    fetch("https://www.formbackend.com/f/c25a2625c55861e4", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify({
        type: feedbackType,
        feedback: feedbackText,
        email
      })
    })
      .then((response) => {
        if (response.status === 422) {
          throw new Error("Validation error")
        } else if (!response.ok) {
          throw new Error("Something went wrong")
        }
        return response.json()
      })
      .then(() => {
        setIsSubmitting(false)
        setSuccessMessage("Thank you for your feedback! We'll review it soon.")
      })
      .catch((error) => {
        setIsSubmitting(false)
        console.error("Error:", error)
        setSuccessMessage("Something went wrong. Please try again later.")
      })
  }

  return (
    <div className="mx-auto text-center relative">
      <div className="relative pt-12">
        <h2 className="text-xl font-bold tracking-wide my-2 text-gray-900 sm:text-4xl">
          WealthSimple Dividend Tracker
        </h2>

        {/* Feedback Icon Button */}
        <button
          onClick={handleOpenModal}
          className="absolute top-0 right-0 p-2 
          text-gray-900 hover:text-gray-800 hover:bg-gray-200
           rounded-full transition-colors group"
          title="Send Feedback"
          aria-label="Send Feedback">
          <ChatBubbleLeftRightIcon className="h-5 w-5" />
          <span className="absolute right-0 top-full mt-1 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Send Feedback
          </span>
        </button>
      </div>

      {/* Feedback Modal */}
      <Dialog open={openModal} handler={handleOpenModal} size="md">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900">Send Feedback</h3>
            <button
              type="button"
              onClick={handleOpenModal}
              className="p-1 rounded-full hover:bg-gray-200">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {successMessage ? (
            <div className="py-8 text-center">
              <div className="mb-4 flex justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 text-green-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <p className="text-lg font-medium text-gray-900">
                {successMessage}
              </p>
              <Button color="gray" className="mt-6" onClick={handleOpenModal}>
                Close
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <div className="mb-4">
                  <Select
                    label="Select Type"
                    value={feedbackType}
                    onChange={(value) => setFeedbackType(value || "feature")}>
                    <Option value="feature">Request a Feature</Option>
                    <Option value="bug">Report a Bug</Option>
                  </Select>
                </div>

                <p className="text-gray-700 mb-4">
                  {feedbackType === "feature"
                    ? "Have an idea for a new feature? Let us know what would make this extension more useful for you!"
                    : "Found a bug? Please describe the issue you encountered so we can fix it."}
                </p>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                    {feedbackType === "feature"
                      ? "Feature Description"
                      : "Bug Description"}
                  </label>
                  <textarea
                    name="feedback"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    rows={4}
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder={
                      feedbackType === "feature"
                        ? "Describe the feature you'd like to see..."
                        : "Describe the bug you encountered..."
                    }
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                    Your Email (optional)
                  </label>
                  <input
                    type="email"
                    name="email"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button color="gray" type="button" onClick={handleOpenModal}>
                  Cancel
                </Button>
                <Button color="blue" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? <Spinner className="h-4 w-4" /> : "Submit"}
                </Button>
              </div>
            </form>
          )}
        </div>
      </Dialog>

      <div className="pb-8 w-full flex flex-col items-center justify-center">
        {isLoading && <Spinner className="h-12 w-12" />}
        <div className="w-full">
          {data?.isOldData === true && (
            <Alert className="rounded-none border-l-4 border-[#FBC361] bg-[#FBC361]/10 font-medium text-blue-gray-900 text-sm text-left mb-2">
              Your data is potentially outdated. Please login to WealthSimple to
              refresh.
            </Alert>
          )}
          {tradeResp || cashResp || managedRes ? (
            <AccountsDashboard
              tradePositions={tradeResp}
              cashAccount={cashResp}
              ManagedAccData={managedRes}
            />
          ) : (
            !isLoading && (
              <Alert className="rounded-none border-l-4 border-[#FBC361] bg-[#FBC361]/10 font-medium text-blue-gray-900">
                Please login to WealthSimple
              </Alert>
            )
          )}
        </div>
      </div>
    </div>
  )
}

export default function IndexPopup() {
  return (
    <div className="bg-white w-[550px] min-h-[600px] p-4">
      <QueryClientProvider client={queryClient}>
        <Popup />
      </QueryClientProvider>
    </div>
  )
}
