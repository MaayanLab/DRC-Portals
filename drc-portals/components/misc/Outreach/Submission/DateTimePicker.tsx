import React, { useState } from 'react';
import { Box, Grid, Typography } from '@mui/material';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Dayjs } from 'dayjs';

interface DateTimePickerProps {
    dateValue: Dayjs | null;
    timeValue: Dayjs | null;
    onDateChange: (newData: Record<string, string>, newValue: Dayjs | null) => void;
    onTimeChange: (newData: Record<string, string>, newValue: Dayjs | null) => void;
    dateFieldName: string;
    timeFieldName: string;
    dateLabel: string;
    timeLabel: string;
    title: string;
    caption?: string;
    required?: boolean;
}

const DateTimePicker: React.FC<DateTimePickerProps> = ({
    dateValue,
    timeValue,
    onDateChange,
    onTimeChange,
    dateFieldName,
    timeFieldName,
    dateLabel,
    timeLabel,
    title,
    caption,
    required = false
}) => {

    const [error, setError] = useState(required);

    const handleDateChange = (newValue: Dayjs | null) => {
        console.log("error", error)
        if (newValue) {
            const formattedDate = newValue.format('YYYY-MM-DD');
            onDateChange({
                [`${dateFieldName}_year`]: formattedDate.split('-')[0],
                [`${dateFieldName}_month`]: formattedDate.split('-')[1],
                [`${dateFieldName}_day`]: formattedDate.split('-')[2]
            }, newValue);
            setError(false)
        }
    };

    const handleTimeChange = (newValue: Dayjs | null) => {
        if (newValue) {
            const hours = newValue.hour();
            const minutes = newValue.minute();
            onTimeChange({
                [`${timeFieldName}_hour`]: hours.toString(),
                [`${timeFieldName}_minute`]: minutes.toString()
            }, newValue);
        }
    };

    return (
        <Grid container spacing={2} alignItems="center" className="mb-4">
            <Grid item xs={12} md={4}>
                <h3 className="text-lg font-semibold">{title}</h3>
                {caption && (
                    <div className=" text-sm text-gray-500 italic">
                        {caption}
                    </div>
                )}
            </Grid>
            <Grid item xs={12} md={4}>
            <Box height="100%" display="flex" flexDirection="column" justifyContent="flex-end">
          <Box minHeight="25px"> {/* Consistent space for error message */}
            {error && (
                    <Typography
                        color="error"
                        variant="caption"
                        sx={{ display: 'block' }}
                    >
                        Start date is required
                    </Typography>
                )}
                  </Box>
                <DatePicker
                    label={dateLabel}
                    value={dateValue}
                    onChange={handleDateChange}
                    className="w-full"
                    slotProps={{
                        textField: {
                            required: required,
                            error: error,
                        },
                    }}
                />
             </Box>
            </Grid>
            <Grid item xs={12} md={4} className="max-h">
            <Box height="100%" display="flex" flexDirection="column" justifyContent="flex-end" alignItems="bottom">
          <Box minHeight="25px" /> 
                <TimePicker
                    label={timeLabel}
                    value={timeValue}
                    onChange={handleTimeChange}
                    className="w-full"
                />
                </Box>
            </Grid>
        </Grid>
    );
};

export default DateTimePicker;