// Normalized [0, 1] = (inputvalue - min) / (max - min)
// Normalized [-1, 1]= ( (inputvalue - min) / (max - min) - 0.5 ) * 2

// Denormalized [0, 1] = normalizedValue * (max - min) + min
// Denormalized [-1, 1] = (normalizedValue / 2 + 0.5) * (max - min) + min

export function normalizeNegPos(inputvalue, min, max) {
    return ( (inputvalue - min) / (max - min) - 0.5 ) * 2;
}

export function deNormalizeNegPos(normalizedValue, min, max) {
    return (normalizedValue / 2 + 0.5) * (max - min) + min
}