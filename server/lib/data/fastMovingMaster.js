// // Fast Moving Materials Master Data (Refactored)
// // Grouped by Material Type / Part Number
// // This structure aligns with Warehouse logic vs Engine logic.

// export const materialMasterData = [
//     {
//         id: "LO-001",
//         name: "Lube Oil",
//         partNumber: "Pertamina Meditran S SAE 40",
//         unit: "Liter",
//         stock: 2090, // Initial Stock in Warehouse
//         leadTime: 30, // Days
//         usage: [
//             { engine: "SWD 6FHD 240", unitIds: [1], qtyPerPm: 209, intervalPm: 1000 },
//             { engine: "Deutz TBD 616 V12", unitIds: [4, 5], qtyPerPm: 70, intervalPm: 500 }
//         ]
//     },
//     {
//         id: "LO-002",
//         name: "Lube Oil",
//         partNumber: "Pertamina Meditran SX SAE 15W-40",
//         unit: "Liter",
//         stock: 5434,
//         leadTime: 30,
//         usage: [
//             { engine: "Mitsubishi S16R PTA-S", unitIds: [6, 7], qtyPerPm: 320, intervalPm: 1000 },
//             { engine: "Cummins KTA50-G8", unitIds: [8, 9], qtyPerPm: 180, intervalPm: 500 }
//         ]
//     },
//     {
//         id: "LOF-SWD",
//         name: "Lube Oil Filter",
//         partNumber: "SWD-LO-001",
//         unit: "Buah",
//         stock: 36,
//         leadTime: 30,
//         usage: [
//             { engine: "SWD 6FHD 240", unitIds: [1], qtyPerPm: 4, intervalPm: 1000 }
//         ]
//     },
//     {
//         id: "FF-SWD",
//         name: "Fuel Filter",
//         partNumber: "SWD-FF-002",
//         unit: "Buah",
//         stock: 49,
//         leadTime: 30,
//         usage: [
//             { engine: "SWD 6FHD 240", unitIds: [1], qtyPerPm: 2, intervalPm: 500 }
//         ]
//     },
//     {
//         id: "LOF-DEUTZ",
//         name: "Lube Oil Filter",
//         partNumber: "0118-2001",
//         unit: "Buah",
//         stock: 24,
//         leadTime: 30,
//         usage: [
//             { engine: "Deutz TBD 616 V12", unitIds: [4, 5], qtyPerPm: 1, intervalPm: 1000 }
//         ]
//     },
//     {
//         id: "FF-DEUTZ",
//         name: "Fuel Filter",
//         partNumber: "0117-4423",
//         unit: "Buah",
//         stock: 30,
//         leadTime: 30,
//         usage: [
//             { engine: "Deutz TBD 616 V12", unitIds: [4, 5], qtyPerPm: 1, intervalPm: 500 }
//         ]
//     },
//     {
//         id: "AF-DEUTZ",
//         name: "Air Filter",
//         partNumber: "0118-0870",
//         unit: "Buah",
//         stock: 35,
//         leadTime: 30,
//         usage: [
//             { engine: "Deutz TBD 616 V12", unitIds: [4, 5], qtyPerPm: 2, intervalPm: 6000 }
//         ]
//     },
//     {
//         id: "LOF-MITSU",
//         name: "Lube Oil Filter",
//         partNumber: "37540-11100",
//         unit: "Buah",
//         stock: 88,
//         leadTime: 30,
//         usage: [
//             { engine: "Mitsubishi S16R PTA-S", unitIds: [6, 7], qtyPerPm: 4, intervalPm: 500 }
//         ]
//     },
//     {
//         id: "FF-MITSU",
//         name: "Fuel Filter",
//         partNumber: "32562-60300",
//         unit: "Buah",
//         stock: 91,
//         leadTime: 30,
//         usage: [
//             { engine: "Mitsubishi S16R PTA-S", unitIds: [6, 7], qtyPerPm: 4, intervalPm: 500 }
//         ]
//     },
//     {
//         id: "AF-MITSU",
//         name: "Air Filter",
//         partNumber: "47220-38802",
//         unit: "Buah",
//         stock: 44,
//         leadTime: 30,
//         usage: [
//             { engine: "Mitsubishi S16R PTA-S", unitIds: [6, 7], qtyPerPm: 4, intervalPm: 6000 }
//         ]
//     },
//     {
//         id: "LOFB-MITSU",
//         name: "Lube Oil Filter Bypass",
//         partNumber: "37540-02100",
//         unit: "Buah",
//         stock: 71,
//         leadTime: 30,
//         usage: [
//             { engine: "Mitsubishi S16R PTA-S", unitIds: [6, 7], qtyPerPm: 1, intervalPm: 500 }
//         ]
//     },
//     {
//         id: "RF-SHARED",
//         name: "Racor Filter",
//         partNumber: "2020TM",
//         unit: "Buah",
//         stock: 144, // Gabungan stok 6 + 2
//         leadTime: 30,
//         usage: [
//             { engine: "Mitsubishi S16R PTA-S", unitIds: [6, 7], qtyPerPm: 2, intervalPm: 250 },
//             { engine: "Cummins KTA50-G8", unitIds: [8, 9], qtyPerPm: 1, intervalPm: 250 }
//         ]
//     },
//     {
//         id: "LOF-CUMMINS",
//         name: "Lube Oil Filter",
//         partNumber: "LF3325",
//         unit: "Buah",
//         stock: 470,
//         leadTime: 30,
//         usage: [
//             { engine: "Cummins KTA50-G8", unitIds: [8, 9], qtyPerPm: 5, intervalPm: 500 }
//         ]
//     },
//     {
//         id: "FF-CUMMINS",
//         name: "Fuel Filter",
//         partNumber: "FS1006",
//         unit: "Buah",
//         stock: 433,
//         leadTime: 30,
//         usage: [
//             { engine: "Cummins KTA50-G8", unitIds: [8, 9], qtyPerPm: 2, intervalPm: 500 }
//         ]
//     },
//     {
//         id: "AF-CUMMINS",
//         name: "Air Filter",
//         partNumber: "AF25278",
//         unit: "Buah",
//         stock: 93,
//         leadTime: 30,
//         usage: [
//             { engine: "Cummins KTA50-G8", unitIds: [8, 9], qtyPerPm: 2, intervalPm: 3000 }
//         ]
//     },
//     {
//         id: "LOFB-CUMMINS",
//         name: "Lube Oil Filter Bypass",
//         partNumber: "LF777",
//         unit: "Buah",
//         stock: 46,
//         leadTime: 30,
//         usage: [
//             { engine: "Cummins KTA50-G8", unitIds: [8, 9], qtyPerPm: 2, intervalPm: 500 }
//         ]
//     },
//     {
//         id: "WF-CUMMINS",
//         name: "Water Filter",
//         partNumber: "WF2076",
//         unit: "Buah",
//         stock: 618,
//         leadTime: 30,
//         usage: [
//             { engine: "Cummins KTA50-G8", unitIds: [8, 9], qtyPerPm: 2, intervalPm: 1000 }
//         ]
//     }
// ]
