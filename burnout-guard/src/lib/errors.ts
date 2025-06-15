export class CriticalError extends Error {}
export class DatabaseError extends CriticalError {}
export class ValidationError extends CriticalError {}
export class ApiError extends CriticalError {}
