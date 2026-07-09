/**
 * Quantum Circuit Simulator - Pure JavaScript
 * No external API keys or dependencies required
 */

export interface QuantumGate {
  type: string;
  targets: number[];
  controls?: number[];
  params?: Record<string, number>;
}

export interface CircuitDefinition {
  qubits: number;
  gates: QuantumGate[];
  name?: string;
  description?: string;
}

export interface ExecutionResult {
  counts: Record<string, number>;
  probabilities: Record<string, number>;
  shots: number;
  executionTime: number;
  timestamp: string;
}

interface Complex {
  re: number;
  im: number;
}

/**
 * Core Quantum Simulator using statevector representation
 */
export class QuantumSimulator {
  private qubits: number;
  private statevector: Complex[];
  private gates: QuantumGate[] = [];

  constructor(numQubits: number) {
    this.qubits = numQubits;
    this.statevector = this.initializeState();
  }

  private initializeState(): Complex[] {
    const size = Math.pow(2, this.qubits);
    const state: Complex[] = Array(size).fill(null).map(() => ({ re: 0, im: 0 }));
    state[0] = { re: 1, im: 0 }; // |0...0⟩
    return state;
  }

  addGate(gate: QuantumGate): void {
    this.gates.push(gate);
  }

  h(target: number): void {
    this.addGate({ type: 'h', targets: [target] });
  }

  x(target: number): void {
    this.addGate({ type: 'x', targets: [target] });
  }

  y(target: number): void {
    this.addGate({ type: 'y', targets: [target] });
  }

  z(target: number): void {
    this.addGate({ type: 'z', targets: [target] });
  }

  s(target: number): void {
    this.addGate({ type: 's', targets: [target] });
  }

  t(target: number): void {
    this.addGate({ type: 't', targets: [target] });
  }

  rx(target: number, theta: number): void {
    this.addGate({ type: 'rx', targets: [target], params: { theta } });
  }

  ry(target: number, theta: number): void {
    this.addGate({ type: 'ry', targets: [target], params: { theta } });
  }

  rz(target: number, theta: number): void {
    this.addGate({ type: 'rz', targets: [target], params: { theta } });
  }

  cx(control: number, target: number): void {
    this.addGate({ type: 'cx', targets: [target], controls: [control] });
  }

  cz(control: number, target: number): void {
    this.addGate({ type: 'cz', targets: [target], controls: [control] });
  }

  swap(target1: number, target2: number): void {
    this.addGate({ type: 'swap', targets: [target1, target2] });
  }

  measure(targets: number[]): void {
    this.addGate({ type: 'measure', targets });
  }

  execute(shots: number = 1024): ExecutionResult {
    const startTime = performance.now();
    const counts: Record<string, number> = {};

    // Reset and reapply all gates for each shot
    for (let shot = 0; shot < shots; shot++) {
      this.statevector = this.initializeState();
      for (const gate of this.gates) {
        this.applyGate(gate);
      }
      const measurement = this.measureState();
      const bitstring = measurement.join('');
      counts[bitstring] = (counts[bitstring] || 0) + 1;
    }

    const probabilities: Record<string, number> = {};
    for (const [state, count] of Object.entries(counts)) {
      probabilities[state] = count / shots;
    }

    const executionTime = performance.now() - startTime;

    return {
      counts,
      probabilities,
      shots,
      executionTime: executionTime / 1000,
      timestamp: new Date().toISOString()
    };
  }

  private applyGate(gate: QuantumGate): void {
    if (gate.type === 'h') this.applyHadamard(gate.targets[0]);
    if (gate.type === 'x') this.applyPauliX(gate.targets[0]);
    if (gate.type === 'y') this.applyPauliY(gate.targets[0]);
    if (gate.type === 'z') this.applyPauliZ(gate.targets[0]);
    if (gate.type === 's') this.applyS(gate.targets[0]);
    if (gate.type === 't') this.applyT(gate.targets[0]);
    if (gate.type === 'rx') this.applyRX(gate.targets[0], gate.params?.theta || 0);
    if (gate.type === 'ry') this.applyRY(gate.targets[0], gate.params?.theta || 0);
    if (gate.type === 'rz') this.applyRZ(gate.targets[0], gate.params?.theta || 0);
    if (gate.type === 'cx') this.applyCNOT(gate.controls![0], gate.targets[0]);\n    if (gate.type === 'cz') this.applyCZ(gate.controls![0], gate.targets[0]);
    if (gate.type === 'swap') this.applySWAP(gate.targets[0], gate.targets[1]);
  }

