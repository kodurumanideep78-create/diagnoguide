export type DiagnosticComponent = {
  name: string;
  role: string;
  position: { left: number; top: number };
};

export type DiagnosticSource = { title: string; url: string };

export type DiagnosticRoomDetail = {
  id: string;
  principle: string;
  technicalDescription: string;
  caution: string;
  checklist: string[];
  components: DiagnosticComponent[];
  sources: DiagnosticSource[];
};

export const diagnosticRoomImages = [
  "/manus-storage/diagno-room-01-mammography_c21ba5bb.webp",
  "/manus-storage/diagno-room-02-pelvic-ultrasound_ff6dd822.webp",
  "/manus-storage/diagno-room-03-breast-ultrasound_ef1e3de4.webp",
  "/manus-storage/diagno-room-04-cervical-screening-lab_26d973af.webp",
  "/manus-storage/diagno-room-05-pelvic-mri_12cf0c4a.webp",
  "/manus-storage/diagno-room-06-breast-biopsy_b3afb6c4.webp",
  "/manus-storage/diagno-room-07-dexa_d766cb67.webp",
  "/manus-storage/diagno-room-08-fetal-ultrasound_2c7de3bf.webp",
  "/manus-storage/diagno-room-09-endocrine-lab_8dd3a927.webp",
] as const;

