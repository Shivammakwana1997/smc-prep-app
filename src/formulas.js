export const formulas = [
  // Basic Electrical
  { id: 1, name: "Ohm's Law", equation: "V = I × R", description: "Voltage = Current × Resistance", topic: "Basic Electrical", category: "Law" },
  { id: 2, name: "Power (DC)", equation: "P = V × I = I²R = V²/R", description: "Power in DC circuits", topic: "Basic Electrical", category: "Power" },
  { id: 3, name: "Kirchhoff's Current Law", equation: "∑I = 0", description: "Sum of currents at a node = 0", topic: "Basic Electrical", category: "Law" },
  { id: 4, name: "Kirchhoff's Voltage Law", equation: "∑V = 0", description: "Sum of voltages in a closed loop = 0", topic: "Basic Electrical", category: "Law" },
  { id: 5, name: "Time Constant (RC)", equation: "τ = R × C", description: "Time constant = Resistance × Capacitance", topic: "Basic Electrical", category: "Time Constant" },
  { id: 6, name: "Time Constant (RL)", equation: "τ = L / R", description: "Time constant = Inductance / Resistance", topic: "Basic Electrical", category: "Time Constant" },
  { id: 7, name: "Resonance Frequency", equation: "f = 1 / (2π√(LC))", description: "Resonant frequency of LC circuit", topic: "Basic Electrical", category: "Resonance" },
  { id: 8, name: "Quality Factor (Q)", equation: "Q = (1/R) × √(L/C)", description: "Quality factor for series RLC", topic: "Basic Electrical", category: "Resonance" },
  { id: 9, name: "Maximum Power Transfer", equation: "RL = Rsource", description: "Load resistance = Source resistance for max power", topic: "Basic Electrical", category: "Transfer" },
  // Electrical Machines
  { id: 10, name: "Transformer EMF", equation: "E = 4.44 × f × N × Φm", description: "Transformer EMF equation", topic: "Electrical Machines", category: "Transformer" },
  { id: 11, name: "Synchronous Speed", equation: "Ns = 120 × f / P", description: "Synchronous speed in RPM", topic: "Electrical Machines", category: "Speed" },
  { id: 12, name: "Slip", equation: "S = (Ns - N) / Ns", description: "Slip of induction motor", topic: "Electrical Machines", category: "Speed" },
  { id: 13, name: "Rotor Speed", equation: "N = Ns × (1 - S)", description: "Rotor speed from synchronous speed and slip", topic: "Electrical Machines", category: "Speed" },
  { id: 14, name: "Transformer Efficiency", equation: "η = Output / (Output + Losses)", description: "Efficiency of transformer", topic: "Electrical Machines", category: "Transformer" },
  { id: 15, name: "Voltage Regulation", equation: "VR = (Vno-load - Vfull-load) / Vfull-load × 100%", description: "Percentage voltage regulation", topic: "Electrical Machines", category: "Transformer" },
  // Power Systems
  { id: 16, name: "Surge Impedance", equation: "Zc = √(L/C)", description: "Surge impedance of transmission line", topic: "Power Systems", category: "Transmission" },
  { id: 17, name: "Ferranti Effect", equation: "ΔV = (|IL - IC| / |V|) × 100%", description: "Voltage rise at receiving end (conceptual)", topic: "Power Systems", category: "Transmission" },
  { id: 18, name: "ABCD Parameters", equation: "[V1; I1] = [A B; C D][V2; -I2]", description: "Two-port network parameters", topic: "Power Systems", category: "Transmission" },
  { id: 19, name: "Per Unit (p.u.)", equation: "p.u. = Actual / Base", description: "Per unit system for simplification", topic: "Power Systems", category: "Calculation" },
  { id: 20, name: "Line Current (3-phase)", equation: "IL = √3 × Iph", description: "Line current from phase current (delta)", topic: "Power Systems", category: "3-Phase" },
  // Control Systems
  { id: 21, name: "Transfer Function", equation: "G(s) = C(s) / R(s)", description: "Ratio of output to input in Laplace domain", topic: "Control Systems", category: "Basics" },
  { id: 22, name: "PID Output", equation: "u(t) = Kpe(t) + Ki∫e(t)dt + Kd(de/dt)", description: "PID controller output", topic: "Control Systems", category: "Controller" },
  { id: 23, name: "Routh Stability", equation: "First column all positive → stable", description: "Routh-Hurwitz stability criterion", topic: "Control Systems", category: "Stability" },
  { id: 24, name: "Bandwidth", equation: "BW = 2π / tr", description: "Bandwidth inversely proportional to rise time", topic: "Control Systems", category: "Frequency" },
  // Switchgear
  { id: 25, name: "Surge Arrester MCOV", equation: "MCOV = Rated Voltage / √3", description: "Maximum continuous operating voltage", topic: "Switchgear", category: "Protection" },
  { id: 26, name: "Lightning Arrester", equation: "Installed between line and ground", description: "Protects against overvoltage", topic: "Switchgear", category: "Protection" },
  // Measurements
  { id: 27, name: "Wattmeter", equation: "P = VI cos(θ)", description: "Active power measurement", topic: "Measurements", category: "Instruments" },
  // Energy & Laws
  { id: 28, name: "Indian Electricity Act", equation: "Passed in 2003", description: "Replaced earlier Act of 1910", topic: "Energy & Laws", category: "Law" },
  { id: 29, name: "Net Metering", equation: "Import - Export = Bill", description: "Grid-connected solar billing", topic: "Energy & Laws", category: "Solar" },
  { id: 30, name: "Energy Conservation", equation: "Reduce energy for same output", description: "Core principle of energy conservation", topic: "Energy & Laws", category: "Conservation" }
];
