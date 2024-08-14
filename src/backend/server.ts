import { getCurrentIPAddresses } from "./utils";
import { server } from "./app";


export const startInternalServer = (port?: number)=>{
    let iPAddresses = getCurrentIPAddresses();
	const host = iPAddresses[0];
	const _port = port ?? 1511
    
	try {
		server.listen(_port, () => {
			console.log(`*****internal server is up listening on http://${host}:${_port}/`)
		});
	} catch (error) {
		console.log('Error: fail to start server ',error)
	}
}

export const closeInternalServer = ()=>{
    if(!!server){
		server.close();

		console.log(`internal server is down...`)
	}
}