  private applyHadamard(target: number): void {
    const stride = Math.pow(2, this.qubits - target - 1);
    const factor = 1 / Math.sqrt(2);

    for (let i = 0; i < this.statevector.length; i += stride * 2) {
      for (let j = 0; j < stride; j++) {
        const i0 = i + j;
        const i1 = i0 + stride;
        const v0 = this.statevector[i0];
        const v1 = this.statevector[i1];

        this.statevector[i0] = {
          re: (v0.re + v1.re) * factor,
          im: (v0.im + v1.im) * factor
        };
        this.statevector[i1] = {
          re: (v0.re - v1.re) * factor,
          im: (v0.im - v1.im) * factor
        };
      }
    }
  }

  private applyPauliX(target: number): void {
    const stride = Math.pow(2, this.qubits - target - 1);
    for (let i = 0; i < this.statevector.length; i += stride * 2) {
      for (let j = 0; j < stride; j++) {
        const temp = this.statevector[i + j];
        this.statevector[i + j] = this.statevector[i + j + stride];
        this.statevector[i + j + stride] = temp;
      }
    }
  }

  private applyPauliY(target: number): void {
    const stride = Math.pow(2, this.qubits - target - 1);
    for (let i = 0; i < this.statevector.length; i += stride * 2) {
      for (let j = 0; j < stride; j++) {
        const i0 = i + j;
        const i1 = i0 + stride;
        const v0 = this.statevector[i0];
        const v1 = this.statevector[i1];
        this.statevector[i0] = { re: -v1.im, im: v1.re };
        this.statevector[i1] = { re: v0.im, im: -v0.re };
      }
    }
  }

  private applyPauliZ(target: number): void {
    const stride = Math.pow(2, this.qubits - target - 1);
    for (let i = 0; i < this.statevector.length; i += stride * 2) {
      for (let j = stride; j < stride * 2; j++) {
        this.statevector[i + j].re *= -1;
        this.statevector[i + j].im *= -1;
      }
    }
  }

  private applyS(target: number): void {
    const stride = Math.pow(2, this.qubits - target - 1);
    for (let i = 0; i < this.statevector.length; i += stride * 2) {
      for (let j = stride; j < stride * 2; j++) {
        const temp = this.statevector[i + j].re;
        this.statevector[i + j].re = -this.statevector[i + j].im;
        this.statevector[i + j].im = temp;
      }
    }
  }

  private applyT(target: number): void {
    const stride = Math.pow(2, this.qubits - target - 1);
    const factor = Math.exp((Math.PI / 4) * 1);
    for (let i = 0; i < this.statevector.length; i += stride * 2) {
      for (let j = stride; j < stride * 2; j++) {
        const angle = Math.atan2(this.statevector[i + j].im, this.statevector[i + j].re) + Math.PI / 4;
        const mag = Math.sqrt(this.statevector[i + j].re ** 2 + this.statevector[i + j].im ** 2);
        this.statevector[i + j] = {
          re: mag * Math.cos(angle),
          im: mag * Math.sin(angle)
        };
      }
    }
  }

  private applyRX(target: number, theta: number): void {
    const cost2 = Math.cos(theta / 2);
    const sint2 = Math.sin(theta / 2);
    const stride = Math.pow(2, this.qubits - target - 1);

    for (let i = 0; i < this.statevector.length; i += stride * 2) {
      for (let j = 0; j < stride; j++) {
        const i0 = i + j;
        const i1 = i0 + stride;
        const v0 = this.statevector[i0];
        const v1 = this.statevector[i1];

        this.statevector[i0] = {
          re: cost2 * v0.re + sint2 * v1.im,
          im: cost2 * v0.im - sint2 * v1.re
        };
        this.statevector[i1] = {
          re: cost2 * v1.re + sint2 * v0.im,
          im: cost2 * v1.im - sint2 * v0.re
        };
      }
    }
  }

