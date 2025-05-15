import Chat from "@/components/Chat/chat";
import { Typography } from "@mui/material";
import Link from "@/utils/link";

export default function ChatPage() {
  return (
    <>
      <Typography variant="h2" color="secondary" className="pt-3">
        CFDE Chatbot
      </Typography>
      <Typography variant="subtitle1" color="secondary" className="p-3">
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
      <Chat />
    </>
  );
}
