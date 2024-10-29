import SubmissionForm from '@/components/misc/Outreach/Submission/SubmissionForm';
import { Typography } from '@mui/material';
const QuizPage = () => {
  return (
    <div>
      <Typography variant="h3" color="secondary">Submit information about future and past training and outreach events.</Typography>
      <SubmissionForm />
    </div>
  );
};

export default QuizPage;