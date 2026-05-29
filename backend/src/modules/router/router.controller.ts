import { Controller } from "@nestjs/common";
import {
  type ReportRouterEventsResponse,
  type RouterConfigurationUpdate,
  RouterControlPlaneController,
  RouterControlPlaneControllerMethods,
} from "proto";
import { Observable } from "rxjs";
import { RouterService } from "./router.service.js";

@Controller()
@RouterControlPlaneControllerMethods()
export class RouterController implements RouterControlPlaneController {
  constructor(private readonly routerService: RouterService) {}
  watchRouterConfiguration(): Observable<RouterConfigurationUpdate> {
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
