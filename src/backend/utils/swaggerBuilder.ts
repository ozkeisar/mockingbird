import axios from 'axios';


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
    } catch (error) {
      console.error('Error fetching Swagger endpoints:', error);
      throw new Error('Failed to fetch endpoints from Swagger URL');
    }
  }
  
  
  
  // Example usage:
  (async () => {
    const swaggerUrl = 'https://petstore.swagger.io/v2/swagger.json'; // Replace with the actual Swagger URL
    try {
      const endpoints = await fetchSwaggerEndpoints(swaggerUrl);
      // console.log(endpoints)
      const grouped = groupRoutes(endpoints);
      // console.log(grouped);
  
      // console.log(JSON.stringify(endpoints, null, 2)); // Outputs the endpoints as JSON
    } catch (error: any) {
      console.error('Failed to retrieve endpoints:', error.message);
    }
  })();
  
  
  
  
  function groupRoutes(routes: Endpoint[]): string[][] {
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
        // if(route.tags.includes(segment)){
        //   score = score * 4
        // }
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
        acc[item.group].push(item.route.path)
      }else{
        acc[item.group] = [item.route.path]
      }
      return acc
    }, {})
  }
  