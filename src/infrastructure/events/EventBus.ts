import { EventEmitter } from 'events';
import { Logger } from '../../infrastructure/Logger';

/**
 * EventBus - Observer Pattern implementation using Node.js EventEmitter.
 * Provides a centralized pub/sub mechanism for domain events.
 */
class EventBusClass extends EventEmitter {
    private static instance: EventBusClass;

    private constructor() {
        super();
        this.setMaxListeners(20);
    }

    static getInstance(): EventBusClass {
        if (!EventBusClass.instance) {
            EventBusClass.instance = new EventBusClass();
        }
        return EventBusClass.instance;
    }

    publish(event: string, data: any): void {
        Logger.info(`Event published: ${event}`, { event, dataKeys: Object.keys(data) });
        this.emit(event, data);
    }

    subscribe(event: string, handler: (data: any) => void): void {
        Logger.info(`Subscriber registered for event: ${event}`);
        this.on(event, handler);
    }
}

// Domain Events
export const DomainEvents = {
    CUSTOMER_CREATED: 'customer.created',
    RENTAL_CREATED: 'rental.created',
    VEHICLE_STATE_CHANGED: 'vehicle.state.changed',
    INSURANCE_VERIFICATION_REQUIRED: 'insurance.verification.required',
} as const;

export const EventBus = EventBusClass.getInstance();
