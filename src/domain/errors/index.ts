export class AppError extends Error {
    public readonly statusCode: number;
    public readonly isOperational: boolean;

    constructor(message: string, statusCode: number, isOperational: boolean = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        Object.setPrototypeOf(this, new.target.prototype);
        Error.captureStackTrace(this);
    }
}

export class VehicleNotAvailableError extends AppError {
    constructor(message: string = 'Vehicle is not available for the selected dates.') {
        super(message, 409);
    }
}

export class ValidationException extends AppError {
    constructor(message: string) {
        super(message, 400);
    }
}

export class UnauthorizedException extends AppError {
    constructor(message: string = 'Unauthorized access.') {
        super(message, 401);
    }
}

export class ForbiddenException extends AppError {
    constructor(message: string = 'Access forbidden.') {
        super(message, 403);
    }
}
