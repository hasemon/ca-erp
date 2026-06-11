import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import * as React from 'react';

interface DatePickerProps {
    date?: Date;
    onDateChange?: (date: Date | undefined) => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
    id?: string;
    name?: string;
    required?: boolean;
    autoFocus?: boolean;
    tabIndex?: number;
    error?: string;
    includeTime?: boolean;
    timeFormat?: '12h' | '24h';
    includeSeconds?: boolean;
    yearRange?: { start: number; end: number };
}

export function DatePicker({
    date,
    onDateChange,
    placeholder = 'Pick a date',
    disabled = false,
    className,
    id,
    name,
    required = false,
    autoFocus = false,
    tabIndex,
    error,
    includeTime = false,
    timeFormat = '24h',
    includeSeconds = false,
    yearRange = { start: 1900, end: 2100 },
}: DatePickerProps) {
    const [open, setOpen] = React.useState(false);
    const [currentMonth, setCurrentMonth] = React.useState(date || new Date());

    const formatTimeValue = (value: number) => String(value).padStart(2, '0');

    const get12HourFormat = (hours: number) => {
        const h = hours % 12 || 12;
        return h;
    };

    const getAMPM = (hours: number) => {
        return hours >= 12 ? 'PM' : 'AM';
    };

    const convert12to24 = (hour: number, ampm: string) => {
        let h = hour;
        if (ampm === 'PM' && h !== 12) h += 12;
        if (ampm === 'AM' && h === 12) h = 0;
        return h;
    };

    const handleDateSelect = (selectedDate: Date | undefined) => {
        if (selectedDate && includeTime && date) {
            selectedDate.setHours(date.getHours());
            selectedDate.setMinutes(date.getMinutes());
        }
        onDateChange?.(selectedDate);
        if (!includeTime) {
            setOpen(false);
        }
    };

    const handleTimeChange = (
        type: 'hours' | 'minutes' | 'seconds' | 'ampm',
        value: string,
    ) => {
        if (!date) return;
        const newDate = new Date(date);

        if (type === 'hours') {
            let hours = Number.parseInt(value);
            if (timeFormat === '12h') {
                const ampm = getAMPM(newDate.getHours());
                hours = convert12to24(
                    Math.max(1, Math.min(12, isNaN(hours) ? 1 : hours)),
                    ampm,
                );
            } else {
                hours = Math.max(0, Math.min(23, isNaN(hours) ? 0 : hours));
            }
            newDate.setHours(hours);
        } else if (type === 'minutes') {
            const minutes = Math.max(
                0,
                Math.min(59, Number.parseInt(value) || 0),
            );
            newDate.setMinutes(minutes);
        } else if (type === 'seconds') {
            const seconds = Math.max(
                0,
                Math.min(59, Number.parseInt(value) || 0),
            );
            newDate.setSeconds(seconds);
        } else if (type === 'ampm') {
            const currentHours = newDate.getHours();
            const displayHour = get12HourFormat(currentHours);
            newDate.setHours(convert12to24(displayHour, value));
        }
        onDateChange?.(newDate);
    };

    const fromYear = yearRange.start;
    const toYear = yearRange.end;

    return (
        <div className="grid gap-2">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        type="button"
                        variant="outline"
                        className={cn(
                            'w-full justify-start text-left font-normal',
                            !date && 'text-muted-foreground',
                            error &&
                                'border-red-500 focus:border-red-500 focus:ring-red-500',
                            className,
                        )}
                        disabled={disabled}
                        id={id}
                        autoFocus={autoFocus}
                        tabIndex={tabIndex}
                        aria-required={required}
                        aria-invalid={!!error}
                        aria-describedby={error ? `${id}-error` : undefined}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? (
                            format(
                                date,
                                includeTime
                                    ? timeFormat === '12h'
                                        ? includeSeconds
                                            ? 'PPP h:mm:ss a'
                                            : 'PPP h:mm a'
                                        : includeSeconds
                                          ? 'PPP HH:mm:ss'
                                          : 'PPP HH:mm'
                                    : 'PPP',
                            )
                        ) : (
                            <span>{placeholder}</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent
                    className="w-auto max-w-[calc(100vw-2rem)] overflow-hidden p-0"
                    align="start"
                >
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={handleDateSelect}
                        month={currentMonth}
                        onMonthChange={setCurrentMonth}
                        captionLayout="dropdown"
                        startMonth={new Date(fromYear, 0)}
                        endMonth={new Date(toYear, 11)}

                    />

                    {includeTime && (
                        <div className="border-t bg-muted/20 p-2">
                            <Label className="mb-3 block text-sm font-medium">
                                Time
                            </Label>
                            <div className="space-y-3">
                                <div
                                    className={cn(
                                        'grid items-start gap-1',
                                        includeSeconds &&
                                            timeFormat === '12h' &&
                                            'grid-cols-[4rem_auto_4rem_auto_4rem_4.5rem]',
                                        includeSeconds &&
                                            timeFormat === '24h' &&
                                            'grid-cols-[4rem_auto_4rem_auto_4rem]',
                                        !includeSeconds &&
                                            timeFormat === '12h' &&
                                            'grid-cols-[4rem_auto_4rem_4.5rem]',
                                        !includeSeconds &&
                                            timeFormat === '24h' &&
                                            'grid-cols-[4rem_auto_4rem]',
                                    )}
                                >
                                    <div className="flex flex-col gap-1">
                                        <Input
                                            type="number"
                                            min={
                                                timeFormat === '12h' ? '1' : '0'
                                            }
                                            max={
                                                timeFormat === '12h'
                                                    ? '12'
                                                    : '23'
                                            }
                                            value={formatTimeValue(
                                                timeFormat === '12h'
                                                    ? get12HourFormat(
                                                          date?.getHours() || 0,
                                                      )
                                                    : date?.getHours() || 0,
                                            )}
                                            onChange={(e) =>
                                                handleTimeChange(
                                                    'hours',
                                                    e.target.value,
                                                )
                                            }
                                            className="h-9 w-16 text-center text-sm font-semibold"
                                            placeholder="HH"
                                        />
                                        <span className="text-center text-xs text-muted-foreground">
                                            Hour
                                        </span>
                                    </div>

                                    <span className="flex h-9 items-center text-lg font-semibold">
                                        :
                                    </span>

                                    <div className="flex flex-col gap-1">
                                        <Input
                                            type="number"
                                            min="0"
                                            max="59"
                                            value={formatTimeValue(
                                                date?.getMinutes() || 0,
                                            )}
                                            onChange={(e) =>
                                                handleTimeChange(
                                                    'minutes',
                                                    e.target.value,
                                                )
                                            }
                                            className="h-9 w-16 text-center text-sm font-semibold"
                                            placeholder="MM"
                                        />
                                        <span className="text-center text-xs text-muted-foreground">
                                            Minute
                                        </span>
                                    </div>

                                    {includeSeconds && (
                                        <>
                                            <span className="flex h-9 items-center text-lg font-semibold">
                                                :
                                            </span>
                                            <div className="flex flex-col gap-1">
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    max="59"
                                                    value={formatTimeValue(
                                                        date?.getSeconds() || 0,
                                                    )}
                                                    onChange={(e) =>
                                                        handleTimeChange(
                                                            'seconds',
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="h-9 w-16 text-center text-sm font-semibold"
                                                    placeholder="SS"
                                                />
                                                <span className="text-center text-xs text-muted-foreground">
                                                    Second
                                                </span>
                                            </div>
                                        </>
                                    )}

                                    {timeFormat === '12h' && (
                                        <div className="flex flex-col gap-1">
                                            <Select
                                                value={getAMPM(
                                                    date?.getHours() || 0,
                                                )}
                                                onValueChange={(value) =>
                                                    handleTimeChange(
                                                        'ampm',
                                                        value,
                                                    )
                                                }
                                            >
                                                <SelectTrigger className="h-9 w-18">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="AM">
                                                        AM
                                                    </SelectItem>
                                                    <SelectItem value="PM">
                                                        PM
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <span className="text-center text-xs text-muted-foreground">
                                                Period
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <Button
                                    type="button"
                                    size="sm"
                                    onClick={() => setOpen(false)}
                                    className="w-full"
                                >
                                    Done
                                </Button>
                            </div>
                        </div>
                    )}
                </PopoverContent>
            </Popover>

            {name && (
                <input
                    type="hidden"
                    name={name}
                    value={
                        date
                            ? format(
                                  date,
                                  includeTime
                                      ? includeSeconds
                                          ? 'yyyy-MM-dd HH:mm:ss'
                                          : 'yyyy-MM-dd HH:mm'
                                      : 'yyyy-MM-dd',
                              )
                            : ''
                    }
                />
            )}

            {error && (
                <div id={`${id}-error`} className="mt-1 text-sm text-destructive">
                    {error}
                </div>
            )}
        </div>
    );
}
