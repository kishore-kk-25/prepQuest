// The cartoon tutor: an original SVG character that blinks, bobs, waves,
// changes expression with its mood and moves its mouth while talking.
import { CONFIG } from '../config.js';
import { esc } from './dom.js';

const SVG = () => `
<svg class="coach" viewBox="0 0 240 270" role="img" aria-label="${esc(CONFIG.coach.name)}, your cartoon tutor">
  <defs><radialGradient id="coachBody" cx="38%" cy="28%" r="78%">
    <stop offset="0" stop-color="#c4f4da"/><stop offset=".55" stop-color="#5cc79a"/><stop offset="1" stop-color="#23805e"/>
  </radialGradient></defs>
  <ellipse cx="120" cy="258" rx="74" ry="9" fill="#000" opacity=".28"/>
  <g class="c-body">
    <line x1="120" y1="42" x2="120" y2="16" stroke="#1d5f48" stroke-width="5" stroke-linecap="round"/>
    <circle class="c-bulb" cx="120" cy="13" r="9" fill="#e6f5c8"/>
    <ellipse cx="88" cy="245" rx="23" ry="11" fill="#1f7556"/><ellipse cx="152" cy="245" rx="23" ry="11" fill="#1f7556"/>
    <path d="M46 150 Q18 172 30 204" stroke="#2a8a66" stroke-width="17" fill="none" stroke-linecap="round"/>
    <g class="c-arm"><path d="M194 152 Q226 142 230 110" stroke="#2a8a66" stroke-width="17" fill="none" stroke-linecap="round"/><circle cx="230" cy="104" r="11" fill="#5cc79a"/></g>
    <path d="M120 38C182 38 206 88 206 150C206 214 172 248 120 248C68 248 34 214 34 150C34 88 58 38 120 38Z" fill="url(#coachBody)"/>
    <path d="M70 70C84 52 104 46 120 46" stroke="#fff" stroke-width="5" stroke-linecap="round" fill="none" opacity=".5"/>
    <ellipse cx="120" cy="196" rx="54" ry="40" fill="#e6f8ee" opacity=".55"/>
    <path d="M108 176 L120 184 L132 176 L132 192 L120 184 L108 192Z" fill="#ff6f59"/>
    <circle cx="72" cy="150" r="11" fill="#ff6f59" opacity=".35"/><circle cx="168" cy="150" r="11" fill="#ff6f59" opacity=".35"/>
    <g class="c-eyes">
      <circle cx="92" cy="112" r="20" fill="#fff"/><circle cx="148" cy="112" r="20" fill="#fff"/>
      <g class="c-pupils"><circle cx="94" cy="115" r="9" fill="#0f1f1b"/><circle cx="150" cy="115" r="9" fill="#0f1f1b"/>
        <circle cx="97" cy="111" r="3" fill="#fff"/><circle cx="153" cy="111" r="3" fill="#fff"/></g>
    </g>
    <circle cx="92" cy="112" r="25" fill="none" stroke="#0f1f1b" stroke-width="4"/><circle cx="148" cy="112" r="25" fill="none" stroke="#0f1f1b" stroke-width="4"/>
    <path d="M117 110 Q120 106 123 110" stroke="#0f1f1b" stroke-width="4" fill="none"/>
    <path class="c-brows" stroke="#0f1f1b" stroke-width="5" fill="none" stroke-linecap="round"/>
    <path class="c-mouth" fill="#7a2a2a" stroke="#0f1f1b" stroke-width="3" stroke-linejoin="round"/>
  </g>
</svg>`;

const MOUTH = {
  happy: 'M100 148 Q120 166 140 148 Q120 158 100 148Z',
  think: 'M104 152 Q120 155 136 152 Q120 157 104 152Z',
  concern: 'M102 158 Q120 146 138 158 Q120 152 102 158Z',
};
const TALK = [
  'M102 148 Q120 146 138 148 Q132 170 120 172 Q108 170 102 148Z',
  'M106 150 Q120 148 134 150 Q128 162 120 163 Q112 162 106 150Z',
  'M110 151 Q120 150 130 151 Q125 157 120 158 Q115 157 110 151Z',
];
const BROWS = {
  happy: 'M76 84 Q92 74 106 82 M134 82 Q148 74 164 84',
  think: 'M76 86 Q92 82 106 86 M134 80 Q148 72 164 78',
  concern: 'M78 80 Q94 84 106 90 M134 90 Q146 84 162 80',
};
const PUPILS = { happy: 'none', think: 'translate(4px,-4px)', concern: 'translate(0,3px)' };

/** Create a coach. Returns { el, setMood(mood), talk(on) }. */
export function createCoach({ talking = false } = {}) {
  const wrap = document.createElement('div');
  wrap.innerHTML = SVG();
  const el = wrap.firstElementChild;
  const mouth = el.querySelector('.c-mouth');
  let mood = 'happy', timer = null;

  function setMood(m) {
    mood = MOUTH[m] ? m : 'happy';
    el.querySelector('.c-brows').setAttribute('d', BROWS[mood]);
    el.querySelector('.c-pupils').style.transform = PUPILS[mood];
    if (!timer) mouth.setAttribute('d', MOUTH[mood]);
  }
  function talk(on) {
    el.classList.toggle('talking', on);
    clearInterval(timer); timer = null;
    if (on) timer = setInterval(() => mouth.setAttribute('d', Math.random() < 0.18 ? MOUTH[mood] : TALK[Math.floor(Math.random() * 3)]), 120);
    else mouth.setAttribute('d', MOUTH[mood]);
  }
  setMood('happy');
  if (talking) el.classList.add('talking');
  return { el, setMood, talk };
}
