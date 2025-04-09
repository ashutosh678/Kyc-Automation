import { Response } from "express";
import { ReasonPhrases } from "http-status-codes";

export enum ErrorType {
	BAD_TOKEN = "BAD_TOKEN",
	TOKEN_EXPIRED = "TOKEN_EXPIRED",
	UNAUTHORIZED = "UNAUTHORIZED",
	ACCESS_TOKEN = "ACCESS_TOKEN",
	INTERNAL_SERVER = "INTERNAL_SERVER",
	NOT_FOUND = "NOT_FOUND",
	NO_DATA = "NO_DATA",
	NOT_ACCEPTABLE = "NOT_ACCEPTABLE",
	BAD_REQUEST = "BAD_REQUEST",
	FORBIDDEN = "FORBIDDEN",
	RESOURCE_NOT_EXISTS = "RESOURCE_NOT_EXISTS",
	RESOURCE_EXISTS = "RESOURCE_EXISTS",
	CONFLICT = "CONFLICT",
	UNPROCESSABLE_ENTITY = "UNPROCESSABLE_ENTITY",
	TOO_MANY_REQUESTS = "TOO_MANY_REQUESTS",
	PAYLOAD_TOO_LARGE = "PAYLOAD_TOO_LARGE",
}

export abstract class ApiError extends Error {
	constructor(
		public type: ErrorType,
		public message: string = "Error occurred"
	) {
		super(type);
	}

	public static handle(err: ApiError, res: Response): Response {
		switch (err.type) {
			case ErrorType.BAD_TOKEN:
			case ErrorType.TOKEN_EXPIRED:
			case ErrorType.UNAUTHORIZED:
				return res.status(401).json({ success: false, message: err.message });
			case ErrorType.ACCESS_TOKEN:
				return res.status(403).json({ success: false, message: err.message });
			case ErrorType.INTERNAL_SERVER:
				return res.status(500).json({ success: false, message: err.message });
			case ErrorType.NOT_FOUND:
			case ErrorType.NO_DATA:
				return res.status(404).json({ success: false, message: err.message });
			case ErrorType.NOT_ACCEPTABLE:
				return res.status(406).json({ success: false, message: err.message });
			case ErrorType.BAD_REQUEST:
				return res.status(400).json({ success: false, message: err.message });
			case ErrorType.FORBIDDEN:
				return res.status(403).json({ success: false, message: err.message });
			case ErrorType.RESOURCE_NOT_EXISTS:
				return res.status(404).json({ success: false, message: err.message });
			case ErrorType.RESOURCE_EXISTS:
				return res.status(400).json({ success: false, message: err.message });
			case ErrorType.CONFLICT:
				return res.status(409).json({ success: false, message: err.message });
			case ErrorType.UNPROCESSABLE_ENTITY:
				return res.status(422).json({ success: false, message: err.message });
			case ErrorType.TOO_MANY_REQUESTS:
				return res.status(429).json({ success: false, message: err.message });
			case ErrorType.PAYLOAD_TOO_LARGE:
				return res.status(413).json({ success: false, message: err.message });
			default:
				return res
					.status(500)
					.json({ success: false, message: "Internal Server Error" });
		}
	}
}

export class AuthFailure extends ApiError {
	constructor(message: string = ReasonPhrases.UNAUTHORIZED) {
		super(ErrorType.UNAUTHORIZED, message);
	}
}

export class InternalServerError extends ApiError {
	constructor(message: string = ReasonPhrases.INTERNAL_SERVER_ERROR) {
		super(ErrorType.INTERNAL_SERVER, message);
	}
}

export class BadRequest extends ApiError {
	constructor(message: string = ReasonPhrases.BAD_REQUEST) {
		super(ErrorType.BAD_REQUEST, message);
	}
}

export class NotFound extends ApiError {
	constructor(message: string = ReasonPhrases.NOT_FOUND) {
		super(ErrorType.NOT_FOUND, message);
	}
}

export class Forbidden extends ApiError {
	constructor(message: string = ReasonPhrases.FORBIDDEN) {
		super(ErrorType.FORBIDDEN, message);
	}
}

export class NotAcceptable extends ApiError {
	constructor(message: string = ReasonPhrases.NOT_ACCEPTABLE) {
		super(ErrorType.NOT_ACCEPTABLE, message);
	}
}

export class BadToken extends ApiError {
	constructor(message = "Token is not valid") {
		super(ErrorType.BAD_TOKEN, message);
	}
}

export class TokenExpired extends ApiError {
	constructor(message = "Token is expired") {
		super(ErrorType.TOKEN_EXPIRED, message);
	}
}

export class NoData extends ApiError {
	constructor(message = "No data available") {
		super(ErrorType.NO_DATA, message);
	}
}

export class AccessToken extends ApiError {
	constructor(message = "Invalid access token") {
		super(ErrorType.ACCESS_TOKEN, message);
	}
}

export class ResourceNotFound extends ApiError {
	constructor(resource: string) {
		const msg = `${resource} not found`;
		super(ErrorType.RESOURCE_NOT_EXISTS, msg);
	}
}

export class ResourceFound extends ApiError {
	constructor(resource: string) {
		const msg = `${resource} already exists`;
		super(ErrorType.RESOURCE_EXISTS, msg);
	}
}

export class Conflict extends ApiError {
	constructor(message: string = ReasonPhrases.CONFLICT) {
		super(ErrorType.CONFLICT, message);
	}
}

export class UnprocessableEntity extends ApiError {
	constructor(message: string = ReasonPhrases.UNPROCESSABLE_ENTITY) {
		super(ErrorType.UNPROCESSABLE_ENTITY, message);
	}
}

export class TooManyRequests extends ApiError {
	constructor(message: string = ReasonPhrases.TOO_MANY_REQUESTS) {
		super(ErrorType.TOO_MANY_REQUESTS, message);
	}
}

export class PayloadTooLarge extends ApiError {
	constructor(message: string = ReasonPhrases.REQUEST_TOO_LONG) {
		super(ErrorType.PAYLOAD_TOO_LARGE, message);
	}
}
