import { BusinessLogEvent } from '../observability/business-events';

export interface IObservabilityPort {
    emit(event: BusinessLogEvent): void;
}
