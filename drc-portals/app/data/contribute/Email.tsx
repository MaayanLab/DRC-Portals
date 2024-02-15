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
import Email from 'next-auth/providers/email';


function EmailLayout({ innerElements }: { innerElements: JSX.Element }) {
    return (
        <Html lang='en'>
            <Head />
            <Preview>CFDE WORKBENCH Email</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Section>
                        {/* <Img
                            src={`${process.env.PUBLIC_URL}/img/favicon.png`}
                            width="40"
                            height="37"
                            alt="workbenchLogo"
                            className="my-0 mx-auto"
                        /> */}
                        {innerElements}
                        <Text style={text}>
                            Best regards,
                            <br></br>
                            The CFDE WORKBENCH team
                        </Text>
                    </Section>
                </Container>
            </Body>
        </Html>
    )
}




export function DCCApproverUploadEmail({ uploaderName, approverName, assetName }: { uploaderName: string, approverName: string, assetName: string }) {
    return (
        <EmailLayout innerElements={<>
            <Text style={text}>Dear, {approverName}</Text>
            <Text style={text}>
                The new asset {assetName} from your DCC has been uploaded by {uploaderName} and it is ready for your approval.
            </Text>
            <Text style={text}>
                Please click the URL below to access your account to review the uploaded asset:
            </Text>
            <button>Click here</button>
            <Link href="https://data.cfde.cloud/data/contribute/uploaded">  👉 Click here to review asset 👈</Link>
            <Text style={text}>
                If you encounter any issues, please do not reply to this message as this email box is not monitored. To contact the Data Resource Center, please email stephanieolaiya@mssm.edu.
            </Text>
        </>} />
    );
}


interface AssetSubmitReceiptProps {
    userFirstname?: string;
    codeAsset?: CodeAsset;
    fileAsset?: FileAsset
}

export const AssetSubmitReceiptEmail = ({
    userFirstname,
    codeAsset,
    fileAsset,
}: AssetSubmitReceiptProps) => {
    let assetInfo;
    if (codeAsset) {
        assetInfo = <>
            <Text style={text}>
                Asset: <Link style={anchor} href={codeAsset?.link}>{codeAsset?.name}</Link>
            </Text>
            <Text style={text}>
                Asset Type: {codeAsset?.type}
            </Text></>
    } else {
        assetInfo = <>
            <Text style={text}>
                Asset: <Link style={anchor} href={fileAsset?.link}>{fileAsset?.filename}</Link>
            </Text>
            <Text style={text}>
                Asset Type: {fileAsset?.filetype}
            </Text></>
    }
    return (
        <EmailLayout innerElements={<><Text style={text}>Dear {userFirstname},</Text>
            <Text style={text}>
                This email serves as a confirmation that you submitted a new asset to the CFDE WORKBENCH with the following information:
            </Text>
            {assetInfo}
            <Text style={text}>
                If this submission was not initiated by you, please contact the DRC by email immediately.
            </Text>
            <Text style={text}>
                Please do not reply to this message as this email box is not monitored. To contact the DRC, please email stephanie.olaiya@msssm.edu.
            </Text></>} />
    )
};





interface AssetProps {
    codeAsset?: CodeAsset | null;
    fileAsset?: FileAsset | null
}

export function Uploader_DCCApprovedEmail({ uploaderName, approverName, asset }: { uploaderName: string | null, approverName: string, asset: AssetProps }) {
    let assetInfo;
    if (asset.codeAsset) {
        assetInfo = <>
            <Text style={text}>
                Asset: <Link style={anchor} href={asset.codeAsset?.link}>{asset.codeAsset?.name}</Link>
            </Text>
            <Text style={text}>
                Asset Type: {asset.codeAsset?.type}
            </Text></>
    } else {
        assetInfo = <>
            <Text style={text}>
                Asset: <Link style={anchor} href={asset.fileAsset?.link}>{asset.fileAsset?.filename}</Link>
            </Text>
            <Text style={text}>
                Asset Type: {asset.fileAsset?.filetype}
            </Text></>
    }
    return (
        <EmailLayout innerElements={<>
            <Text style={text}>Dear {uploaderName},</Text>
            <Text style={text}>
                This email serves as a confirmation that an asset that you submitted has been approved by the DCC Approver: {approverName}.
            </Text>
            {assetInfo}
            <Text style={text}>
                Please do not reply to this message as this email box is not monitored. To contact the DRC, please send email stephanie.olaiya@msssm.edu.
            </Text></>} />
    );
}

export function DCCApprover_DCCApprovedEmail({ approverName, asset }: { approverName: string, asset: AssetProps }) {
    let assetInfo;
    if (asset.codeAsset) {
        assetInfo = <>
            <Text style={text}>
                Asset: <Link style={anchor} href={asset.codeAsset?.link}>{asset.codeAsset?.name}</Link>
            </Text>
            <Text style={text}>
                Asset Type: {asset.codeAsset?.type}
            </Text></>
    } else {
        assetInfo = <>
            <Text style={text}>
                Asset: <Link style={anchor} href={asset.fileAsset?.link}>{asset.fileAsset?.filename}</Link>
            </Text>
            <Text style={text}>
                Asset Type: {asset.fileAsset?.filetype}
            </Text></>
    }
    return (
        <EmailLayout innerElements={<>
            <Text style={text}>Dear {approverName},</Text>
            <Text style={text}>
                This email serves as a confirmation that you approved an asset to the CFDE WORKBENCH with the following information:
            </Text>
            {assetInfo}
            <Text style={text}>
                If this approval was not initiated by you, please contact the DRC by email immediately.
            </Text>
            <Text style={text}>
                Please do not reply to this message as this email box is not monitored. To contact the DRC, please email stephanie.olaiya@msssm.edu.
            </Text></>} />
    );
}

