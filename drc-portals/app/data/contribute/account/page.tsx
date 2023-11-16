'use client'
import { Container, TextField, Box, Typography, Theme, SelectChangeEvent, useTheme, FormControl, InputLabel, Select, OutlinedInput, MenuItem, Button } from "@mui/material";
import { useSession } from "next-auth/react"
import { useState } from "react";


const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const names = [
  'LINCS',
  '4DN',
  'A2CPS',
  'ExRNA',
  'GlyGen',
  'GTEx',
  'HMP',
  'HuBMAP',
  'IDG',
  'KidsFirst',
  'MoTrPAC',
  'Metabolomics',
  'SenNet',
  'SPARC'
];



function getStyles(name: string, personName: string[], theme: Theme) {
    return {
      fontWeight:
        personName.indexOf(name) === -1
          ? theme.typography.fontWeightRegular
          : theme.typography.fontWeightMedium,
    };
  }

export default function AccountPage() {
    const { data: session, status } = useSession();

    const [name, setName] = useState('');

    // variables and functions for dcc multiple select
    const theme = useTheme();
    const [personName, setPersonName] = useState<string[]>([]);

    const handleChange = (event: SelectChangeEvent<typeof personName>) => {
      const {
        target: { value },
      } = event;
      setPersonName(
        // On autofill we get a stringified value.
        typeof value === 'string' ? value.split(',') : value,
      );
    };

    function handleSubmit(event: React.FormEvent<HTMLFormElement>){
        event.preventDefault();
        var data = new FormData(event.currentTarget);
        let formObject = Object.fromEntries(data.entries());
        console.log(formObject)
            // put metadata in database
        fetch('/api/saveuser', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            },
            body: JSON.stringify(formObject),
        }).then((response) => {
            if (response.status === 200) {                            
                console.log('Success')
            }
        });
    }

    if ((status === "authenticated") && (session.user != undefined)) {
        return (
            <>
                <Container className="mt-10 justify-content-center"> 
                    <Typography variant="h3" className='text-center p-5'>Account Information</Typography>
                    <Typography className='text-center p-5'>Please complete account information before approving or the uploading forms</Typography>
                    <Box
                        component="form"
                        noValidate
                        autoComplete="off"
                        sx={{ display: 'grid', gridTemplateRows: 'repeat(3, 1fr)', '& > :not(style)': { m: 1, width: '50ch' } }}
                        justifyContent='center'
                        onSubmit={handleSubmit}
                    >
                        <TextField
                            disabled
                            id="input-name"
                            label="Name"
                            name='name'
                            value={session.user.name}
                        />
                        <TextField
                            id="input-email"
                            label="Email"
                            value={session.user.email}
                            name='email'
                            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                setName(event.target.value);
                            }}
                        />
                        <FormControl sx={{ m: 1, width: 300 }}>
                            <InputLabel id="demo-multiple-name-label">DCC</InputLabel>
                            <Select
                                labelId="demo-multiple-name-label"
                                id="demo-multiple-name"
                                multiple
                                value={personName}
                                onChange={handleChange}
                                input={<OutlinedInput label="Name" />}
                                MenuProps={MenuProps}
                                name='DCC'
                            >
                                {names.map((name) => (
                                    <MenuItem
                                        key={name}
                                        value={name}
                                        style={getStyles(name, personName, theme)}
                                    >
                                        {name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <Button variant="contained" type='submit' sx={{justifySelf:"center"}}>
                            Save Changes
                        </Button>
                    </Box>
                </Container>
            </>
        );
    }
}

