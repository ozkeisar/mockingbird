import './details.css'
import { useGeneralStore } from "../../state";
import { ServerDetails } from "./serverDetails";
import { ReactComponent as LogoIcon } from './../../../../assets/icon.svg'; 
import { RouteDetails } from "./routeDetails";
import { ParentDetails } from "./parentDetails";
import { PresetFolderDetails } from './presetFolderDetails';
import { PresetDetails } from './presetDetails';
import { useSelectedPreset, useSelectedRoute } from '../../hooks';
import { GraphqlRouteDetails } from './graphqlRouteDetails';

export const Details = ()=>{
    const {server, parent, route} = useSelectedRoute();
    const {presetFolder, preset} = useSelectedPreset()
    const { selectedType } = useGeneralStore();
    
    const isNoSelection = !selectedType;

    const isRoute = selectedType === 'route';
    const isPreset = selectedType === 'preset';
    const isGraphql = parent?.type === 'GraphQl'

    const isServerSelected = isRoute && !!server && !parent && !route;
    const isParentSelected = isRoute && !!server && !!parent && !route;
    const isRestRouteSelected = isRoute && !!server && !!parent && !!route && !isGraphql;
    const isGraphqlRouteSelected = isRoute && !!server && !!parent && !!route && !!isGraphql;

    const isPresetFolderSelected = isPreset && !!presetFolder && !preset;
    const isPresetSelected = isPreset && !!presetFolder && !!preset;

    return (
      <>
        {isNoSelection &&  <div className="placeholder">
          <LogoIcon width={230}></LogoIcon>
        </div>}
        {isServerSelected && <ServerDetails/>}
        {isParentSelected && <ParentDetails /> }
        {isRestRouteSelected && <RouteDetails/> }
        {isGraphqlRouteSelected && <GraphqlRouteDetails/> }
        {isPresetFolderSelected && <PresetFolderDetails />}
        {isPresetSelected && <PresetDetails />}
      </>
    )
  }
  