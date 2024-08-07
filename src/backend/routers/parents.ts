import { Router, Request, Response, NextFunction } from 'express';
import { GraphQlRouteHash, RouteHash } from '../../types';
import { projectsManager } from '../managers';
import { logger } from '../utils/utils';

const parentsRouter = Router();

parentsRouter.get('/:projectName/:serverName/:parentId', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { projectName, serverName, parentId, routeId} = req.params;
        logger('restRouter get /:projectName/:serverName/:parentId',{ projectName, serverName, parentId, routeId});

        const serverHash = await projectsManager.getProjectServersHash(projectName)
        if(!serverHash){
            res.status(400).send({success: false, message: "project not exist" })

            return;
        }
        const server = serverHash[serverName];
        const parent = server.parentRoutesHash[parentId]

        parent.graphQlRouteHash = Object.values(parent.graphQlRouteHash || {}).reduce((acc, item)=>{
            acc[item.id] = {
                ...item,
                responsesHash: null
            }
            return acc
        }, {} as GraphQlRouteHash)


        parent.routesHash = Object.values(parent.routesHash || {}).reduce((acc, item)=>{
            acc[item.id] = {
                ...item,
                responsesHash: null
            }
            return acc
        }, {} as RouteHash)

        res.status(200).send({success: true, parent})
    } catch (error: any) {
        console.log(error)
        logger('Error get /:projectName/:serverName/:parentId',error?.message)

        res.status(500).send({success: false, message: "fail to get parent"})
    }
})


export {parentsRouter}