export function DRCApprover_DCCApprovedEmail({ reviewerName, uploaderName, dcc, approverName }: { reviewerName: string, uploaderName: string | null, dcc: string | null, approverName: string | null }) {
    return (
        <EmailLayout innerElements={<>                        <Text style={text}>Dear {reviewerName},</Text>
            <Text style={text}>
                A new asset has been uploaded to the portal by {uploaderName} from {dcc} and was approved by {approverName} and is ready in the system for your review.
            </Text>
            <Text style={text}>
                Please click the URL below to access your account to review the uploaded asset:
            </Text>
            <button>Click here</button>
            <Link href="https://data.cfde.cloud/data/contribute/uploaded">  👉 Click here to review asset 👈</Link></>} />
    );
}

export function Uploader_DRCApprovedEmail({ uploaderName, reviewerName, asset }: { uploaderName: string| null, reviewerName: string, asset: AssetProps }) {
    let assetInfo;
    if (asset.codeAsset) {
        assetInfo = <>
            <Text style={text}>
                Asset: <Link style={anchor} href={asset.codeAsset?.link}>{asset.codeAsset?.name}</Link>
            </Text>
            <Text style={text}>
                Asset Type: {asset.codeAsset?.type}
            </Text></>
    } else {
        assetInfo = <>
            <Text style={text}>
                Asset: <Link style={anchor} href={asset.fileAsset?.link}>{asset.fileAsset?.filename}</Link>
            </Text>
            <Text style={text}>
                Asset Type: {asset.fileAsset?.filetype}
            </Text></>
    }
    return (
        <EmailLayout innerElements={<>
            <Text style={text}>Dear {uploaderName},</Text>
            <Text style={text}>
                This email serves as a confirmation that an asset that you submitted has been approved by the DRC Approver: {reviewerName}.
            </Text>
            {assetInfo}
            <Text style={text}>
                Please do not reply to this message as this email box is not monitored. To contact the DRC, please send email stephanie.olaiya@msssm.edu.
            </Text>
        </>} />
    );
}

export function DCCApprover_DRCApprovedEmail({ approverName, reviewerName, asset }: { approverName: string | null, reviewerName: string, asset: AssetProps }) {
    let assetInfo;
    if (asset.codeAsset) {
        assetInfo = <>
            <Text style={text}>
                Asset: <Link style={anchor} href={asset.codeAsset?.link}>{asset.codeAsset?.name}</Link>
            </Text>
            <Text style={text}>
                Asset Type: {asset.codeAsset?.type}
            </Text></>
    } else {
        assetInfo = <>
            <Text style={text}>
                Asset: <Link style={anchor} href={asset.fileAsset?.link}>{asset.fileAsset?.filename}</Link>
            </Text>
            <Text style={text}>
                Asset Type: {asset.fileAsset?.filetype}
            </Text></>
    }
    return (
        <EmailLayout innerElements={<>
            <Text style={text}>Dear {approverName},</Text>
            <Text style={text}>
                This email serves as a confirmation that an asset that you are authorzied to approve has been reviewed by the DRC Approver: {reviewerName}.
            </Text>
            {assetInfo}
            <Text style={text}>
                Please do not reply to this message as this email box is not monitored. To contact the DRC, please send email stephanie.olaiya@msssm.edu.
            </Text></>} />
    );
}


export function DRCApprover_DRCApprovedEmail({reviewerName, asset }: { reviewerName: string | null, asset: AssetProps }) {
    let assetInfo;
    if (asset.codeAsset) {
        assetInfo = <>
            <Text style={text}>
                Asset: <Link style={anchor} href={asset.codeAsset?.link}>{asset.codeAsset?.name}</Link>
            </Text>
            <Text style={text}>
                Asset Type: {asset.codeAsset?.type}
            </Text></>
    } else {
        assetInfo = <>
            <Text style={text}>
                Asset: <Link style={anchor} href={asset.fileAsset?.link}>{asset.fileAsset?.filename}</Link>
            </Text>
            <Text style={text}>
                Asset Type: {asset.fileAsset?.filetype}
            </Text></>
    }
    return (
        <EmailLayout innerElements={<>
            <Text style={text}>Dear {reviewerName},</Text>
            <Text style={text}>
                This email serves as a confirmation that you approved an asset in the CFDE WORKBENCH with the following information:                        
                </Text>
            {assetInfo}
            <Text style={text}>
                If this approval was not initiated by you, please contact the DRC by email immediately.
            </Text>
            <Text style={text}>
                Please do not reply to this message as this email box is not monitored. To contact the DRC, please send email stephanie.olaiya@msssm.edu.
            </Text></>} />
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