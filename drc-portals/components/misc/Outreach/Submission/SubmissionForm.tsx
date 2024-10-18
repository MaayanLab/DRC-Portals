'use client'
import React, { ChangeEvent, FormEvent, useState } from 'react';
import {
    Container,
    Typography,
    TextField,
    FormControl,
    Button,
    Box,
    Grid,
    SelectChangeEvent,
} from '@mui/material';

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { Dayjs } from 'dayjs';

import CheckboxGrid from './CheckboxGrid'
import DateTimePicker from './DateTimePicker';
import Status, { StatusType } from '@/app/data/submit/Status';
import TimezoneSelector from './TimezoneSelector';

interface FormData {
    'entry.813249996': string; // name
    'entry.1589956392': string; // email
    'entry.652173483': string; // title
    'entry.943020378': string; // description
    'entry.640177050': string[]; // tag
    'entry.18495822': string[]; // DCC
    'entry.510742187': string; // link
    'entry.955581712': string; // image
    'entry.1391382123_year': string;
    'entry.1391382123_month': string;
    'entry.1391382123_day': string;
    'entry.1659727054_hour': string;
    'entry.1659727054_minute': string;
    'entry.711666726_year': string;
    'entry.711666726_month': string;
    'entry.711666726_day': string;
    'entry.1226417414_hour': string;
    'entry.1226417414_minute': string;
    'entry.1836882378_year': string;
    'entry.1836882378_month': string;
    'entry.1836882378_day': string;
    'entry.895695002_hour': string;
    'entry.895695002_minute': string;
    'entry.885048810': string;
}
interface Option {
    value: string;
    label: string;
}
const dccOptions: Option[] = [
    { value: '19', label: 'NIH' },
    { value: '20', label: 'ICC' },
    { value: '21', label: 'DRC' },
    { value: '22', label: 'KC' },
    { value: '23', label: 'CWIC' },
    { value: '24', label: 'CT' },
    { value: '1', label: '4DN' },
    { value: '2', label: 'A2CPS' },
    { value: '3', label: 'Bridge2AI' },
    { value: '4', label: 'ExRNA' },
    { value: '5', label: 'GlyGen' },
    { value: '6', label: 'GTEx' },
    { value: '7', label: 'H3Africa' },
    { value: '8', label: 'HMP' },
    { value: '9', label: 'HuBMAP' },
    { value: '10', label: 'IDG' },
    { value: '11', label: 'Kids First' },
    { value: '12', label: 'KOMP2' },
    { value: '13', label: 'LINCS' },
    { value: '14', label: 'Metabolomics' },
    { value: '15', label: 'MoTrPAC' },
    { value: '16', label: 'SenNet' },
    { value: '17', label: 'SPARC' },
    { value: '18', label: 'UDN' }
];
const tagOptions: Option[] = [
    { value: '1', label: 'Webinar' },
    { value: '2', label: 'Office Hours' },
    { value: '3', label: 'F2F Meeting' },
    { value: '4', label: 'Competition' },
    { value: '5', label: 'Conference' },
    { value: '6', label: 'Use-A-Thon' },
    { value: '7', label: 'Hackathon' },
    { value: '8', label: 'Symposium' },
    { value: '9', label: 'Fellowship' },
    { value: '10', label: 'Workshop' },
    { value: '11', label: 'Internship' },
    { value: '12', label: 'Course' },
    { value: '13', label: 'Training Program' }
];
const SubmissionForm = () => {
    const [formData, setFormData] = useState<FormData>({
        'entry.813249996': '', //name
        'entry.1589956392': '', //email
        'entry.652173483': '', // title
        'entry.943020378': '', // description
        'entry.640177050': [], // tag
        'entry.18495822': [], // DCC
        'entry.510742187': '',// link
        'entry.955581712': '',   // image 
        'entry.1391382123_year': '', // Starting Date
        'entry.1391382123_month': '',
        'entry.1391382123_day': '',
        'entry.1659727054_hour': '',         //start time 
        'entry.1659727054_minute': '',
        'entry.711666726_year': '', // Finishing Date
        'entry.711666726_month': '',
        'entry.711666726_day': '',
        'entry.1226417414_hour': '',         //Finish time 
        'entry.1226417414_minute': '',
        'entry.1836882378_year': '', // Application Due Date
        'entry.1836882378_month': '',
        'entry.1836882378_day': '',
        'entry.895695002_hour': '',         //Application Due Time
        'entry.895695002_minute': '',
        'entry.885048810': '' // timezone
    });

    const [status, setStatus] = React.useState<StatusType>({})
    const [titleLength, setTitleLength] = useState(0);
    const [descriptionLength, setDescriptionLength] = useState(0);
    const [isTime, setIsTime] = useState<boolean>(false);
    
    const [dates, setDates] = useState({
        startDate: null as Dayjs | null,
        finishDate: null as Dayjs | null,
        applicationDueDate: null as Dayjs | null
    });
    const [times, setTimes] = useState({
        startTime: null as Dayjs | null,
        finishTime: null as Dayjs | null,
        applicationDueTime: null as Dayjs | null
    });

    const handleInputChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>| SelectChangeEvent) => {
        const { name, value } = event.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value,
            [event.target.name]: event.target.value,
        }));
    };

    const handleTitleChange = (event: ChangeEvent<HTMLInputElement>) => {
        const input = event.target.value.slice(0, 100); // Limit to 100 characters
        setFormData(prevData => ({
            ...prevData,
            'entry.652173483': input
        }));
        setTitleLength(input.length);
    };

    const handleDescriptionChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
        const input = event.target.value.slice(0, 450); // Limit to 450 characters
        setFormData(prevData => ({
            ...prevData,
            'entry.943020378': input
        }));
        setDescriptionLength(input.length);
    };

    const handleSelectionChange = (fieldName: string, value: string | string[]) => {
        setFormData(prevData => ({
            ...prevData,
            [fieldName]: value
        }));
    };

    const handleDateChange = (newData: Record<string, string>, newValue: Dayjs | null, dateKey: string) => {
        setFormData(prevData => ({
            ...prevData,
            ...newData
        }));
        setDates(prevDates => ({
            ...prevDates,
            [dateKey]: newValue
        }));
    };

    const handleTimeChange = (newData: Record<string, string>, newValue: Dayjs | null, timeKey: string) => {
        console.log("newData", newData)
        setFormData(prevData => ({
            ...prevData,
            ...newData
        }));
        setTimes(prevTimes => ({
            ...prevTimes,
            [timeKey]: newValue
        }));
        setIsTime(true)
    };

    const formatFormDataForSubmission = (data: FormData): Array<[string, string]> => {
        const formattedData: Array<[string, string]> = [];
        Object.entries(data).forEach(([key, value]) => {
            if (Array.isArray(value)) {
                // For fields that can have multiple values (like entry.18495822 and entry.640177050)
                value.forEach((v) => {
                    formattedData.push([key, v]);
                });
            } else {
                // For all other fields
                formattedData.push([key, value as string]);
            }
        });
        return formattedData;
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formattedData = formatFormDataForSubmission(formData);
        const formURL = 'https://docs.google.com/forms/d/e/1FAIpQLSffZ7RHl9rKr3oFCmTUzXKs51Nm9EjOaX3jrG3AjTWE8HHDNQ/formResponse';
        console.log("formData", formattedData)
        try {
            await fetch(formURL, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formattedData.map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`).join('&'),
            });
            setStatus(() => ({ success: { selected: true, message: 'Success! Training & Outreach event submitted' } }))
        } catch (error) {
            console.error('Error submitting form:', error);
            setStatus(() => ({ error: { selected: true, message: 'Error Submitting Traning & Outreach Event!' } }))
        }
    };

    return (
        <Container maxWidth="md">
            <Box component="form" onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                    {/* name */}
                    <Grid item xs={12} md={6}>
                        <FormControl fullWidth margin="normal">
                            <TextField
                                name="entry.813249996"
                                value={formData['entry.813249996']}
                                onChange={handleInputChange}
                                label="Name"
                                required
                                fullWidth
                                margin="normal"
                                placeholder="Enter a valid full name"
                            />
                        </FormControl>
                    </Grid>
                    {/* email */}
                    <Grid item xs={12} md={6}>
                        <FormControl fullWidth margin="normal">
                            <TextField
                                name="entry.1589956392"
                                value={formData['entry.1589956392']}
                                onChange={handleInputChange}
                                label="Email"
                                required
                                type="email"
                                fullWidth
                                margin="normal"
                                placeholder="Enter a valid e-mail address"
                            />
                        </FormControl>
                    </Grid>
                </Grid>
                {/* DCC selection */}
                <CheckboxGrid
                    options={dccOptions}
                    fieldName="entry.18495822"
                    value={formData['entry.18495822']}
                    onChange={handleSelectionChange}
                    columns={6}
                    label="Select hosting Center/DCC(s)"
                    multiple={true}
                />
                {/* Title */}
                <FormControl fullWidth margin="normal">
                    <TextField
                        name="entry.652173483"
                        value={formData['entry.652173483']}
                        onChange={handleTitleChange}
                        label="Title"
                        required
                        fullWidth
                        margin="normal"
                        inputProps={{
                            maxLength: 100
                        }}
                        helperText={
                            <React.Fragment>
                                Enter a descriptive title of the event (maximum 100 characters)
                                <Typography
                                    component="span"
                                    variant="caption"
                                    color={titleLength > 100 ? "error" : "textSecondary"}
                                    sx={{ float: 'right' }}
                                >
                                    {titleLength}/100
                                </Typography>
                            </React.Fragment>
                        }
                    />
                </FormControl>
                {/* Description */}
                <FormControl fullWidth margin="normal">
                    <TextField
                        name="entry.943020378"
                        value={formData['entry.943020378']}
                        onChange={handleDescriptionChange}
                        label="Description"
                        required
                        fullWidth
                        margin="normal"
                        multiline
                        rows={4}
                        inputProps={{
                            maxLength: 450
                        }}
                        helperText={
                            <React.Fragment>
                                Enter a short description of the event (maximum 450 characters)
                                <Typography
                                    component="span"
                                    variant="caption"
                                    color={descriptionLength > 450 ? "error" : "textSecondary"}
                                    sx={{ float: 'right' }}
                                >
                                    {descriptionLength}/450
                                </Typography>
                            </React.Fragment>
                        }
                    />
                </FormControl>
                {/* image */}
                <FormControl fullWidth margin="normal">
                    <TextField
                        name="entry.955581712"
                        value={formData['entry.955581712']}
                        onChange={handleInputChange}
                        label="Banner Image"
                        required
                        fullWidth
                        margin="normal"
                        placeholder="Enter a URL to a banner that illustrates the event"
                    />
                    <Typography variant="caption" color="text.secondary" style={{ marginLeft: 4 }}>** It would be great if the banner is of size around 540 * 260 pixels, but we can crop it if needed. Also, if providing a URL is not possible, please e-mail or Slack the image to us</Typography>
                </FormControl>
                {/* link */}
                <FormControl fullWidth margin="normal">
                    <TextField
                        name="entry.510742187"
                        value={formData['entry.510742187']}
                        onChange={handleInputChange}
                        label="Link"
                        fullWidth
                        margin="normal"
                        placeholder="Enter a URL relevant to the event, if applicable"
                    />
                </FormControl>
                {/* tag */}
                <CheckboxGrid
                    options={tagOptions}
                    fieldName="entry.640177050"
                    value={formData['entry.640177050']}
                    onChange={handleSelectionChange}
                    columns={5}
                    label="Tag"
                    required={true}
                />
                <Grid className="h-10"></Grid>
                <div className="flex justify-center">
                    <div className="w-11/12 max-w-4xl">
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DateTimePicker
                                dateValue={dates.startDate}
                                timeValue={times.startTime}
                                onDateChange={(newData, newValue) => handleDateChange(newData, newValue, 'startDate')}
                                onTimeChange={(newData, newValue) => handleTimeChange(newData, newValue, 'startTime')}
                                dateFieldName="entry.1391382123"
                                timeFieldName="entry.1659727054"
                                dateLabel="Date"
                                timeLabel="Time (If applicable)"
                                title="Event Starts at:"
                                required={true}
                            />
                            <DateTimePicker
                                dateValue={dates.finishDate}
                                timeValue={times.finishTime}
                                onDateChange={(newData, newValue) => handleDateChange(newData, newValue, 'finishDate')}
                                onTimeChange={(newData, newValue) => handleTimeChange(newData, newValue, 'finishTime')}
                                dateFieldName="entry.711666726"
                                timeFieldName="entry.1226417414"
                                dateLabel="Date"
                                timeLabel="Time"
                                title="Event Finishs at:"
                                caption="(if applicable)"
                            />
                            <DateTimePicker
                                dateValue={dates.applicationDueDate}
                                timeValue={times.applicationDueTime}
                                onDateChange={(newData, newValue) => handleDateChange(newData, newValue, 'applicationDueDate')}
                                onTimeChange={(newData, newValue) => handleTimeChange(newData, newValue, 'applicationDueTime')}
                                dateFieldName="entry.1836882378"
                                timeFieldName="entry.895695002"
                                dateLabel="Date"
                                timeLabel="Time"
                                title="Application due by:"
                                caption="(if applicable)"
                            />
                        </LocalizationProvider>
                        {isTime && (
                            <TimezoneSelector
                                value={formData['entry.885048810']}
                                onChange={handleInputChange}
                            />
                    )}
                    </div>
                </div>
                
                <div style={{ width: '100%' }}>
                    <Status status={status} />
                </div>

                <Box display="flex" justifyContent="center" width="100%" mt={3} mb={2}>
                    <Button
                        type="submit"
                        variant="contained"
                        color="secondary"
                        sx={{ mt: 3, mb: 2, fontSize: 16 }}
                    >
                        Submit
                    </Button>
                </Box>
            </Box>
        </Container>
    );
};

export default SubmissionForm;