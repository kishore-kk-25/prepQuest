// All subject-based tests. To add a subject, create a file like dsa.js
// and add it to this list. See docs/ADDING_QUESTIONS.md.
import aptitude from './aptitude.js';
import dsa from './dsa.js';
import dbms from './dbms.js';
import os from './os.js';
import networks from './networks.js';
import oop from './oop.js';
import javascript from './javascript.js';

export const SUBJECTS = [aptitude, dsa, dbms, os, networks, oop, javascript];

export const getSubject = (id) => SUBJECTS.find((s) => s.id === id);
