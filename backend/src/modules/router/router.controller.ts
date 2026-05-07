import {
  type handleClientStreamingCall,
  Metadata,
  type ServerUnaryCall,
} from "@grpc/grpc-js";
import { Controller } from "@nestjs/common";
import { GrpcMethod, GrpcStreamMethod } from "@nestjs/microservices";
import { from, Observable } from "rxjs";
import { controlplane } from "./interfaces/router-controlplane.tsproto";
import { RouterService } from "./router.service";

@Controller()
export class RouterController {
  constructor(private readonly routerService: RouterService) {}

  @GrpcMethod("RouterControlPlane", "GetRouterConfiguration")
  getRouterConfiguration(
    request: controlplane.GetRouterConfigurationRequest,
    metadata: Metadata,
    call: ServerUnaryCall<any, any>,
  ): controlplane.RouterConfiguration {
    return {
      revision: "test",
    };
  }

  @GrpcMethod("RouterControlPlane", "WatchRouterConfiguration")
  watchRouterConfiguration(
    request: controlplane.WatchRouterConfigurationRequest,
    metadata: Metadata,
    call: ServerUnaryCall<any, any>,
  ): Observable<controlplane.RouterConfigurationUpdate> {
    const testUpdates = [
      {
        revision: "test",
      },
      {
        revision: "test",
      },
    ];

    return from(testUpdates);
  }

  @GrpcStreamMethod("RouterControlPlane", "ReportRouterEvents")
  reportRouterEvents(
    event: Observable<controlplane.RouterEvent>,
    metadata: Metadata,
    call: handleClientStreamingCall<any, any>,
  ): controlplane.ReportRouterEventsResponse {
    return {
      acceptedEvents: 0,
      lastEventId: "test",
    };
  }
}
