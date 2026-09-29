import 'dotenv/config';
import { getAuthUrl } from '../src/gmail.js';
console.log('Open this URL in your browser:');
console.log(getAuthUrl());
