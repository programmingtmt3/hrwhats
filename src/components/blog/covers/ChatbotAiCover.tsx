import type { CSSProperties } from "react";

import { cn } from "@/lib/utils";

import styles from "./ChatbotAiCover.module.css";
import { CoverSvg } from "./CoverSvg";

const BRANCHES = [90, 215, 340];
/** The leaves of each branch; the middle branch's second leaf is the chosen answer. */
const LEAVES = [
  [52, 128],
  [177, 253],
  [302, 378],
];

/** v1: a decision tree branching out of one node, with one route lit. */
function DecisionTree() {
  return (
    <>
      <g className={styles.links}>
        {BRANCHES.map((y) => (
          <path key={y} d={`M820 215H760V${y}H700`} />
        ))}
        {BRANCHES.flatMap((y, i) => LEAVES[i].map((leaf) => <path key={leaf} d={`M580 ${y}H480V${leaf}H395`} />))}
      </g>
      <path className={styles.route} d="M820 215H700M580 215H480V253H395" pathLength={100} />

      <rect className={styles.root} x="820" y="161" width="120" height="108" rx="30" />
      <circle className={styles.rootEye} cx="858" cy="208" r="9" />
      <circle className={styles.rootEye} cx="902" cy="208" r="9" />
      <path className={styles.rootMouth} d="M858 236h44" />

      {BRANCHES.map((y) => (
        <rect key={y} className={cn(styles.branch, y === 215 && styles.branchOn)} x="580" y={y - 30} width="120" height="60" rx="18" />
      ))}
      {LEAVES.flat().map((y) => (
        <rect key={y} className={cn(styles.leaf, y === 253 && styles.leafOn)} x="255" y={y - 22} width="140" height="44" rx="22" />
      ))}
      <path className={styles.leafCheck} d="M308 253l12 12 24-26" />
    </>
  );
}

/* A = antenna, E = eyes, M = mouth, # = head outline, o = head fill. */
const ROBOT = [
  "........A........",
  "........#........",
  "...###########...",
  "..#ooooooooooo#..",
  "#.#oEEEoooEEEo#.#",
  "#.#oEEEoooEEEo#.#",
  "#.#oEEEoooEEEo#.#",
  "..#ooooooooooo#..",
  "..#ooMMMMMMMoo#..",
  "..#ooooooooooo#..",
  "...###########...",
];
const DOT_GAP = 30;
const ROBOT_X = 600 - ((ROBOT[0].length - 1) * DOT_GAP) / 2;
const ROBOT_Y = 215 - ((ROBOT.length - 1) * DOT_GAP) / 2;
const DOT_CLASS: Record<string, string> = {
  "#": styles.dotHead,
  o: styles.dotFill,
  A: styles.dotEye,
  M: styles.dotMouth,
};

/** v2: a robot face made of a dot matrix, on a faint matrix field. */
function RobotFace() {
  return (
    <>
      <defs>
        <pattern id="cover-robot-field" width={DOT_GAP} height={DOT_GAP} patternUnits="userSpaceOnUse">
          <circle cx={DOT_GAP / 2} cy={DOT_GAP / 2} r="3" className={styles.dotField} />
        </pattern>
      </defs>
      <rect width="1200" height="430" fill="url(#cover-robot-field)" />
      {ROBOT.map((row, y) => (
        <g key={y} className={styles.dotRow} style={{ "--i": y } as CSSProperties}>
          {[...row].map((cell, x) =>
            cell === "." || cell === "E" ? null : (
              <circle key={x} className={DOT_CLASS[cell]} cx={ROBOT_X + x * DOT_GAP} cy={ROBOT_Y + y * DOT_GAP} r="11" />
            ),
          )}
        </g>
      ))}
      <g className={styles.eyes}>
        {ROBOT.flatMap((row, y) =>
          [...row].map((cell, x) =>
            cell === "E" ? (
              <circle key={`${x}-${y}`} className={styles.dotEye} cx={ROBOT_X + x * DOT_GAP} cy={ROBOT_Y + y * DOT_GAP} r="12" />
            ) : null,
          ),
        )}
      </g>
    </>
  );
}

const GEAR_TEETH = Array.from({ length: 8 }, (_, i) => i * 45);

/** v3: an automation loop: tasks travel a track around a turning gear. */
function AutomationLoop() {
  return (
    <>
      <path className={styles.track} d="M470 85H730A130 130 0 0 1 730 345H470A130 130 0 0 1 470 85Z" />
      {[
        [822, 123, 45],
        [822, 307, 135],
        [378, 307, 225],
        [378, 123, 315],
      ].map(([x, y, degrees]) => (
        <path key={degrees} className={styles.trackArrow} d="M-9-13 7 0-9 13" transform={`translate(${x} ${y}) rotate(${degrees})`} />
      ))}

      <g className={styles.gear}>
        {GEAR_TEETH.map((degrees) => (
          <rect key={degrees} x="581" y="134" width="38" height="44" rx="8" transform={`rotate(${degrees} 600 215)`} />
        ))}
        <circle cx="600" cy="215" r="62" />
        <circle className={styles.gearHole} cx="600" cy="215" r="24" />
      </g>

      {[12, 37, 62, 87].map((place, i) => (
        <g key={place} className={styles.task} style={{ "--p": `${place}%` } as CSSProperties}>
          <rect x="-78" y="-30" width="156" height="60" rx="18" />
          <line x1="-54" y1="0" x2="16" y2="0" />
          <circle className={i === 3 ? styles.taskPending : undefined} cx="48" cy="0" r="17" />
          {i !== 3 && <path d="M40 0l6 7 11-13" />}
        </g>
      ))}
    </>
  );
}

/** "Chatbot and AI" cover. Decorative, no text. */
export function ChatbotAiCover({ variant, animated }: { variant: number; animated: boolean }) {
  return (
    <CoverSvg className={cn(animated && styles.animated)}>
      {variant === 2 ? <RobotFace /> : variant === 3 ? <AutomationLoop /> : <DecisionTree />}
    </CoverSvg>
  );
}
