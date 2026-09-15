import { appendFileSync, readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
const path = 'docs/session/events.jsonl';
const previous = existsSync(path) ? readFileSync(path, 'utf8').trim().split('\n').at(-1) : '';
const entry = { recordedAt: new Date().toISOString(), type: process.argv[2], text: readFileSync(0, 'utf8'), previousHash: createHash('sha256').update(previous).digest('hex') };
appendFileSync(path, JSON.stringify(entry) + '\n');
