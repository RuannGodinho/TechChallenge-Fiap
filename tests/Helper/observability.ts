import { IObservabilityPort } from '../../src/application/ports/observability.port';

export function createObservabilityMock(): jest.Mocked<IObservabilityPort> {
    return {
        emit: jest.fn(),
    };
}
