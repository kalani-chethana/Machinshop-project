const express = require("express");
const cors = require("cors");
const axios = require("axios");
const db = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

const SCALE_URL = "http://192.168.3.169/read";

let prevLc3Weight = 0;
let prevLc4Weight = 0;

let lc3InvalidLatch = false;
let lc3ReferenceWeight = 0;

let lc4InvalidLatch = false;
let lc4ReferenceWeight = 0;

// Raw hardware value cleaning function to extract numeric weight from potential noisy input
function cleanHardwareValue(rawHardwareValue) {
  if (!rawHardwareValue) return 0;
  const cleanedNumericStr = String(rawHardwareValue).replace(/[a-zA-Z]/g, "").trim();
  const parsedValue = parseFloat(cleanedNumericStr);
  return isNaN(parsedValue) ? 0 : parsedValue;
}

// Hardware reading function that fetches a single reading from the specified load cell and cleans it
async function fetchSingleReading(lcNumber) {
  try {
    const response = await axios.post(SCALE_URL, { LC: lcNumber, CMD: "GN" }, { headers: { "Content-Type": "application/json" } });
    return cleanHardwareValue(response.data?.res);
  } catch (err) {
    return null;
  }
}

// Utility function to introduce a delay (used in stabilization engine)
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
  * Stabilization engine that attempts to read a stable weight from the specified load cell by taking multiple samples and checking for consistency within a defined variance threshold.
 */
async function readStableLoadCell(lcNumber) {
  const maxAttempts = 4;      
  const sampleDelay = 150;    
  const allowedVariance = 0.003; 

  let lastWeight = await fetchSingleReading(lcNumber);
  if (lastWeight === null) return 0;

  for (let i = 0; i < maxAttempts; i++) {
    await delay(sampleDelay);
    let currentWeight = await fetchSingleReading(lcNumber);

    if (currentWeight === null) continue;

    if (Math.abs(currentWeight - lastWeight) <= allowedVariance) {
      return currentWeight; 
    }
    lastWeight = currentWeight;
  }
  
  return lastWeight; 
}

app.get("/api/jobs", async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM job_details ORDER BY created_at DESC");
    res.json({ success: true, jobs: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to load job profiles." });
  }
});

