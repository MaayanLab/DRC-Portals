import SubmissionForm from '@/components/misc/Outreach/Submission/SubmissionForm';
import { Typography } from '@mui/material';
const QuizPage = () => {
  return (
    <div>
      <Typography variant="h3" color="secondary">Submit Information about a past or an upcoming Traning & Outreach event</Typography>
      <SubmissionForm />
    </div>
  );
};

export default QuizPage;