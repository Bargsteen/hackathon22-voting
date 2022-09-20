
export function decodeString(buffer, offset) {
    const length = buffer.readUInt32LE(offset);
    offset += 4;
    return [buffer.slice(offset, offset + length).toString('utf8'), offset+length];
}

export function decodeStrings(buffer, offset) {
    const length = buffer.readUInt32LE(offset);
    offset += 4;
    const res = [];
    for (let i = 0; i < length; i++) {
        const [str, newOffset] = decodeString(buffer, offset);
        offset = newOffset;
        res.push(str);
    }
    return [res, offset];
}

export function decodeStringIntMap(buffer, offset) {
    const length = buffer.readUInt32LE(offset);
    offset += 4;
    const res = {};
    for (let i = 0; i < length; i++) {
        const [key, newOffset1] = decodeString(buffer, offset);
        const [val, newOffset2] = [buffer.readUInt32LE(newOffset1), newOffset1+4];
        offset = newOffset2;
        res[key] = val;
    }
    return [res, offset];

}
