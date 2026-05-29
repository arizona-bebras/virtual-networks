import { Controller } from "@nestjs/common";
import {
  ChangedResourceType,
  ChangeOperation,
  ConfigurationUpdateReason,
  type PeerConfig,
  type ReportRouterEventsResponse,
  type RouterConfiguration,
  type RouterConfigurationUpdate,
  RouterControlPlaneController,
  RouterControlPlaneControllerMethods,
} from "proto";
import { from, Observable } from "rxjs";
import { RouterService } from "./router.service.js";

@Controller()
@RouterControlPlaneControllerMethods()
export class RouterController implements RouterControlPlaneController {
  constructor(private readonly routerService: RouterService) {}
  watchRouterConfiguration(): Observable<RouterConfigurationUpdate> {
    this.routerService.emitEvent(
      ConfigurationUpdateReason.CONFIGURATION_UPDATE_REASON_MANUAL_REFRESH,
      [],
    );
    return this.routerService.getEventsObservableStream();
  }

  reportRouterEvents():
    | Promise<ReportRouterEventsResponse>
    | Observable<ReportRouterEventsResponse>
    | ReportRouterEventsResponse {
    return {
      acceptedEvents: 0,
    };
  }
}
