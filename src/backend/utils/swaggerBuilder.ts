import axios from 'axios';
import { createParent } from '../actions/parents';
import { v4 as uuid } from 'uuid';
import { formatFileName } from '../../utils/utils';
import { createRoute } from '../actions/route';
import { Method, RouteParent } from '../../types';
import { findParent } from '../../utils/parent';
import { projectsManager } from '../managers';


interface Endpoint {
  path: string;
  method: string;
  description: string;
  summary: string;
  tags: string[];
}
  
/**
 * Fetches the Swagger JSON from the given URL and extracts a list of endpoints.
 * @param swaggerUrl - The URL of the Swagger JSON.
 * @returns A Promise that resolves to an array of endpoints with path, method, description, and summary.
 */
async function fetchSwaggerEndpoints(swaggerUrl: string): Promise<Endpoint[]> {
  try {
    // Fetch the Swagger JSON
    const response = await axios.get(swaggerUrl);
    const swaggerData = response.data;

    return swaggerData

  } catch (error) {
    console.error('Error fetching Swagger endpoints:', error);
    throw new Error('Failed to fetch endpoints from Swagger URL');
  }
}


function groupRoutes(routes: Endpoint[]): {[key: string]: Endpoint[]} {
  const groups: Map<string, Endpoint[]>[] = [];

  routes.forEach((route) => {
    // Split the route into segments and filter out empty strings
    const segments = [...route.path.split('/').filter(Boolean), ''];
    // Use the first segment as the group key
    segments.reduce((groupKey, segment, i)=>{
      if(!groups[i]){
        groups[i] = new Map<string, Endpoint[]>();
      }

      if (!groups[i].has(groupKey)) {
        groups[i].set(groupKey, []);
      }
      groups[i].get(groupKey)!.push(route);

      
      return groupKey + '/' + segment
    }, '')
    
  });



  const result = routes.map((route) => {
    // Split the route into segments and filter out empty strings
    const segments = [...route.path.split('/').filter(Boolean), ''];
    // Use the first segment as the group key

    const routeGrouping = segments.reduce((acc, segment, i)=>{
      const group = groups[i]
      const amountInGroup = group.get(acc.groupKey)?.length || 0

      let score = Math.pow(amountInGroup, i) + i;
     
      if(route.tags.includes(segments[i-1])){
        score = score * 4
      }
      if(amountInGroup === 1 && i !== 0 || segment === 'api' && segments[i+1]?.startsWith('v')){
        score = 0
      }

      if(score >= acc.selected.score){
        acc.selected = {
          groupIndex: i,
          amountInGroup,
          group: acc.groupKey,
          score,
          route,
        }
      }

      /// remove from arrays
      const arr = group.get(acc.groupKey);
      if (arr) {
        const index = arr.indexOf(route);
        if (index > -1) {
          arr.splice(index, 1);
        }
      }


      acc.groupKey = acc.groupKey + '/' + segment

      return acc
    },{groupKey: '', selected: {score: 0} as any})
  
    groups[routeGrouping.selected.groupIndex].get(routeGrouping.selected.group)!.push(route)

    return routeGrouping.selected
  });

  
  return result.reduce((acc,item)=>{
    if(!!acc[item.group]){
      acc[item.group].push(item.route)
    }else{
      acc[item.group] = [item.route]
    }
    return acc
  }, {})
}


const handleCreateParent = async (projectName: string, serverName: string, parentPath: string)=>{
  const id = uuid();
  let parent: RouteParent | undefined;

  const projectData = await projectsManager.getProjectServersHash(projectName)

  const server = projectData[serverName]

  const newParent: RouteParent = {
    id,
    type:'Rest',
    filename: formatFileName(parentPath) + '-' + id,
    name: null,
    routesHash:{},
    graphQlRouteHash:{},
    graphqlQueriesType: null,
    path: parentPath,
    schemaPath: null
  }

  try {
    parent = await createParent(projectName,serverName, newParent)

  } catch (error) {
    console.log('fail to create parent ' + parentPath)
    parent = await findParent(server, serverName, newParent)
    console.log('find parent ' ,parent?.path)

  }

  return parent
}


export const buildRoutesFromSwaggerData = async (projectName: string, serverName: string, swaggerEndpoints: Endpoint[]) => {
  const grouped = groupRoutes(swaggerEndpoints);

    await Promise.all(Object.keys(grouped).map(async(parentPath)=>{
      
      const parent = await handleCreateParent(projectName, serverName, parentPath)

      if(!parent?.id){
        return;
      }

      await Promise.all(grouped[parentPath].map(async (routeData)=>{
        try {
        
        const route = await createRoute(projectName,serverName, parent.id, {
          id: uuid(),
          description: routeData.description || routeData.summary,
          routePath: routeData.path,
          method: routeData.method.toLocaleLowerCase() as Method,
          activeResponseId: '',
          responsesHash: {},
          withParams: false,
          paramKey: null,
          paramType: 'body',
          paramValue:null
        });
        return route;

          
      } catch (error: any) {
        console.log('create route fail' + routeData.path, error.message)
        return null
      }
      }))

    }))
}


export const pareseSwaggerJson = (swaggerData: any)=>{

  const endpoints: Endpoint[] = [];

  // Iterate through the paths and methods
  for (const path in swaggerData.paths) {
    const pathItem = swaggerData.paths[path];

    // Iterate through each method (e.g., get, post, put, delete)
    for (const method in pathItem) {
      const methodDetails = pathItem[method];
      endpoints.push({
        path,
        method: method.toUpperCase(),
        description: methodDetails.description,
        summary: methodDetails.summary,
        tags: methodDetails.tags
      });
    }
  }

  return endpoints;
}

export const addRoutesFromSwaggerUrl = async(projectName: string, serverName: string, swaggerUrl: string)=>{
  const swaggerJson = await fetchSwaggerEndpoints(swaggerUrl);
  const endpoints = pareseSwaggerJson(swaggerJson)
  await buildRoutesFromSwaggerData(projectName, serverName, endpoints)
}

export const addRoutesFromSwaggerJson = async(projectName: string, serverName: string, swaggerJson: any)=>{
  const endpoints = pareseSwaggerJson(swaggerJson)
  await buildRoutesFromSwaggerData(projectName, serverName, endpoints)
  
}
