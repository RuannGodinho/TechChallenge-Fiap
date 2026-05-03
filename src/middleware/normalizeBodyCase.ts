import { Request, Response, NextFunction } from "express";
import { camelCase, isPlainObject } from "lodash";

function convertKeys(obj: any): any {
    if (Array.isArray(obj)) {
        return obj.map(convertKeys);
    }

    if (isPlainObject(obj)) {
        return Object.keys(obj).reduce((result: any, key) => {
            result[camelCase(key)] = convertKeys(obj[key]);
            return result;
        }, {});
    }

    return obj;
}

export function normalizeBodyCase(
    req: Request,
    res: Response,
    next: NextFunction
) {
    if (req.body) {
        req.body = convertKeys(req.body);
    }

    next();
}