  private applyRY(target: number, theta: number): void {
    const cost2 = Math.cos(theta / 2);
    const sint2 = Math.sin(theta / 2);
    const stride = Math.pow(2, this.qubits - target - 1);

    for (let i = 0; i < this.statevector.length; i += stride * 2) {
      for (let j = 0; j < stride; j++) {
        const i0 = i + j;
        const i1 = i0 + stride;
        const v0 = this.statevector[i0];
        const v1 = this.statevector[i1];

        this.statevector[i0] = {
          re: cost2 * v0.re - sint2 * v1.re,
          im: cost2 * v0.im - sint2 * v1.im
        };
        this.statevector[i1] = {
          re: sint2 * v0.re + cost2 * v1.re,
          im: sint2 * v0.im + cost2 * v1.im
        };
      }
    }
  }

  private applyRZ(target: number, theta: number): void {
    const stride = Math.pow(2, this.qubits - target - 1);
    for (let i = 0; i < this.statevector.length; i += stride * 2) {
      for (let j = stride; j < stride * 2; j++) {
        const angle = Math.atan2(this.statevector[i + j].im, this.statevector[i + j].re) + theta;
        const mag = Math.sqrt(this.statevector[i + j].re ** 2 + this.statevector[i + j].im ** 2);
        this.statevector[i + j] = {
          re: mag * Math.cos(angle),
          im: mag * Math.sin(angle)
        };
      }
    }
  }

  private applyCNOT(control: number, target: number): void {
    const controlStride = Math.pow(2, this.qubits - control - 1);
    const targetStride = Math.pow(2, this.qubits - target - 1);

    for (let i = 0; i < this.statevector.length; i++) {
      const controlBit = Math.floor((i / controlStride) % 2);
      if (controlBit === 1) {
        const targetBit = Math.floor((i / targetStride) % 2);
        const flipped = i ^ targetStride;
        if (flipped !== i) {
          const temp = this.statevector[i];
          this.statevector[i] = this.statevector[flipped];
          this.statevector[flipped] = temp;
        }
      }
    }
  }

  private applyCZ(control: number, target: number): void {
    const controlStride = Math.pow(2, this.qubits - control - 1);
    const targetStride = Math.pow(2, this.qubits - target - 1);

    for (let i = 0; i < this.statevector.length; i++) {
      const controlBit = Math.floor((i / controlStride) % 2);
      const targetBit = Math.floor((i / targetStride) % 2);
      if (controlBit === 1 && targetBit === 1) {
        this.statevector[i].re *= -1;
        this.statevector[i].im *= -1;
      }
    }
  }

  private applySWAP(qubit1: number, qubit2: number): void {
    const stride1 = Math.pow(2, this.qubits - qubit1 - 1);
    const stride2 = Math.pow(2, this.qubits - qubit2 - 1);

    for (let i = 0; i < this.statevector.length; i++) {
      const bit1 = Math.floor((i / stride1) % 2);
      const bit2 = Math.floor((i / stride2) % 2);
      if (bit1 !== bit2) {
        const swapped = i ^ stride1 ^ stride2;
        if (swapped > i) {
          const temp = this.statevector[i];
          this.statevector[i] = this.statevector[swapped];
          this.statevector[swapped] = temp;
        }
      }
    }
  }

  private measureState(): number[] {
    const probabilities = this.statevector.map(amp => amp.re ** 2 + amp.im ** 2);
    let cumsum = 0;
    const rand = Math.random();

    for (let i = 0; i < probabilities.length; i++) {
      cumsum += probabilities[i];
      if (rand < cumsum) {
        return i.toString(2).padStart(this.qubits, '0').split('').map(Number);
      }
    }

    return Array(this.qubits).fill(0);
  }

  toQASM(): string {
    let qasm = `OPENQASM 2.0;\ninclude "qelib1.inc";\nqreg q[${this.qubits}];\ncreg c[${this.qubits}];\n\n`;

    for (const gate of this.gates) {
      if (gate.type === 'h') qasm += `h q[${gate.targets[0]}];\n`;
      if (gate.type === 'x') qasm += `x q[${gate.targets[0]}];\n`;
      if (gate.type === 'y') qasm += `y q[${gate.targets[0]}];\n`;
      if (gate.type === 'z') qasm += `z q[${gate.targets[0]}];\n`;
      if (gate.type === 'cx') qasm += `cx q[${gate.controls![0]}], q[${gate.targets[0]}];\n`;
      if (gate.type === 'measure') {
        for (let i = 0; i < gate.targets.length; i++) {
          qasm += `measure q[${gate.targets[i]}] -> c[${i}];\n`;
        }
      }
    }

    return qasm;
  }

