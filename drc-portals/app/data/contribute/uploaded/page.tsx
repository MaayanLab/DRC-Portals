'use client'
import * as React from 'react';
import FilesTable from '@/components/FilesTable';
import Container from '@mui/material/Container'
import { BsCheckCircleFill, BsCheckCircle } from "react-icons/bs";
import { ImNotification } from "react-icons/im";
import { Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';


function createData(
    date: string,
    uploadedBy: string,
    email: string,
    dcc: string,
    fileType: string,
    uploadedFile: string,
    status: React.JSX.Element,
) {
    return { date, uploadedBy, email, dcc, fileType, uploadedFile, status };
}


function UserFiles(props: any) {
    const { data: session, status } = useSession();
    const [rowData, setRowData] = useState<any[]>([])
    const [dataLoaded, setDataLoaded] = useState<boolean>(false)





    useEffect(() => {
        fetch('/api/getuserfiles')
            .then((res) => res.json())
            .then((data) => {
                console.log(JSON.parse(data.message)[0])
                let sessionEmail = ''
                console.log(session?.user.email)
                if (session?.user.email != null) {
                    sessionEmail = session?.user.email
                }
                console.log(sessionEmail)
                let mappedData = JSON.parse(data.message).map((row : any) => {
                    return createData(row.lastmodified.toString().split('T')[0], row.creator, sessionEmail, 'LINCS', row.filetype, 'S3 bucket link', <ImNotification />)
                })
                console.log(mappedData)
                setRowData(mappedData)
                setDataLoaded(true)
            })
    }, [])

    console.log(rowData)



    if (!dataLoaded) return <p>Loading...</p>


    return (
        <>
            <Container className="mt-10 justify-content-center">
                <Typography variant="h3" className='text-center p-5'>Uploaded Files</Typography>
                <FilesTable rows={rowData} />
            </Container>


        </>
    );
}

export default UserFiles;




