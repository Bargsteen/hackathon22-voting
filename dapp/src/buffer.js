import {toBuffer} from "@concordium/web-sdk";
import moment from 'moment';

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

export function decodeVotingView(result) {
    const offset0 = 0;
    const buffer = toBuffer(result, 'hex');
    const [descriptionText, offset1] = decodeString(buffer, offset0);
    const [opts, offset2] = decodeStrings(buffer, offset1);
    const [tally, offset3] = decodeStringIntMap(buffer, offset2);
    const [voteCount, offset4] = [buffer.readUInt32LE(offset3), offset3 + 4];
    const endTimestamp = buffer.readBigUInt64LE(offset4);
    const endTime = moment(endTimestamp);
    return {
        descriptionText,
        opts,
        tally,
        voteCount,
        endTime,
    };
}