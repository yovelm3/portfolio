/*
 * Mannequin geometry (moved from prototype v0.2).
 * Turns body measurements into SVG paths in a 300×430 viewBox.
 * Widths follow the measurements (bust, waist, hips), heights follow height and inside leg,
 * so the mannequin changes shape live as the user edits her numbers.
 */
import type { Body } from "../engine";

type Pt = [number, number];

/** Smooth closed outline through the points (quadratic curves between mid-points). */
export function smooth(pts: Pt[]): string {
  let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const [x, y] = pts[i];
    const [nx, ny] = pts[i + 1];
    d += ` Q${x.toFixed(1)},${y.toFixed(1)} ${((x + nx) / 2).toFixed(1)},${((y + ny) / 2).toFixed(1)}`;
  }
  const l = pts[pts.length - 1];
  return `${d} L${l[0].toFixed(1)},${l[1].toFixed(1)} Z`;
}

export interface Arm {
  d: string;
  hand: { x: number; y: number };
  yWrist: number;
}

export interface Geometry {
  H: number; // figure height in viewBox units
  u: number; // scale unit
  cx: number; // centre line
  yNeck: number; ySh: number; yArm: number; yBust: number; yUb: number; yWaist: number; yHip: number; yAnkle: number; yCrotch: number;
  neckW: number; shW: number; armW: number; bustW: number; ubW: number; waistW: number; hipW: number;
  torso: string;
  legs: string[];
  feet: { x: number; y: number; rx: number; ry: number }[];
  arms: Arm[];
  head: { x: number; y: number; rx: number; ry: number };
}

export function geometry(m: Body): Geometry {
  const H = (m.height / 190) * 395;
  const top = 415 - H;
  const u = H / 390;
  const cx = 120;
  const Y = (f: number) => top + f * H;
  const w = (c: number) => c * 0.37 * u; // circumference → half-width

  const yNeck = Y(0.155), ySh = Y(0.18), yArm = Y(0.225), yBust = Y(0.275), yUb = Y(0.315);
  const yWaist = Y(0.385), yHip = Y(0.48), yAnkle = Y(0.955);
  const yCrotch = Math.min(Y(0.6), Math.max(Y(0.47), yAnkle - (m.inseam / m.height) * H * 0.97));

  const neckW = 6 * u, shW = m.bust * 0.43 * u, armW = m.bust * 0.355 * u;
  const bustW = w(m.bust), ubW = w(m.underbust), waistW = w(m.waist), hipW = w(m.hips);

  const right: Pt[] = [
    [cx + neckW, yNeck], [cx + shW, ySh], [cx + armW, yArm], [cx + bustW, yBust], [cx + ubW, yUb],
    [cx + waistW, yWaist], [cx + hipW, yHip], [cx + hipW * 0.93, yCrotch],
  ];
  const torso = smooth([...right, [cx, yCrotch + 4 * u], ...right.map(([x, y]): Pt => [2 * cx - x, y]).reverse()]);

  const yK = yCrotch + (yAnkle - yCrotch) * 0.47; // knee
  const yC = yK + (yAnkle - yK) * 0.3; // calf
  const hw = hipW;
  const legs = [1, -1].map((s) =>
    smooth([
      [cx + s * hw, yHip - 0.02 * H], [cx + s * hw * 0.95, yCrotch], [cx + s * hw * 0.62, yK], [cx + s * hw * 0.6, yC],
      [cx + s * hw * 0.42, yAnkle], [cx + s * hw * 0.2, yAnkle], [cx + s * hw * 0.16, yC], [cx + s * hw * 0.18, yK],
      [cx + s * 2 * u, yCrotch], [cx, yHip],
    ]),
  );
  const feet = [1, -1].map((s) => ({ x: cx + s * hw * 0.33, y: yAnkle + 0.018 * H, rx: hw * 0.2, ry: 0.017 * H }));

  const yW = Y(0.5);
  const arms = [1, -1].map((s): Arm => {
    const x0 = cx + s * (shW - 3 * u);
    const xw = cx + s * (Math.max(hw, bustW) + 9 * u);
    const xe = (x0 + xw) / 2;
    const ye = (ySh + yW) / 2;
    return {
      d: smooth([
        [x0 + s * 6 * u, ySh], [xe + s * 4.5 * u, ye], [xw + s * 3 * u, yW], [xw - s * 3 * u, yW],
        [xe - s * 4.5 * u, ye], [x0 - s * 6 * u, ySh + 0.035 * H],
      ]),
      hand: { x: xw, y: yW + 0.022 * H },
      yWrist: yW,
    };
  });
  const head = { x: cx, y: Y(0.068), rx: 0.046 * H, ry: 0.06 * H };

  return {
    H, u, cx, yNeck, ySh, yArm, yBust, yUb, yWaist, yHip, yAnkle, yCrotch,
    neckW, shW, armW, bustW, ubW, waistW, hipW, torso, legs, feet, arms, head,
  };
}

/** Tiny body-shape icon outline for the Quick path (46×76 viewBox). */
export function shapeIconPath(a: { bust: number; waist: number; hips: number }): string {
  const cx = 23, bw = 10 + a.bust, ww = 7 + a.waist * 0.8, hw = 10 + a.hips;
  const pts: Pt[] = [[cx + 4, 6], [cx + bw + 2, 12], [cx + bw, 26], [cx + ww, 40], [cx + hw, 54], [cx + hw - 2, 70], [cx, 72]];
  return smooth([...pts, ...pts.slice(0, -1).map(([x, y]): Pt => [46 - x, y]).reverse()]);
}
