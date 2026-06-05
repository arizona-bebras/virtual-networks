import { Controller } from "@nestjs/common";
import {
  type ReportRouterEventsResponse,
  type RouterConfigurationUpdate,
  type RouterEvent,
  RouterControlPlaneController,
  RouterControlPlaneControllerMethods,
} from "proto";
import { Observable, concatMap, lastValueFrom } from "rxjs";
import { RouterService } from "./router.service.js";

@Controller()
@RouterControlPlaneControllerMethods()
export class RouterController implements RouterControlPlaneController {
  constructor(private readonly routerService: RouterService) {}
  watchRouterConfiguration(): Observable<RouterConfigurationUpdate> {
    return this.routerService.getEventsObservableStream();
  }

  async reportRouterEvents(
    requestsStream: Observable<RouterEvent>,
  ): Promise<ReportRouterEventsResponse> {
    await lastValueFrom(
      requestsStream.pipe(
        concatMap(event => this.routerService.writeRouterEvent(event))
      )
    );
  
    const acceptedEvents = await this.routerService.getAcceptedEventsCount();
    
    return acceptedEvents;
  }
}
