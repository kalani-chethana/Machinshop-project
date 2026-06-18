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

function convertLbStringToKg(rawHardwareValue) {
  if (!rawHardwareValue) return "0.000";
  const cleanedNumericStr = String(rawHardwareValue).replace(/[a-zA-Z]/g, "").trim();
  const parsedLb = parseFloat(cleanedNumericStr);
  if (isNaN(parsedLb)) return "0.000";
  return (parsedLb * 0.45359237).toFixed(3);
}

async function readLoadCell(lcNumber) {
  const response = await axios.post(SCALE_URL, { LC: lcNumber, CMD: "GN" }, { headers: { "Content-Type": "application/json" } });
  return response.data;
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
    const rawLc3Data = await readLoadCell(3);
    const rawLc4Data = await readLoadCell(4);

    const convertedLc3 = parseFloat(convertLbStringToKg(rawLc3Data?.res));
    const convertedLc4 = parseFloat(convertLbStringToKg(rawLc4Data?.res));

    let lc3PartsCount = 0;
    let lc4PartsCount = 0;
    
    // Status handles: 'nominal', 'underweight_part_warning', 'bulk_load_warning', 'deviation_detected'
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
        
        // 1. Reset metrics if scale is empty (Below noise margin threshold)
        if (convertedLc3 <= 0.05) {
          lc3PartsCount = 0;
          lc3Status = "nominal";
        } else if (target3 > 0) {
          // Check bulk velocity load errors first
          const weightDifference3 = convertedLc3 - prevLc3Weight;
          // Save stable weight
          if (
            !lc3InvalidLatch &&
            Math.abs(weightDifference3) < 0.002
          ) {
            lc3ReferenceWeight = convertedLc3;
          }

          // Detect small added material
          if (
            !lc3InvalidLatch &&
            lc3ReferenceWeight > 0
          ) {

            const extraWeight =
              convertedLc3 - lc3ReferenceWeight;

            if (
              extraWeight >= 0.010 &&
              extraWeight < (target3 - tolerance3)
            ) {

              lc3InvalidLatch = true;
            }
          }
          if (lc3InvalidLatch) {

            const remainingExtra =
              convertedLc3 - lc3ReferenceWeight;

            if (remainingExtra < 0.005) {

                lc3InvalidLatch = false;
                lc3Status = "nominal";

            } else {

              lc3Status = "underweight_part_warning";

              lc3PartsCount =
                Math.round(convertedLc3 / target3);

              if (lc3PartsCount === 0)
                lc3PartsCount = 1;
            }

          }


          else if (weightDifference3 > (target3 * 1.5)) {
            lc3Status = "bulk_load_warning";
            lc3PartsCount = Math.round(convertedLc3 / target3);
          } else {
            // Determine piece calculation based on minimum single part weight rules
            const minSinglePartWeight3 = target3 - tolerance3;

            if (convertedLc3 < minSinglePartWeight3) {
              // SCENARIO: Weight on scale is too small to be a valid product item
              lc3PartsCount = 0;
              lc3Status = "underweight_part_warning";
            } else {
              // Calculate normal pieces on scale
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

if (convertedLc4 <= 0.02) {

    lc4PartsCount = 0;
    lc4Status = "nominal";

    lc4InvalidLatch = false;
    lc4ReferenceWeight = 0;
}
else if (target4 > 0) {

    const weightDifference4 =
        convertedLc4 - prevLc4Weight;

    // ----------------------------------
    // Save stable reference weight
    // ----------------------------------
    if (
        !lc4InvalidLatch &&
        Math.abs(weightDifference4) < 0.002
    ) {
        lc4ReferenceWeight = convertedLc4;
    }

    // ----------------------------------
    // Detect invalid added weight
    // ----------------------------------
    if (
        !lc4InvalidLatch &&
        lc4ReferenceWeight > 0
    ) {

        const extraWeight4 =
            convertedLc4 - lc4ReferenceWeight;

        const minValidPartWeight =
            target4 - tolerance4;

        const maxValidPartWeight =
            target4 + tolerance4;

        if (extraWeight4 >= 0.010) {

            if (
                extraWeight4 < minValidPartWeight ||
                extraWeight4 > maxValidPartWeight
            ) {

                lc4InvalidLatch = true;
                lc4Status = "invalid_output_part";
            }
        }
    }

    // ----------------------------------
    // Keep invalid state until removed
    // ----------------------------------
    if (lc4InvalidLatch) {

        const remainingExtra4 =
            convertedLc4 - lc4ReferenceWeight;

        if (remainingExtra4 < 0.005) {

            lc4InvalidLatch = false;
            lc4Status = "nominal";

            lc4ReferenceWeight =
                convertedLc4;

        } else {

            lc4Status =
                "invalid_output_part";

            lc4PartsCount =
                Math.round(
                    convertedLc4 / target4
                );

            if (lc4PartsCount === 0)
                lc4PartsCount = 1;
        }
    }

    // ----------------------------------
    // Bulk load detection
    // ----------------------------------
    else if (
        weightDifference4 >
        (target4 * 1.5)
    ) {

        lc4Status =
            "bulk_load_warning";

        lc4PartsCount =
            Math.round(
                convertedLc4 / target4
            );
    }

    // ----------------------------------
    // Normal part counting
    // ----------------------------------
    else {

        const minSinglePartWeight4 =
            target4 - tolerance4;

        if (
            convertedLc4 <
            minSinglePartWeight4
        ) {

            lc4PartsCount = 0;
            lc4Status =
                "underweight_part_warning";

        } else {

            lc4PartsCount =
                Math.round(
                    convertedLc4 / target4
                );

            if (lc4PartsCount === 0)
                lc4PartsCount = 1;

            const expectedWeight4 =
                lc4PartsCount * target4;

            if (
                convertedLc4 <
                    (expectedWeight4 - tolerance4) ||
                convertedLc4 >
                    (expectedWeight4 + tolerance4)
            ) {

                lc4Status =
                    "deviation_detected";
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