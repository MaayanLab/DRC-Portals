import * as React from 'react';
import {
    Body,
    // Button,
    Container,
    Head,
    Html,
    Img,
    Link,
    Preview,
    Section,
    Text,
} from "@react-email/components";
import { CodeAsset, FileAsset } from '@prisma/client';


export function DCCApproverUploadEmail() {
    return (
        <Html lang='en'>
            <Head />
            <Preview>Data Resource Portal: New Asset Upload</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Section>
                        <Text style={text}>Hello,</Text>
                        <Text style={text}>
                            A new asset for your DCC has been uploaded and is ready for approval.
                        </Text>
                        <Text>
                            This email is not monitored so do not send a reply to this message.
                        </Text>
                    </Section>
                </Container>
            </Body>
        </Html>
    );
}


export function DRCApproverUploadEmail() {
    return (
        <Html lang='en'>
            <Head />
            <Preview>Data Resource Portal: New Asset Upload</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Section>
                        <Text style={text}>Hello,</Text>
                        <Text style={text}>
                            A new asset has been uploaded to the portal and is ready for approval.
                        </Text>
                        <Text>
                            This email is not monitored so do not send a reply to this message.
                        </Text>
                    </Section>
                </Container>
            </Body>
        </Html>
    );
}


interface AssetSubmitReceiptProps {
    userFirstname?: string;
    codeAsset?: CodeAsset;
    fileAsset?:FileAsset
}

export const AssetSubmitReceiptEmail = ({
    userFirstname,
    codeAsset,
    fileAsset,
}: AssetSubmitReceiptProps) => {
    if (codeAsset) {
        return (
            <Html>
                <Head />
                <Preview>Data Resource Portal: Asset Upload Receipt</Preview>
                <Body style={main}>
                    <Container style={container}>
                        <Section>
                            <Text style={text}>Hello {userFirstname},</Text>
                            <Text style={text}>
                                You have recently submitted an asset to the DRC portal with the following information:
                            </Text>
                            <Text style={text}>
                                Asset: <Link style={anchor} href={codeAsset?.link}></Link>{codeAsset?.name}
                            </Text>
                            <Text style={text}>
                                Asset Type: {codeAsset?.type}
                            </Text>
                            <Text style={text}>
                                If you are not responsible for this action, please ignore and delete this message.
                            </Text>
                            <Text style={text}>
                                This email is not monitored so do not send a reply to this message.
                            </Text>
                        </Section>
                    </Container>
                </Body>
            </Html>
        );
    } else {
        return (
            <Html>
                <Head />
                <Preview>Data Resource Portal: Asset Upload Receipt</Preview>
                <Body style={main}>
                    <Container style={container}>
                        <Section>
                            <Text style={text}>Hello {userFirstname},</Text>
                            <Text style={text}>
                                You have recently submitted an asset to the DRC portal with the following information:
                            </Text>
                            <Text style={text}>
                                Asset: <Link style={anchor} href={fileAsset?.link}></Link>{fileAsset?.filename}
                            </Text>
                            <Text style={text}>
                                Asset Type: {fileAsset?.filetype}
                            </Text>
                            <Text style={text}>
                                If you are not responsible for this action, please ignore and delete this message.
                            </Text>
                            <Text style={text}>
                                This email is not monitored so do not send a reply to this message.
                            </Text>
                        </Section>
                    </Container>
                </Body>
            </Html>
        );
    }

};

export function ApprovedAlert({assetName}: {assetName: string}) {
    return (
        <Html lang='en'>
            <Head />
            <Preview>Data Resource Portal: Asset Approval Confirmation </Preview>
            <Body style={main}>
                <Container style={container}>
                    <Section>
                        <Text style={text}>Hello,</Text>
                        <Text style={text}>
                            You are receiving this email because the asset: {assetName} of which you are an Uploader/Approver of 
                            has been approved. 
                        </Text>
                        <Text>
                            This email is not monitored so do not send a reply to this message.
                        </Text>
                    </Section>
                </Container>
            </Body>
        </Html>
    );
}

const main = {
    backgroundColor: "#f6f9fc",
    padding: "10px 0",
};

const container = {
    backgroundColor: "#ffffff",
    border: "1px solid #f0f0f0",
    padding: "45px",
};

const text = {
    fontSize: "16px",
    fontFamily:
        "'Open Sans', 'HelveticaNeue-Light', 'Helvetica Neue Light', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif",
    fontWeight: "300",
    color: "#404040",
    lineHeight: "26px",
};

const button = {
    backgroundColor: "#007ee6",
    borderRadius: "4px",
    color: "#fff",
    fontFamily: "'Open Sans', 'Helvetica Neue', Arial",
    fontSize: "15px",
    textDecoration: "none",
    textAlign: "center" as const,
    display: "block",
    width: "210px",
    padding: "14px 7px",
};

const anchor = {
    textDecoration: "underline",
};