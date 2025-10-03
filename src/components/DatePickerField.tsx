import React from "react"
import {
  Button,
  Calendar,
  CalendarCell,
  CalendarGrid,
  CalendarGridBody,
  CalendarGridHeader,
  CalendarHeaderCell,
  DateInput,
  DatePicker,
  DateSegment,
  Dialog,
  Group,
  Heading,
  Label,
  Popover
} from "react-aria-components"
import { today, type CalendarDate } from "@internationalized/date"

interface DatePickerFieldProps {
  label: string
  value: CalendarDate | null
  onChange: (date: CalendarDate | null) => void
  maxValue?: CalendarDate
}

export default function DatePickerField({
  label,
  value,
  onChange,
  maxValue = today("America/New_York")
}: DatePickerFieldProps) {
  return (
    <DatePicker value={value} onChange={onChange} maxValue={maxValue}>
      <Label className="text-xs font-medium text-gray-600 block mb-1">
        {label}
      </Label>
      <Group className="flex items-center bg-white border border-gray-300 rounded-md px-2 py-1.5 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500">
        <DateInput className="flex text-sm">
          {(segment) => (
            <DateSegment
              segment={segment}
              className="px-0.5 outline-none focus:bg-indigo-100 rounded text-sm"
            />
          )}
        </DateInput>
        <Button className="ml-1 px-1.5 py-0.5 text-sm text-gray-500 hover:text-gray-700">
          📅
        </Button>
      </Group>
      <Popover className="bg-white border border-gray-300 rounded-lg shadow-lg">
        <Dialog className="p-4 outline-none">
          <Calendar>
            <header className="flex items-center justify-between mb-4">
              <Button
                slot="previous"
                className="px-2 py-1 text-gray-600 hover:bg-gray-100 rounded">
                ◀
              </Button>
              <Heading className="font-semibold" />
              <Button
                slot="next"
                className="px-2 py-1 text-gray-600 hover:bg-gray-100 rounded">
                ▶
              </Button>
            </header>
            <CalendarGrid className="border-collapse">
              <CalendarGridHeader>
                {(day) => (
                  <CalendarHeaderCell className="text-xs font-medium text-gray-500 p-2">
                    {day}
                  </CalendarHeaderCell>
                )}
              </CalendarGridHeader>
              <CalendarGridBody>
                {(date) => (
                  <CalendarCell
                    date={date}
                    className="p-2 text-sm cursor-pointer hover:bg-gray-100 rounded data-[selected]:bg-indigo-600 data-[selected]:text-white data-[disabled]:text-gray-300 data-[disabled]:cursor-not-allowed"
                  />
                )}
              </CalendarGridBody>
            </CalendarGrid>
          </Calendar>
        </Dialog>
      </Popover>
    </DatePicker>
  )
}