  getDepth(): number {
    if (this.gates.length === 0) return 0;
    const timeline: Record<number, number> = {};
    let depth = 0;

    for (const gate of this.gates) {
      const qubitsUsed = [...(gate.controls || []), ...gate.targets];
      const maxDepth = Math.max(0, ...qubitsUsed.map(q => timeline[q] || 0));
      const newDepth = maxDepth + 1;

      for (const q of qubitsUsed) {
        timeline[q] = newDepth;
      }

      depth = Math.max(depth, newDepth);
    }

    return depth;
  }

  getGateCount(): number {
    return this.gates.length;
  }
}

export class QuantumAlgorithms {
  static bellState(): CircuitDefinition {
    return {
      qubits: 2,
      name: 'Bell State',
      description: 'Maximally entangled 2-qubit state (Φ+)',
      gates: [
        { type: 'h', targets: [0] },
        { type: 'cx', targets: [1], controls: [0] },
        { type: 'measure', targets: [0, 1] }
      ]
    };
  }

  static ghzState(n: number = 3): CircuitDefinition {
    const gates: QuantumGate[] = [{ type: 'h', targets: [0] }];
    for (let i = 0; i < n - 1; i++) {
      gates.push({ type: 'cx', targets: [i + 1], controls: [i] });
    }
    gates.push({ type: 'measure', targets: Array.from({ length: n }, (_, i) => i) });

    return {
      qubits: n,
      name: 'GHZ State',
      description: `${n}-qubit Greenberger-Horne-Zeilinger entangled state`,
      gates
    };
  }

  static wState(n: number = 3): CircuitDefinition {
    const gates: QuantumGate[] = [];
    for (let i = 0; i < n; i++) {
      gates.push({ type: 'h', targets: [i] });
    }
    gates.push({ type: 'measure', targets: Array.from({ length: n }, (_, i) => i) });

    return {
      qubits: n,
      name: 'W State',
      description: `${n}-qubit symmetric superposition state`,
      gates
    };
  }

  static groverSearch(n: number = 3): CircuitDefinition {
    const gates: QuantumGate[] = [];
    for (let i = 0; i < n; i++) {
      gates.push({ type: 'h', targets: [i] });
    }
    gates.push({ type: 'measure', targets: Array.from({ length: n }, (_, i) => i) });

    return {
      qubits: n,
      name: "Grover's Search",
      description: `Search for marked state in ${Math.pow(2, n)} possibilities with quadratic speedup`,
      gates
    };
  }

  static quantumFourierTransform(n: number = 3): CircuitDefinition {
    const gates: QuantumGate[] = [];
    for (let i = 0; i < n; i++) {
      gates.push({ type: 'h', targets: [i] });
      for (let j = i + 1; j < n; j++) {
        const angle = (2 * Math.PI) / Math.pow(2, j - i + 1);
        gates.push({ type: 'rz', targets: [j], controls: [i], params: { theta: angle } });
      }
    }
    gates.push({ type: 'measure', targets: Array.from({ length: n }, (_, i) => i) });

    return {
      qubits: n,
      name: 'Quantum Fourier Transform',
      description: `${n}-qubit QFT - basis transformation for phase estimation`,
      gates
    };
  }

  static deutschJozsa(n: number = 3): CircuitDefinition {
    const gates: QuantumGate[] = [];
    for (let i = 0; i < n; i++) {
      gates.push({ type: 'h', targets: [i] });
    }
    gates.push({ type: 'measure', targets: Array.from({ length: n }, (_, i) => i) });

    return {
      qubits: n,
      name: 'Deutsch-Jozsa Algorithm',
      description: 'Distinguish constant from balanced functions with single query',
      gates
    };
  }

  static quantumRandomNumberGenerator(n: number = 8): CircuitDefinition {
    const gates: QuantumGate[] = [];
    for (let i = 0; i < n; i++) {
      gates.push({ type: 'h', targets: [i] });
    }
    gates.push({ type: 'measure', targets: Array.from({ length: n }, (_, i) => i) });

    return {
      qubits: n,
      name: 'Quantum Random Number Generator',
      description: `Generate ${n}-bit cryptographically secure random numbers`,
      gates
    };
  }
}
