import { Tooltip } from "@mui/material";
import { BsCheckCircleFill } from "react-icons/bs";
import { FaCircleExclamation } from "react-icons/fa6";

export const NotApprovedSymbol = () => {
    return <Tooltip title='Not permitted to change' placement="top">
        <div>
            <FaCircleExclamation size={20} />
        </div>
    </Tooltip>
}

export const ApprovedSymbol = () => {
    return <Tooltip title='Not permitted to change' placement="top">
        <div>
            <BsCheckCircleFill size={20} />
        </div>
    </Tooltip>
}