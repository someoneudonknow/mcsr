import { ObjectType } from "./configuration.type";

export const isObject = (value: any): value is ObjectType => {
    return value && typeof value === 'object' && !Array.isArray(value)
}

export const deepMerge = <T extends ObjectType, U extends ObjectType>(target: T, source: U): T & U => {
    const result: ObjectType = { ...target };

    for (const key in source) {
        const sourceVal = source[key];
        const targetVal = result[key];

        if (isObject(sourceVal) && isObject(targetVal)) {
            result[key] = deepMerge(targetVal, sourceVal);
        } else {
            result[key] = sourceVal;
        }
    }

    return result as T & U;
}
