import { GraphQlRouteType } from "../../../types"
import { getGraphqlRouteBGColor } from "../../utils"

export const GraphqlRouteLabel = ({label, type}:{label: string, type: GraphQlRouteType})=>{
  return (
    <div className='tree-item-container'>
      {
        !!type 
        && <div className="graphql-method-tree" style={{backgroundColor: getGraphqlRouteBGColor(type)}}>
          {type}
        </div>
      }
      {label}
    </div>
  )
}