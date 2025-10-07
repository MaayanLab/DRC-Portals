import { IncomingMessage } from "node:http"

async function authMiddleWare(req: IncomingMessage, res: any, next:Function): Promise<any> {
	console.log("Authenticating...")
	if (process.env.API_KEY === undefined || process.env.API_KEY === '') {
		console.log("No API Key set, allowing all users")
		next()
	}else {
		const api_key = req.headers['Authorization'] || req.headers['authorization']
		if (!api_key) {
			console.error("No API Key sent...")
			return res.status(401).json({ message: 'No api key sent' });
		}
		const key = (typeof api_key == 'string' ? api_key: api_key[0]).replace("Bearer ", "")
		if (process.env.API_KEY.split(",").indexOf(key) > -1) {
			console.log("Authenticated")
			next();
		} else {
			console.error("Invalid key")
			return res.status(401).json({ message: 'Invalid api key' });
		}
	} 
}

export default authMiddleWare