import * as React from 'react';
import ListSubheader from '@mui/material/ListSubheader';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Collapse from '@mui/material/Collapse';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';

export default function NestedList(props: { sectionRefs: { current: any; }[]; }) {
    const [open, setOpen] = React.useState(true);
    const [open2, setOpen2] = React.useState(true);

    const handleClick = () => {
        setOpen(!open);
    };

    const handleClick2 = () => {
        setOpen2(!open2);
    };

    const scrollToSection = (elementRef: { current: { offsetTop: any; }; }) => {
    window.scrollTo({
        top: elementRef.current.offsetTop,
        behavior: "smooth",
        });
    };


    return (
        <List
            sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}
            component="nav"
            aria-labelledby="nested-list-subheader"
            subheader={
                <ListSubheader component="div" id="nested-list-subheader">
                   Documentation
                </ListSubheader>
            }
        >
            <ListItemButton onClick={handleClick}>
                <ListItemText primary="File Types" />
                {open ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
            <Collapse in={open} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                    <ListItemButton sx={{ pl: 4 }} onClick={() => scrollToSection(props.sectionRefs[0])}>
                        <ListItemText primary="XMT" />
                    </ListItemButton>
                    <ListItemButton sx={{ pl: 4 }} onClick={() => scrollToSection(props.sectionRefs[1])}>
                        <ListItemText primary="C2M2" />
                    </ListItemButton>
                    <ListItemButton sx={{ pl: 4 }} onClick={() => scrollToSection(props.sectionRefs[2])}>
                        <ListItemText primary="KG Assertions" />
                    </ListItemButton>
                    <ListItemButton sx={{ pl: 4 }} onClick={() => scrollToSection(props.sectionRefs[4])}>
                        <ListItemText primary="Attribute Table" />
                    </ListItemButton>
                </List>
            </Collapse>
            <ListItemButton onClick={handleClick2}>
                <ListItemText primary="File Approval Stages" />
                {open2 ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
            <Collapse in={open2} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                    <ListItemButton sx={{ pl: 4 }} onClick={() => scrollToSection(props.sectionRefs[5])}>
                        <ListItemText primary="Uploaded (Not Approved)" />
                    </ListItemButton>
                    <ListItemButton sx={{ pl: 4 }} onClick={() => scrollToSection(props.sectionRefs[6])}>
                        <ListItemText primary="DCC Approved" />
                    </ListItemButton>
                    <ListItemButton sx={{ pl: 4 }} onClick={() => scrollToSection(props.sectionRefs[7])}>
                        <ListItemText primary="DRC Approved" />
                    </ListItemButton>
                </List>
            </Collapse>
            <ListItemButton>
                <ListItemText primary="File Upload Steps" />
            </ListItemButton>
            <ListItemButton>
                <ListItemText primary="File Approval Steps" />
            </ListItemButton>

        </List>
    );
}