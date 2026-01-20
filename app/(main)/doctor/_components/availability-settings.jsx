'use client';

import { AlertCircle, Clock, Loader2, Plus, Trash2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  deleteWeeklyAvailability,
  setWeeklyAvailability,
} from '@/actions/doctor';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import useFetch from '@/hooks/use-fetch';
import { useForm } from 'react-hook-form';

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

export function AvailabilitySettings({ weeklySchedule = [] }) {
  const [showForm, setShowForm] = useState(false);
  const [selectedDay, setSelectedDay] = useState('');

  const {
    loading,
    fn: submitAvailability,
    data,
  } = useFetch(setWeeklyAvailability);
  const { loading: deleting, fn: deleteAvailability } = useFetch(
    deleteWeeklyAvailability,
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      startTime: '',
      endTime: '',
    },
  });

  const onSubmit = async (data) => {
    if (loading || !selectedDay) return;

    if (!selectedDay) {
      toast.error('Please select a day of week');
      return;
    }

    if (data.startTime >= data.endTime) {
      toast.error('End time must be after start time');
      return;
    }

    const formData = new FormData();
    formData.append('dayOfWeek', selectedDay);
    formData.append('startTime', data.startTime);
    formData.append('endTime', data.endTime);

    await submitAvailability(formData);
  };

  const handleDelete = async (availabilityId) => {
    if (confirm('Are you sure you want to delete this availability?')) {
      try {
        await deleteAvailability(availabilityId);
        toast.success('Availability deleted successfully');
      } catch (error) {
        toast.error('Failed to delete availability');
      }
    }
  };

  useEffect(() => {
    if (data && data?.success) {
      setShowForm(false);
      setSelectedDay('');
      reset();
      toast.success('Availability updated successfully');
    }
  }, [data, reset]);

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getDayLabel = (dayOfWeek) => {
    return DAYS_OF_WEEK.find((d) => d.value === dayOfWeek)?.label || '';
  };

  return (
    <Card className="border-emerald-900/20">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-white flex items-center">
          <Clock className="h-5 w-5 mr-2 text-emerald-400" />
          Weekly Availability Schedule
        </CardTitle>
        <CardDescription>
          Set your weekly recurring schedule for patient appointments
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!showForm ? (
          <>
            <div className="mb-6">
              <h3 className="text-lg font-medium text-white mb-3">
                Weekly Schedule
              </h3>

              {weeklySchedule.length === 0 ? (
                <p className="text-muted-foreground">
                  You haven&apos;t set your weekly schedule yet. Add
                  availability for each day you want to accept appointments.
                </p>
              ) : (
                <div className="space-y-3">
                  {weeklySchedule.map((schedule) => (
                    <div
                      key={schedule.id}
                      className="flex items-center justify-between p-3 rounded-md bg-muted/20 border border-emerald-900/20"
                    >
                      <div className="flex items-center">
                        <div className="bg-emerald-900/20 p-2 rounded-full mr-3">
                          <Clock className="h-4 w-4 text-emerald-400" />
                        </div>
                        <div>
                          <p className="text-white font-medium">
                            {getDayLabel(schedule.dayOfWeek)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {formatTime(schedule.startTime)} -{' '}
                            {formatTime(schedule.endTime)}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(schedule.id)}
                        disabled={deleting}
                        className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button
              onClick={() => setShowForm(true)}
              className="w-full bg-emerald-600 hover:bg-emerald-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Availability
            </Button>
          </>
        ) : (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4 border border-emerald-900/20 rounded-md p-4"
          >
            <h3 className="text-lg font-medium text-white mb-2">
              Add Weekly Availability
            </h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="dayOfWeek">Day of Week</Label>
                <Select value={selectedDay} onValueChange={setSelectedDay}>
                  <SelectTrigger className="bg-background border-emerald-900/20">
                    <SelectValue placeholder="Select a day" />
                  </SelectTrigger>
                  <SelectContent>
                    {DAYS_OF_WEEK.map((day) => (
                      <SelectItem key={day.value} value={day.value.toString()}>
                        {day.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    type="time"
                    {...register('startTime', {
                      required: 'Start time is required',
                    })}
                    className="bg-background border-emerald-900/20"
                  />
                  {errors.startTime && (
                    <p className="text-sm font-medium text-red-500">
                      {errors.startTime.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endTime">End Time</Label>
                  <Input
                    id="endTime"
                    type="time"
                    {...register('endTime', {
                      required: 'End time is required',
                    })}
                    className="bg-background border-emerald-900/20"
                  />
                  {errors.endTime && (
                    <p className="text-sm font-medium text-red-500">
                      {errors.endTime.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setSelectedDay('');
                  reset();
                }}
                disabled={loading}
                className="border-emerald-900/30"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || !selectedDay}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Availability'
                )}
              </Button>
            </div>
          </form>
        )}

        <div className="mt-6 p-4 bg-muted/10 border border-emerald-900/10 rounded-md">
          <h4 className="font-medium text-white mb-2 flex items-center">
            <AlertCircle className="h-4 w-4 mr-2 text-emerald-400" />
            How Weekly Schedule Works
          </h4>
          <ul className="text-muted-foreground text-sm space-y-1 list-disc list-inside">
            <li>Set your availability for each day of the week</li>
            <li>This schedule repeats every week automatically</li>
            <li>Patients can book appointments during your available hours</li>
            <li>You can update or remove availability for any day</li>
            <li>Existing booked appointments will not be affected</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
