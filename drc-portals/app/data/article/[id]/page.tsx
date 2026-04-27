'use client'
import ReactMarkdown from "react-markdown";
import remarkGfm from 'remark-gfm'
import Link from 'next/link';
import { Grid, Skeleton, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";


const Markdown = (props: {children: string | null | undefined}) =>
  <ReactMarkdown
	remarkPlugins={[remarkGfm]}
	components={{
	  h1: (props: {[key:string]: any}) => <Typography sx={{mt: 2, mb: 2}} variant="h1">{props.children}</Typography>,
	  h2: (props: {[key:string]: any}) => props.id === 'footnote-label' ? <Typography sx={{mt: 2, mb: 2}} variant="h3">References</Typography> : <Typography variant="h2" {...props} />,
	  ol: (props: {[key:string]: any}) => <ol style={{listStyle: 'decimal', marginLeft: 10}}>{props.children}</ol>,
	  ul: (props: {[key:string]: any}) => <ul style={{listStyle: 'square'}}>{props.children}</ul>,
	  a: (props: {[key:string]: any}) => props.className === 'data-footnote-backref' ? null: <Link href={props.href} {...props}>{props.children} </Link>,
	  p: (props: {[key:string]: any}) => <Typography variant="body1" mb={2} mt={2}>{props.children}</Typography>,
	}}
  >{props.children}</ReactMarkdown>

interface RunnableResult  {
  result: {
    data?: {
      output?: {
        output?: {
          value: string
        },
        error?: {
          value: string
        }
      }
    }
  }
}
const Article = ({params}: {
	params: {
		id: string
	}
}) => {
	const taskId = params.id
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState('')
	const abortController = useRef(new AbortController());
	const getAbortController = () => {
		const controller = abortController.current;
		if (controller !== undefined) {
			controller.abort("Cancelling request.");
			abortController.current = new AbortController();
		}
		return abortController.current
	};
	const intervalId = useRef<any | null>(null)
	const [deepDiveResults, setDeepDiveResults] = useState<null | RunnableResult[]>(null)
	
	const runRunnable = async () => {
		const controller = getAbortController()
		const res = await fetch(`/data/api`, {
			method: 'POST',
			body: JSON.stringify({
			  methods: 'getRunnable',
			  payload: {
				batch: 1,
				input: JSON.stringify({"0": {runnable_id: taskId}})
			  },
			  signal: controller.signal
			}),
		})
		if (res.status === 200) {
			const results = await res.json()
			setDeepDiveResults(results)
		} 
	  }

	useEffect(() => {
		setLoading(true)
		intervalId.current = setInterval(runRunnable, 5000);
		return () => clearTimeout(intervalId.current);
	}, [taskId]);
	
	useEffect(() => {
		// if (deepDiveResults !== null) console.log(deepDiveResults[0].result?.data?.output?.output)
		if (deepDiveResults !== null && deepDiveResults[0].result?.data?.output?.output) {
			setLoading(false)
			clearInterval(intervalId.current)
			intervalId.current = null;
		}
		if (deepDiveResults !== null && deepDiveResults[0].result?.data?.output?.error) {
			setLoading(false)
			clearInterval(intervalId.current)
			intervalId.current = null;
			setError(deepDiveResults[0].result?.data?.output?.error.value)
		}
	}, [deepDiveResults])

	if (loading) return (
		<Grid container spacing={1}>
			<Grid item xs={12}>
				<Skeleton variant="text" sx={{ fontSize: '3rem' }} />
			</Grid>
			<Grid item xs={12}>
				<Skeleton variant="rounded" width={"100%"} height={100} />
			</Grid>
			<Grid item xs={12}>
				<Skeleton variant="rounded" width={"100%"} height={80} />
			</Grid>
		</Grid>
	)
	else if (deepDiveResults === null) return null
	else if (deepDiveResults[0].result?.data?.output?.output) {
		const val = deepDiveResults[0].result.data.output.output.value
		// make sure it starts with #
		const md = val.split(" ")[0].indexOf("#") > -1 ? val: "## "+val
		return <Markdown>{md}</Markdown>
	} else if (error !== '') {
		const md = error
		return <Markdown>{md}</Markdown>
	}
	else {
		return null
	}
}

export default Article