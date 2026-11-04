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