export const diagnosticRoomDetails: DiagnosticRoomDetail[] = [
  {
    id: "tomosynthesis",
    principle: "X-ray projections acquired from multiple angles are computationally reconstructed into thin breast-image planes.",
    technicalDescription: "Digital breast tomosynthesis (DBT), often called 3D mammography, is a breast X-ray examination. While the breast is positioned in compression, the X-ray source moves through a limited arc and records projections at different angles. A computer reconstructs the data into thin image planes; some systems also provide a synthesized 2D view. DBT uses ionizing radiation, and protocols vary by facility.",
    caution: "This general information is not individualized medical advice and does not predict findings. DBT uses ionizing X-rays and breast compression; defer preparation and personal risk questions, including pregnancy, implants, or contrast, to your facility or clinician.",
    checklist: [
      "Ask your facility whether any preparation, fasting, or food and fluid limits apply.",
      "Ask your clinician or facility what to do about regular medicines; do not change them based on this list.",
      "Ask how to report possible pregnancy and whether breast implants or prior breast procedures affect your exam.",
      "Ask whether contrast is planned and what questions or precautions apply to you.",
      "Ask what to expect during compression and what aftercare or follow-up instructions to follow.",
    ],
    components: [
      { name: "X-ray source and tube", role: "Produces X-rays and moves through an arc to acquire projections from multiple angles while the breast is positioned for imaging.", position: { left: 24, top: 38 } },
      { name: "Compression paddle and breast platform", role: "Position and briefly compress the breast to help keep it still and spread tissue during image acquisition.", position: { left: 31, top: 63 } },
      { name: "Digital detector and reconstruction computer", role: "The detector records transmitted X-rays as digital images; software reconstructs projections into thin image planes and may generate a synthesized 2D view.", position: { left: 72, top: 42 } },
    ],
    sources: [
      { title: "Breast Tomosynthesis — RadiologyInfo.org", url: "https://www.radiologyinfo.org/en/info/tomosynthesis" },
      { title: "Mammograms — American Cancer Society", url: "https://www.cancer.org/cancer/types/breast-cancer/screening-tests-and-early-detection/mammograms.html" },
    ],
  },
  {
    id: "pelvic-ultrasound",
    principle: "High-frequency sound pulses and returning echoes are processed into real-time images of pelvic structures.",
    technicalDescription: "Pelvic diagnostic ultrasound uses sound waves rather than ionizing radiation. A sonographer or clinician may scan through gel on the lower abdomen and, when appropriate for the clinical question, use a covered and lubricated transvaginal transducer for closer views. The system processes echo timing and strength into images that the operator records for clinical review.",
    caution: "This information is general education, not personal medical advice. Your facility's or clinician's instructions take precedence; the scan itself does not establish a diagnosis.",
    checklist: [
      "Confirm which scan or scans are planned; ask whether fasting or a full or empty bladder is needed.",
      "Ask whether to take usual medicines or make any medication changes; do not change medicines on your own.",
      "Tell your facility if you may be pregnant; ask whether implants, devices, or contrast matter to your specific exam.",
      "Ask what the abdominal and/or transvaginal portions involve and what comfort, consent, or chaperone options are available.",
      "Ask what aftercare, if any, is appropriate and how results and next steps will be discussed.",
    ],
    components: [
      { name: "Ultrasound transducer (probe)", role: "Sends sound pulses into the body and detects returning echoes; abdominal and transvaginal examinations use suitable probe types.", position: { left: 35, top: 52 } },
      { name: "Control and signal-processing console", role: "Controls image acquisition and processes returning signals into images for the operator to review and record.", position: { left: 51, top: 42 } },
      { name: "Display monitor", role: "Shows processed ultrasound images in real time so the operator can guide the scan and capture views.", position: { left: 67, top: 46 } },
    ],
    sources: [
      { title: "Pelvis Ultrasound — RadiologyInfo.org", url: "https://www.radiologyinfo.org/en/info/pelvus" },
      { title: "Pelvic Ultrasound — Portsmouth Hospitals University NHS Trust", url: "https://www.pah.nhs.uk/resources/pelvic-ultrasound-transabdominal-and-transvaginal/" },
    ],
  },
  {
    id: "breast-ultrasound",
    principle: "A focused, non-invasive examination uses returning sound-wave echoes to form real-time pictures of a selected breast area.",
    technicalDescription: "A sonographer or radiologist places coupling gel on the skin and moves a handheld transducer over the area. The transducer sends high-frequency sound pulses and detects returning echoes; the ultrasound system processes these signals into images shown on a display. This targeted examination does not use ionizing radiation and may be used alongside other breast imaging when indicated.",
    caution: "This is general educational information, not medical advice. Ultrasound does not replace other imaging or care recommended by your clinician. Images alone do not establish a diagnosis; discuss results and next steps with your care team.",
    checklist: [
      "Confirm appointment details and ask whether any preparation, fasting, or fluid guidance applies.",
      "Ask your facility or clinician whether to take usual medicines; do not change them based on this checklist.",
      "Tell the care team about breast implants, possible pregnancy, or a proposed contrast study if relevant to your exam.",
      "Ask what clothing, positioning, and comfort accommodations to expect; share access, language, or support needs.",
      "Ask when and how results will be discussed and whether any aftercare or follow-up instructions apply.",
    ],
    components: [
      { name: "Ultrasound transducer (probe)", role: "Sends sound pulses into the targeted tissue and detects echoes returning from tissue boundaries and structures.", position: { left: 47, top: 52 } },
      { name: "Ultrasound coupling gel", role: "Provides contact between the probe and skin to help sound waves pass into and return from the body.", position: { left: 52, top: 71 } },
      { name: "Ultrasound system and display", role: "Processes transducer signals into images and displays them for the examiner to assess and save selected views.", position: { left: 64, top: 41 } },
    ],
    sources: [
      { title: "Breast Ultrasound — RadiologyInfo.org", url: "https://www.radiologyinfo.org/en/info/breastus" },
      { title: "Breast Ultrasound — Guy's and St Thomas' NHS Foundation Trust", url: "https://www.guysandstthomas.nhs.uk/health-information/breast-ultrasound-scan" },
    ],
  },
  {
    id: "lbc-hpv",
    principle: "Liquid-based cytology prepares cervical cells from a preserved specimen for microscopic review; when ordered, a molecular assay tests for targeted HPV genetic material.",
    technicalDescription: "During a clinician-collected cervical screening visit, cells and mucus are sampled from the cervix and transferred to a specimen container. A liquid-based cytology process prepares a cell layer for microscopic assessment. When ordered, an HPV test checks specimen material for the virus or targeted HPV genetic material. Test selection and exact laboratory workflow vary by facility.",
    caution: "This is general education, not personal medical advice. Test orders, collection procedures, and laboratory workflows vary; follow your facility's and clinician's guidance. Screening tests do not by themselves establish a diagnosis.",
    checklist: [
      "Ask your facility or clinician whether preparation or appointment timing applies to your test.",
      "Ask whether fasting or changes to food or fluids are needed for this specific appointment.",
      "Ask what to do about medicines or vaginal products; do not change medicines without clinician guidance.",
      "Ask whether pregnancy or other medical details are relevant to this test and should be shared with the care team.",
      "Ask what to expect during and after collection, whom to contact with questions, and how results are shared.",
    ],
    components: [
      { name: "Liquid-based cytology slide preparation", role: "Processes liquid-preserved cell material and prepares a thin cellular layer on a slide; exact methods vary by laboratory.", position: { left: 22, top: 58 } },
      { name: "Microscope", role: "Enables cytology personnel to examine prepared cervical cells for their microscopic appearance.", position: { left: 58, top: 41 } },
      { name: "Molecular HPV assay analyzer", role: "Processes a specimen aliquot using an assay to detect targeted HPV genetic material when HPV testing is ordered.", position: { left: 76, top: 57 } },
    ],
    sources: [
      { title: "Screening for Cervical Cancer — CDC", url: "https://www.cdc.gov/cervical-cancer/screening/index.html" },
      { title: "Gynecologic Pap Test Collection Procedure — University of Virginia Medical Laboratories", url: "https://www.medicalcenter.virginia.edu/medlabs/lab-tests/cytology/gyenocologic-pap-test-collection-procedure/" },
    ],
  },
  {
    id: "pelvic-mri",
    principle: "A 3-tesla main magnet establishes the static magnetic field; radiofrequency excitation and gradient-based spatial encoding produce reconstructed images.",
    technicalDescription: "Pelvic MRI at 3 tesla (3 T) uses a strong, steady magnetic field, radiofrequency pulses, and a computer to create detailed images without ionizing radiation. The 3 T designation describes main-field strength; it does not by itself specify a scan protocol or contrast agent. The patient lies still while sequences are acquired. A radiologist interprets the images.",
    caution: "This general information is not medical advice. Preparation and decisions about implants, contrast, pregnancy, medicines, and aftercare depend on the patient and facility; confirm them with your own imaging facility or clinician.",
    checklist: [
      "Ask your facility what preparation applies, including whether fasting or changing clothes is needed.",
      "Ask whether usual food, fluids, or medicines need to change; follow your facility's or clinician's directions.",
      "Tell the team about implants, metal in your body, or prior surgery; ask what safety screening is needed.",
      "Ask whether pregnancy, possible pregnancy, breastfeeding, kidney problems, or allergies affect your scan or any proposed contrast.",
      "Ask what to expect during the scan and what aftercare applies, including if contrast or medicine to relax is planned.",
    ],
    components: [
      { name: "Main magnet", role: "Creates the strong static magnetic field; this scanner is described as having a 3-tesla field strength.", position: { left: 75, top: 42 } },
      { name: "Gradient coils", role: "Temporarily vary the magnetic field across the imaging area to spatially encode MRI signals.", position: { left: 64, top: 72 } },
      { name: "Radiofrequency coil(s)", role: "Transmit radiofrequency energy and receive signals from the body; coil selection depends on the exam and scanner.", position: { left: 55, top: 35 } },
    ],
    sources: [
      { title: "Abdominal and Pelvic MRI — RadiologyInfo.org", url: "https://www.radiologyinfo.org/en/info/mri-abdomen-pelvis" },
      { title: "MRI scan — NHS", url: "https://www.nhs.uk/tests-and-treatments/mri-scan/" },
    ],
  },
  {
    id: "breast-biopsy",
    principle: "Real-time ultrasound helps locate a breast finding and guide a hollow core needle to collect tissue samples for laboratory examination.",
    technicalDescription: "In an ultrasound-guided breast core needle biopsy, a clinician uses live ultrasound images to locate a breast finding and guide a hollow needle through the skin to it. Local anesthetic is commonly used. The needle collects small tissue cores for examination; sampling may be repeated. A small marker may be placed at the site. Ultrasound uses sound waves rather than ionizing radiation.",
    caution: "This general information is not individualized medical advice. Your own facility or clinician should answer preparation, medication, pregnancy, implant, contrast, and aftercare questions. A biopsy collects tissue; this page does not interpret results or predict a diagnosis.",
    checklist: [
      "Confirm your facility's preparation instructions, including whether fasting or fluid limits apply.",
      "Ask how to manage usual medicines; tell the team about medicines, allergies, or prior reactions.",
      "Ask whether implants or medical devices affect your appointment or positioning.",
      "Tell your clinician if pregnancy is possible; ask whether contrast is relevant to your planned procedure.",
      "Ask your facility for its aftercare guidance and whom to contact with concerns afterward.",
    ],
    components: [
      { name: "Ultrasound system and display", role: "Processes returning echoes into images that help the clinician locate the target and monitor the needle in real time.", position: { left: 44, top: 48 } },
      { name: "Ultrasound transducer (probe)", role: "Sends sound waves into the breast and detects echoes to create the ultrasound image.", position: { left: 35, top: 38 } },
      { name: "Core biopsy needle and sampling mechanism", role: "Advances a hollow needle into the target and collects core tissue samples for examination.", position: { left: 57, top: 69 } },
    ],
    sources: [
      { title: "Ultrasound-Guided Breast Biopsy — RadiologyInfo.org", url: "https://www.radiologyinfo.org/en/info/breastbius" },
      { title: "Ultrasound-guided core biopsy of the breast — Guy's and St Thomas' NHS Foundation Trust", url: "https://www.guysandstthomas.nhs.uk/health-information/ultrasound-guided-core-biopsy-of-the-breast" },
    ],
  },
  {
    id: "dexa",
    principle: "Dual-energy X-ray absorptiometry estimates bone mineral density by comparing how bone and soft tissue attenuate two X-ray energy levels.",
    technicalDescription: "A central DXA/DEXA scan commonly measures the hip and lumbar spine. The patient lies on a padded table while the scanner passes over the selected region. A detector measures transmitted X-rays, and software processes the data into displayed measurements. DXA uses low-dose ionizing radiation; a qualified professional interprets results in context.",
    caution: "This educational overview is not medical advice. Ask your own facility or clinician about personal considerations, preparation, and follow-up. DXA uses ionizing radiation; this description does not provide a diagnosis or predict results.",
    checklist: [
      "Ask your facility whether preparation, clothing, fasting, or fluid guidance applies.",
      "Ask how usual medicines or supplements should be handled; do not change them without clinician advice.",
      "Tell the team about implants or metal hardware and ask whether they affect the scan.",
      "Mention recent contrast or barium imaging and ask whether timing or other action is needed.",
      "If pregnant or possibly pregnant, tell your clinician and ask about radiation considerations and any aftercare.",
    ],
    components: [
      { name: "X-ray source and generator", role: "Produces the two X-ray energy levels used to measure the selected bones.", position: { left: 53, top: 48 } },
      { name: "Detector and scanning arm", role: "Detects X-rays that pass through the body as the scanner moves over the region being examined.", position: { left: 66, top: 31 } },
      { name: "Computer and analysis software", role: "Processes detector data, estimates bone mineral density, and displays measurements for professional review.", position: { left: 22, top: 44 } },
    ],
    sources: [
      { title: "Bone Density Scan (DEXA or DXA) — RadiologyInfo.org", url: "https://www.radiologyinfo.org/en/info/dexa" },
      { title: "Facts About Bone Density (DEXA Scan) — CDC", url: "https://www.cdc.gov/radiation-health/data-research/facts-stats/dexa-scan.html" },
    ],
  },
  {
    id: "fetal-doppler",
    principle: "Ultrasound echoes form anatomical images; Doppler analysis uses frequency shifts from moving blood cells to characterize selected flow patterns.",
    technicalDescription: "A handheld transducer sends high-frequency sound waves through the abdomen and receives echoes that a computer converts into images. An anatomy scan surveys selected fetal structures according to the examination protocol. Doppler processing analyzes frequency changes from moving blood cells to display or measure flow direction and patterns in selected vessels. Trained clinicians perform and interpret the examination.",
    caution: "For education only, not medical advice. Ultrasound may not identify every condition; discuss the purpose, limitations, and any findings with your care team.",
    checklist: [
      "Confirm the scan type and ask your facility what preparation, if any, to follow.",
      "Ask whether a full bladder or any fasting or fluid guidance applies to your specific appointment.",
      "Ask your clinician or facility whether to take medicines as usual or make any changes.",
      "Ask what the examination involves and which comfort, privacy, or support options are available.",
      "Ask when and how results will be discussed and whether any aftercare applies; follow facility guidance.",
    ],
    components: [
      { name: "Ultrasound transducer (probe)", role: "Sends sound pulses into the body and detects returning echoes; the probe can also collect Doppler signals.", position: { left: 43, top: 53 } },
      { name: "Signal-processing and imaging unit", role: "Processes received echoes into anatomical images and analyzes Doppler frequency shifts for flow information.", position: { left: 53, top: 40 } },
      { name: "Display and operator controls", role: "Shows ultrasound images and Doppler information and lets the operator adjust imaging modes and views.", position: { left: 65, top: 58 } },
    ],
    sources: [
      { title: "Ultrasound in pregnancy — ISUOG", url: "https://www.isuog.org/clinical-resources/patient-information-series/patient-information-pregnancy-conditions/patient-information-general-ultrasound-background/ultrasound-in-pregnancy.html" },
      { title: "Prudent Use and Safety of Diagnostic Ultrasound in Pregnancy — AIUM", url: "https://www.aium.org/resources/official-statements/view/prudent-use-and-safety-of-diagnostic-ultrasound-in-pregnancy" },
    ],
  },
  {
    id: "endocrine-lab",
    principle: "Laboratory measurement of analytes in a collected specimen using test-specific immunoassays or other chemical/analytical methods and instrument detection.",
    technicalDescription: "An endocrine and metabolic analyzer measures selected hormones or other ordered analytes in a collected specimen, commonly serum or plasma. Depending on the test, laboratory methods may include antibody-based immunoassays or other analytical techniques. Automated systems handle measured sample and reagent steps and record test-dependent signals for laboratory review. Methods vary by analyte and facility; an analyzer is not a diagnosis by itself.",
    caution: "This is general educational information, not personalized medical advice. Follow your own clinician's or facility's directions for preparation, collection, medication questions, precautions, and aftercare; laboratory measurements alone do not establish a diagnosis.",
    checklist: [
      "Confirm which test is ordered, what specimen is needed, and where and when it will be collected.",
      "Ask whether preparation, fasting, or changes to food or fluids apply to your specific test.",
      "Ask your clinician or facility what to do about medicines and supplements; do not change them on your own.",
      "Ask whether pregnancy or other individual circumstances are relevant to share with the laboratory or care team.",
      "Ask about collection-related risks, any aftercare, and whom to contact if you have concerns.",
    ],
    components: [
      { name: "Sample handling and pipetting system", role: "Moves measured portions of specimen and reagents into test vessels or reaction areas for analysis.", position: { left: 38, top: 47 } },
      { name: "Reaction or incubation area", role: "Provides a controlled place and timing for specimen and reagents to interact according to the assay method.", position: { left: 50, top: 66 } },
      { name: "Detector and result-processing system", role: "Measures a test-dependent signal and records it for laboratory review and interpretation.", position: { left: 19, top: 41 } },
    ],
    sources: [
      { title: "How are hormones measured? — Society for Endocrinology", url: "https://www.endocrinology.org/endocrinologist/140-summer-2021/features/how-are-hormones-measured-a-journey-in-endocrinology/" },
    ],
  },
];
