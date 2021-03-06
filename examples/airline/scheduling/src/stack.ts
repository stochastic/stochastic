import { EventBus } from "@aws-cdk/aws-events"
import * as cdk from "@aws-cdk/core"

import { BoundedContextConstruct, EmitEventBridgeBinding } from "stochastic-aws-serverless"
import {
  ScheduledFlightsAdded,
  ScheduledFlightsRemoved,
  ScheduledFlightsUpdated,
  ScheduledRouteAdded,
  scheduling,
} from "./service"

export class SchedulingStack extends cdk.Stack {
  readonly scheduling: BoundedContextConstruct<typeof scheduling>

  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    const eventBus = EventBus.fromEventBusArn(
      this,
      "DefaultEventBus",
      this.formatArn({
        service: "events",
        resource: "event-bus",
        sep: "/",
        resourceName: "default",
      }),
    )

    this.scheduling = new BoundedContextConstruct(this, "Scheduling", {
      boundedContext: scheduling,
      emitEvents: [
        new EmitEventBridgeBinding({
          events: [ScheduledFlightsAdded, ScheduledFlightsRemoved, ScheduledRouteAdded],
          eventBus,
        }),
      ],
      config: {},
    })
    // Destroy this table when the stack is destroyed since this is just an example app.
    this.scheduling.eventStore.table.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY)
  }
}
const app = new cdk.App()
new SchedulingStack(app, "Scheduling", { description: "Flight Scheduling service" })
