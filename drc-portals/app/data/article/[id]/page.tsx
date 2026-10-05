import ReactMarkdown from "react-markdown";
import remarkGfm from 'remark-gfm'
import Link from 'next/link';
import { Grid, Skeleton, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import Article from "./article";


const ArticleHome = async (props: {
	params: Promise<{
		id: string
	}>
}) => {
	const params = await props.params
	const taskId = params.id
	return <Article id={taskId}/>
}

export default ArticleHome