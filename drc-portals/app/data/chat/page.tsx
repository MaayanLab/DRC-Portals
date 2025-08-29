import Chat from "@/components/Chat/chat";
import { Grid, Typography } from "@mui/material";
import Link from "@/utils/link";

export default function ChatPage() {
  return (
    <Grid spacing={1}>
      <Grid item xs={12}>
        <Typography variant="h2" color="secondary" sx={{ml:3, mt:2}}>
          CFDE Chatbot
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="subtitle1" sx={{ml:3, mt:2, mb: 2}}>
          The CFDE chatbot utilizes the OpenAI Assistants API with registered
          workflows implemented in the{" "}
          <Link
            href={"https://playbook-workflow-builder.cloud/"}
            target="_blank"
            className="underline"
          >
            Playbook Workflow Builder
          </Link>{" "}
          to answer queries related to DCC data types and general questions
          related to the CFDE and DCCs. Results of the registered workflows are
          visualized directly in the chat and are available for expansion and
          modificaiton in the Playbook Workflow Builder.
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Chat />
      </Grid>
    </Grid>
  );
}