app.get("/api/loadcells", async (req, res) => {
  const { jobId } = req.query;

  try {
    const convertedLc3 = await readStableLoadCell(3);
    const convertedLc4 = await readStableLoadCell(4);

    let lc3PartsCount = 0;
    let lc4PartsCount = 0;
    
    let lc3Status = "nominal";
    let lc4Status = "nominal";

    if (jobId) {
      const [rows] = await db.execute("SELECT * FROM job_details WHERE job_id = ?", [jobId]);
      
      if (rows.length > 0) {
        const job = rows[0];

        // ==========================================
        // INPUT SCALE PROCESSING MATRIX (LC3)
        // ==========================================
        const target3 = parseFloat(job.input_weight_one_part);
        const tolerance3 = parseFloat(job.input_tolerance);
        
        if (convertedLc3 <= 0.05) {
          lc3PartsCount = 0;
          lc3Status = "nominal";
          lc3InvalidLatch = false;   
          lc3ReferenceWeight = 0;    
        } 
        else if (target3 > 0) {
          const weightDifference3 = convertedLc3 - prevLc3Weight;
          
          if (!lc3InvalidLatch && Math.abs(weightDifference3) < 0.002) {
            lc3ReferenceWeight = convertedLc3;
          }

          if (!lc3InvalidLatch && lc3ReferenceWeight > 0) {
            const extraWeight = convertedLc3 - lc3ReferenceWeight;

            if (extraWeight >= 0.010 && extraWeight < (target3 - tolerance3)) {
              lc3InvalidLatch = true;
            }
          }
          
          if (lc3InvalidLatch) {
            const remainingExtra = convertedLc3 - lc3ReferenceWeight;

            if (remainingExtra < 0.005) {
                lc3InvalidLatch = false;
                lc3Status = "nominal";
            } else {
              lc3Status = "underweight_part_warning";
              lc3PartsCount = Math.round(convertedLc3 / target3);
              if (lc3PartsCount === 0) lc3PartsCount = 1;
            }
          }
          else if (weightDifference3 > (target3 * 1.5)) {
            lc3Status = "bulk_load_warning";
            lc3PartsCount = Math.round(convertedLc3 / target3);
          } else {
            const minSinglePartWeight3 = target3 - tolerance3;

            if (convertedLc3 < minSinglePartWeight3) {
              lc3PartsCount = 0;
              lc3Status = "underweight_part_warning";
            } else {
              lc3PartsCount = Math.round(convertedLc3 / target3);
              if (lc3PartsCount === 0) lc3PartsCount = 1;

              const expectedWeight = lc3PartsCount * target3;
              if (convertedLc3 < (expectedWeight - tolerance3) || convertedLc3 > (expectedWeight + tolerance3)) {
                lc3Status = "deviation_detected";
              }
            }
          }
        }

        // ==========================================
        // OUTPUT SCALE PROCESSING MATRIX (LC4)
        // ==========================================
        const target4 = parseFloat(job.output_weight_one_part);
        const tolerance4 = parseFloat(job.output_tolerance);

        if (convertedLc4 <= 0.05) {
          lc4PartsCount = 0;
          lc4Status = "nominal";
          lc4InvalidLatch = false;   
          lc4ReferenceWeight = 0;    
        } 
        else if (target4 > 0) {
          const weightDifference4 = convertedLc4 - prevLc4Weight;
          
          // 1. කලින් සේව් කරගත් ස්ටේබල් වේට් එකක් නැත්නම් වත්මන් බර reference එක කරගන්නවා
          if (!lc4InvalidLatch && Math.abs(weightDifference4) < 0.002) {
            lc4ReferenceWeight = convertedLc4;
          }

          // 2. අලුතෙන් එකතු වුණු බර තනි කෑල්ලක උපරිම බරට වඩා වැඩි නම් (එකපාර කෑලි 2ක් දාලා නම්) Latch එක True කරයි.
          if (!lc4InvalidLatch && weightDifference4 > (target4 + tolerance4)) {
            lc4InvalidLatch = true;
            lc4Status = "bulk_load_warning";
          }

          // 3. Underweight කෑල්ලක් එකතු වුණොත් පැරණි ලොජික් එකෙන්ම Latch එක True කරයි.
          if (!lc4InvalidLatch && lc4ReferenceWeight > 0) {
            const extraWeight4 = convertedLc4 - lc4ReferenceWeight;

            if (extraWeight4 >= 0.010 && extraWeight4 < (target4 - tolerance4)) {
              lc4InvalidLatch = true;
            }
          }
          
          // Latch එක True වෙලා තියෙන තාක් සිස්ටම් එක Invalid ස්ටේටස් එකක් පෙන්වයි.
          if (lc4InvalidLatch) {
            const remainingExtra4 = convertedLc4 - lc4ReferenceWeight;

            // වැරදීමකින් තියපු බර නැවත අයින් කර ගත්තොත් විතරක් reset වේ.
            if (remainingExtra4 < 0.005) {
                lc4InvalidLatch = false;
                lc4Status = "nominal";
            } else {
              // එකපාර කෑලි 2ක් දමා ඇත්නම් bulk_load_warning ද, නැතහොත් underweight_part_warning ද ලබාදෙයි.
              if (weightDifference4 > (target4 + tolerance4) || lc4Status === "bulk_load_warning") {
                lc4Status = "bulk_load_warning";
              } else {
                lc4Status = "underweight_part_warning";
              }
              lc4PartsCount = Math.round(convertedLc4 / target4);
              if (lc4PartsCount === 0) lc4PartsCount = 1;
            }
          }
          else if (weightDifference4 > (target4 * 1.5)) {
            lc4Status = "bulk_load_warning";
            lc4PartsCount = Math.round(convertedLc4 / target4);
          } else {
            const minSinglePartWeight4 = target4 - tolerance4;

            if (convertedLc4 < minSinglePartWeight4) {
              lc4PartsCount = 0;
              lc4Status = "underweight_part_warning";
            } else {
              // මෙතනින් එකින් එක (one by one) නිවැරදිව තබන කෑලි ටික පිළිවෙලින් එකතු වී ගණනය වේ.
              lc4PartsCount = Math.round(convertedLc4 / target4);
              if (lc4PartsCount === 0) lc4PartsCount = 1;

              const expectedWeight4 = lc4PartsCount * target4;
              if (convertedLc4 < (expectedWeight4 - tolerance4) || convertedLc4 > (expectedWeight4 + tolerance4)) {
                lc4Status = "deviation_detected";
              }
            }
          }
        }
      }
    }

    prevLc3Weight = convertedLc3;
    prevLc4Weight = convertedLc4;

    res.json({
      lc3: { res: convertedLc3.toFixed(3), partsCount: lc3PartsCount, status: lc3Status },
      lc4: { res: convertedLc4.toFixed(3), partsCount: lc4PartsCount, status: lc4Status },
      timestamp: new Date(),
    });
  } catch (error) {
    console.error("Hardware Error:", error.message);
    res.status(500).json({ success: false, message: "Unable to read load cell values" });
  }
});

app.post("/api/loadcells/reset", async (req, res) => {
  const { lcNumber } = req.body;
  try {
    await axios.post(SCALE_URL, { LC: lcNumber, CMD: "ST" }, { headers: { "Content-Type": "application/json" } });
    if (lcNumber === 3) prevLc3Weight = 0;
    if (lcNumber === 4) prevLc4Weight = 0;
    res.json({ success: true, message: `Reset executed on Loadcell ${lcNumber}` });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to issue reset command" });
  }
});

app.listen(5000, () => console.log("Backend online | Underweight lock protection engine live."));