function hero(eyebrow, title, body, meta = [], fact = '') {
  return {
    type: 'hero',
    eyebrow,
    title,
    body,
    meta,
    fact,
    tone: 'default'
  };
}

function content(eyebrow, title, body, meta = [], fact = '', tone = 'default') {
  return {
    type: 'content',
    eyebrow,
    title,
    body,
    meta,
    fact,
    tone
  };
}

function bullets(eyebrow, title, items, meta = [], fact = '', tone = 'default') {
  return {
    type: 'bullets',
    eyebrow,
    title,
    bullets: items,
    meta,
    fact,
    tone
  };
}

function checklist(eyebrow, title, items, meta = [], fact = '') {
  return {
    type: 'checklist',
    eyebrow,
    title,
    checklist: items,
    meta,
    fact,
    tone: 'default'
  };
}

function quiz(question, options, correctIndex, explanation) {
  return { question, options, correctIndex, explanation };
}

const moduleTemplates = [
  {
    category: 'HSE',
    title: 'Site Induction and Safety Expectations',
    mode: 'INDIVIDUAL',
    estimatedMinutes: 20,
    description: 'Introduces the baseline safety expectations every learner must understand before starting work on a McMillan drilling site.',
    learningObjectives: [
      'Explain the purpose of a site induction and how it supports safe work.',
      'Identify the key rules, permits, and site controls that apply before starting tasks.',
      'Describe when to stop work and escalate concerns to a supervisor.'
    ],
    slides: [
      hero('HSE foundation', 'Site Induction and Safety Expectations', 'This module gives new and returning workers a consistent starting point for understanding how work is planned, controlled, and supervised on site.', ['Why induction matters', 'Core site rules', 'When to escalate'], 'Day-one essential'),
      content('What learners need to know', 'Why the induction comes first', 'Site induction confirms that each worker understands the hazards, environmental conditions, reporting lines, and work boundaries for the job ahead. It is the point where expectations become visible and questions should be raised before work begins.', ['Shared understanding', 'Clear supervision', 'Early questions']),
      bullets('Key site requirements', 'Topics every induction should cover', ['Site access, sign-in, and travel requirements', 'Emergency alarms, muster points, and response roles', 'Task-specific hazards, controls, and permits', 'Restricted zones, exclusion areas, and communication channels'], ['Minimum induction topics'], '4 critical themes'),
      checklist('Before starting work', 'Learner start-up checklist', ['Attend the full induction and ask for clarification where needed', 'Confirm you understand the task, work area, and supervision arrangement', 'Check required permits, PPE, and emergency arrangements are in place', 'Stop and notify the supervisor if anything is unclear or has changed'], ['Practical start-up steps']),
      content('Stop-work principle', 'When to pause and escalate', 'If site conditions change, controls are missing, or instructions conflict with what was briefed, work must pause until the situation is reviewed. Stopping work early protects people, equipment, and the job schedule.', ['Use stop-work authority', 'Escalate changed conditions'], 'Raise issues early', 'warning')
    ],
    quiz: [
      quiz('What is the main purpose of a site induction?', ['To replace supervision for the rest of the shift', 'To confirm workers understand the site, hazards, and controls before work begins', 'To record payroll attendance only'], 1, 'Induction sets the baseline for safe and informed work before tasks begin.'),
      quiz('When should a learner stop work and escalate?', ['Only after an incident has occurred', 'Whenever controls are missing, conditions change, or instructions are unclear', 'Only if another worker tells them to'], 1, 'Stop-work authority applies when the job is no longer understood or controlled.'),
      quiz('Which topic should always be covered during induction?', ['Personal weekend plans', 'Emergency response arrangements', 'Future promotion pathways'], 1, 'Emergency arrangements are a core part of every safe induction.')
    ]
  },
  {
    category: 'HSE',
    title: 'Hazard Identification and Take 5',
    mode: 'INDIVIDUAL',
    estimatedMinutes: 18,
    description: 'Builds the habit of scanning work areas, identifying hazards, and using a simple Take 5 process before and during tasks.',
    learningObjectives: [
      'Recognise common workplace hazards around drilling activities.',
      'Apply a short Take 5 risk check before starting a task.',
      'Select practical controls and review them when conditions change.'
    ],
    slides: [
      hero('HSE foundation', 'Hazard Identification and Take 5', 'Good hazard recognition is an active skill. This module helps learners pause, observe, and put workable controls in place before problems develop.', ['Observe the task', 'Assess the risk', 'Confirm the controls'], 'Think before task'),
      content('Hazard awareness', 'What a good scan looks like', 'A strong pre-task scan looks at the work area, ground conditions, nearby people, plant movement, stored energy, weather, and any recent change since the original plan. The aim is to spot exposure before the job starts.', ['Task area scan', 'Change awareness']),
      bullets('Common drilling hazards', 'Examples learners should be able to spot', ['Moving plant and suspended loads', 'Unstable ground, trenches, or edges', 'Pinch points, rotating equipment, and pressure lines', 'Noise, dust, chemicals, and poor housekeeping'], ['Field hazard examples'], 'Look high, low, near'),
      checklist('Take 5 sequence', 'Simple pre-task review steps', ['Stop and define the task you are about to do', 'Look for hazards that could injure people or damage equipment', 'Assess the risk level and whether the task is still understood', 'Control the risk, communicate the plan, and monitor for change'], ['Use before task start']),
      content('Reviewing controls', 'Why Take 5 is repeated, not one-off', 'A Take 5 should be repeated whenever the job changes, new people or plant enter the area, weather shifts, or unexpected conditions are found. Controls only work when they match the current situation.', ['Repeat after change', 'Update controls live'], 'Dynamic risk review', 'warning')
    ],
    quiz: [
      quiz('When should a Take 5 be completed?', ['Only at the start of the week', 'Before the task starts and again when conditions change', 'After the task is fully complete'], 1, 'Take 5 is a dynamic check, not a one-time formality.'),
      quiz('Which is an example of a drilling-related hazard?', ['Moving plant in a shared work area', 'A clean lunchroom table', 'A completed training record'], 0, 'Moving plant creates a real exposure that must be controlled.'),
      quiz('Why are controls reviewed during the job?', ['Because hazards can change as the job changes', 'Because paperwork needs to look busy', 'Because the first plan is always wrong'], 0, 'Controls must match actual site conditions as they evolve.')
    ]
  },
  {
    category: 'HSE',
    title: 'PPE, Housekeeping and Exclusion Zones',
    mode: 'INDIVIDUAL',
    estimatedMinutes: 15,
    description: 'Covers the practical day-to-day controls learners use to protect themselves and others around active work areas.',
    learningObjectives: [
      'Select and maintain the PPE required for drilling work.',
      'Describe how housekeeping supports safe and efficient operations.',
      'Maintain exclusion zones and respect barricades and spotter instructions.'
    ],
    slides: [
      hero('HSE foundation', 'PPE, Housekeeping and Exclusion Zones', 'Simple controls such as correct PPE, tidy work areas, and respected exclusion zones prevent many of the incidents that disrupt drilling operations.', ['Wear it right', 'Keep areas tidy', 'Respect boundaries'], 'Every shift control'),
      content('Personal protection', 'PPE is the last line of defence', 'PPE does not replace engineering or procedural controls, but it remains essential where exposure cannot be eliminated. Learners need to know what is required, how to inspect it, and when damaged PPE must be replaced.', ['Inspect before use', 'Match PPE to task']),
      bullets('Minimum expectations', 'Typical PPE and area controls', ['Wear required site PPE at all times in active work zones', 'Keep walkways, access points, and work platforms free of clutter', 'Use cones, barriers, and spotters to control movement around hazards', 'Do not enter a barricaded area unless authorised and briefed'], ['Daily safety habits'], 'Barrier discipline'),
      checklist('End-of-task housekeeping', 'What good close-out looks like', ['Remove waste, tools, and loose materials from the work area', 'Store hoses, leads, and gear so they cannot create trip hazards', 'Check signage and barricades still match the current work state', 'Report damaged PPE or missing controls before leaving the area'], ['Shift-end reset']),
      content('Exclusion zone discipline', 'Why barriers must be respected', 'Exclusion zones protect people from line-of-fire hazards, plant movement, and unexpected energy release. Walking through or bypassing a barrier without control undermines the whole job plan.', ['Protect line of fire', 'Follow spotter direction'], 'Do not shortcut barriers', 'warning')
    ],
    quiz: [
      quiz('What is PPE in the hierarchy of controls?', ['The first and only control required', 'A last line of defence when exposure remains', 'A replacement for permits and planning'], 1, 'PPE supports other controls when hazards cannot be fully removed.'),
      quiz('Why does housekeeping matter?', ['It improves both safety and efficiency by reducing clutter and trip hazards', 'It is mainly for visitors to see a tidy site', 'It only matters at the end of the project'], 0, 'Housekeeping reduces avoidable exposures and keeps work areas usable.'),
      quiz('What should you do if an area is barricaded?', ['Enter if you are in a hurry', 'Wait for authorisation and a briefing before entry', 'Move the barrier and replace it later'], 1, 'Barricades are there to enforce planned controls.')
    ]
  },
  {
    category: 'HSE',
    title: 'Incident, Near Miss and Emergency Response',
    mode: 'INDIVIDUAL',
    estimatedMinutes: 22,
    description: 'Explains how to respond calmly to incidents, report near misses, and support emergency arrangements on site.',
    learningObjectives: [
      'Differentiate between an incident, a near miss, and an emergency.',
      'State the first actions to take when something goes wrong.',
      'Follow the site reporting and escalation pathway promptly.'
    ],
    slides: [
      hero('HSE foundation', 'Incident, Near Miss and Emergency Response', 'Fast, accurate reporting and calm emergency actions help teams protect people first and learn from events before they are repeated.', ['Protect people', 'Raise the alarm', 'Report clearly'], 'Response matters'),
      content('Definitions', 'Understanding the event types', 'An incident involves harm, damage, or loss. A near miss is an event that could have caused harm but did not. An emergency is a serious situation requiring immediate coordinated response such as fire, medical crisis, or uncontrolled release.', ['Incident vs near miss', 'Emergency triggers']),
      bullets('Immediate priorities', 'First actions when something goes wrong', ['Make the area safe without creating additional risk', 'Raise the alarm using the site communication method', 'Get medical or emergency assistance if required', 'Preserve key information and report the event promptly'], ['First response priorities'], 'People first'),
      checklist('Reporting expectations', 'Information learners should capture', ['What happened and when it happened', 'Who was involved or exposed', 'What controls were present or missing', 'What immediate actions were taken and who was notified'], ['Report facts early']),
      content('Emergency discipline', 'Why drills and procedures matter', 'In an emergency, people rely on practiced arrangements such as alarms, muster points, emergency contacts, and role clarity. Learners should follow the site procedure and avoid creating confusion by improvising outside their level of authority.', ['Follow site procedure', 'Avoid confusion'], 'Stick to the plan', 'warning')
    ],
    quiz: [
      quiz('What best describes a near miss?', ['An event that caused injury', 'An event that could have caused harm but did not', 'A planned emergency drill'], 1, 'Near misses are important because they reveal weak controls before someone is harmed.'),
      quiz('What should come first during an incident response?', ['Protect people and make the area safe', 'Finish the task before reporting it', 'Wait to see if someone else reports it'], 0, 'Life and immediate safety come before paperwork or production.'),
      quiz('Why should emergencies be handled using the site procedure?', ['To reduce confusion and coordinate response', 'Because learners are not allowed to help', 'To avoid recording the event'], 0, 'Following the procedure helps the team respond in an organised way.')
    ]
  },
  {
    category: 'GEOTECH',
    title: 'Geotechnical Drilling Fundamentals',
    mode: 'INDIVIDUAL',
    estimatedMinutes: 24,
    description: 'Introduces the purpose, workflow, and quality expectations of geotechnical drilling work.',
    learningObjectives: [
      'Describe the purpose of geotechnical drilling and the data it supports.',
      'Identify the basic workflow from setup through sample recovery and reporting.',
      'Recognise the quality factors that influence useful geotechnical information.'
    ],
    slides: [
      hero('Geotech essentials', 'Geotechnical Drilling Fundamentals', 'Geotechnical drilling is about recovering reliable ground information. Every step of the job affects how useful the final samples and records will be to engineers and clients.', ['Purpose of geotech drilling', 'Typical workflow', 'Quality mindset'], 'Data quality first'),
      content('Purpose', 'Why geotechnical drilling is performed', 'Geotechnical drilling helps engineers understand soil and rock conditions, groundwater influences, and material behaviour so they can design foundations, slopes, and earthworks with better confidence.', ['Engineering decisions', 'Ground model inputs']),
      bullets('Typical workflow', 'From planning to delivery', ['Confirm location, method, depth, and sampling requirements', 'Set up the rig safely and verify utilities and access controls', 'Recover samples and maintain clear depth control and identification', 'Log conditions accurately and hand over records in a usable format'], ['Core work sequence'], 'Plan, drill, recover, record'),
      checklist('Quality checks during drilling', 'Practices that support reliable results', ['Keep depth measurements consistent and traceable', 'Protect sample integrity during recovery and storage', 'Record changes in strata, drilling response, and groundwater promptly', 'Escalate unexpected ground conditions or poor recovery early'], ['Useful field habits']),
      content('Why quality matters', 'Small errors can distort the ground picture', 'Poor depth control, mixed samples, weak logging, or delayed recording can make the final investigation less reliable. Good field discipline protects the value of the entire drilling program.', ['Accuracy supports design', 'Field notes matter'], 'Engineering relies on this', 'warning')
    ],
    quiz: [
      quiz('What is the main purpose of geotechnical drilling?', ['To produce reliable ground information for engineering decisions', 'To maximise drilling speed regardless of recovery quality', 'To replace all laboratory testing'], 0, 'The job is to recover dependable information about the ground.'),
      quiz('Which activity is part of the normal geotechnical workflow?', ['Accurate sample identification and logging', 'Ignoring recovery issues until later', 'Removing all field notes after the shift'], 0, 'Clear recovery and logging are core parts of the workflow.'),
      quiz('Why should unexpected conditions be escalated early?', ['Because they can affect method, safety, and data quality', 'Because they are never important', 'Because only office staff can record them'], 0, 'Unexpected conditions often change both risk and investigation quality.')
    ]
  },
  {
    category: 'GEOTECH',
    title: 'Core Handling, Labelling and Recovery',
    mode: 'INDIVIDUAL',
    estimatedMinutes: 20,
    description: 'Teaches learners how to preserve sample integrity and keep core recovery records clear and traceable.',
    learningObjectives: [
      'Handle recovered material in a way that protects sample integrity.',
      'Label boxes and intervals clearly so samples remain traceable.',
      'Record core recovery and defects accurately for later interpretation.'
    ],
    slides: [
      hero('Geotech essentials', 'Core Handling, Labelling and Recovery', 'Recovered core only has value if it stays identifiable, ordered, and representative of the interval it came from. This module focuses on the field habits that make that happen.', ['Protect sample integrity', 'Keep intervals clear', 'Support interpretation'], 'Traceability matters'),
      content('Handling discipline', 'Why the first touch matters', 'Rough handling, mixed runs, or poor box layout can make intact material harder to interpret. Learners should keep runs in order, minimise damage, and communicate any disturbance or loss immediately.', ['Preserve order', 'Note disturbance']),
      bullets('Good labelling practice', 'What each box and run should show', ['Hole ID, project or location reference, and box number', 'From and to depths for each run or segment', 'Orientation and run markers where required', 'Any notable losses, broken ground, or handling issues'], ['Sample traceability'], 'Clear depth markers'),
      checklist('Recovery recording steps', 'Minimum field expectations', ['Confirm recovered length against drilled interval', 'Place material in the correct sequence with spacers and markers', 'Record recovery, losses, and defects while details are fresh', 'Protect filled boxes from weather, contamination, and rough transport'], ['Do it at the tray']),
      content('Downstream impact', 'How poor handling affects engineering outcomes', 'If core is mislabelled, mixed, or damaged, geologists and engineers can misread the ground conditions. Good recovery practice reduces rework and protects confidence in the final logs and recommendations.', ['Support geology and engineering', 'Reduce rework'], 'Interpretation depends on you', 'warning')
    ],
    quiz: [
      quiz('Why is clear sample labelling important?', ['It keeps recovered material traceable to the correct interval', 'It makes boxes look more professional only', 'It removes the need for logging'], 0, 'Traceable labelling is essential for useful interpretation.'),
      quiz('When should recovery and losses be recorded?', ['As soon as practical while details are still clear', 'Only after the project is complete', 'Only if recovery is perfect'], 0, 'Recording early helps preserve accuracy.'),
      quiz('What can happen if core from different runs is mixed?', ['Interpretation of the ground can be compromised', 'Nothing, because all core is the same', 'The box becomes easier to read'], 0, 'Mixed runs can distort the geological picture.')
    ]
  },
  {
    category: 'GEOTECH',
    title: 'Bore Logging and Sample Quality',
    mode: 'INDIVIDUAL',
    estimatedMinutes: 22,
    description: 'Provides a practical overview of field logging, observations, and sample quality indicators that support dependable records.',
    learningObjectives: [
      'Recognise what observations belong in a field bore log.',
      'Describe the sample quality issues that should be captured during drilling.',
      'Keep logging timely, factual, and usable for review.'
    ],
    slides: [
      hero('Geotech essentials', 'Bore Logging and Sample Quality', 'Reliable bore logs are built from timely observations, consistent depth control, and clear notes on the quality of the sample being described.', ['Observe carefully', 'Record factually', 'Note sample quality'], 'Field notes drive value'),
      content('Logging mindset', 'What good field logging looks like', 'Field logs should be factual, depth-referenced, and recorded close to the time of observation. Learners should avoid assumptions they cannot support and instead describe what they can see, feel, or measure.', ['Be factual', 'Log promptly']),
      bullets('Key observations', 'Common log entries during drilling', ['Depths and interval changes', 'Material type, colour, structure, and moisture or weathering', 'Drilling response such as refusal, loss, or instability', 'Groundwater observations and notable odour or contamination indicators'], ['Typical log content'], 'Observe and record'),
      checklist('Protecting sample quality', 'Questions to ask at the drill site', ['Is the sample representative of the interval?', 'Has the sample been disturbed, washed, or mixed?', 'Are losses or poor recovery clearly recorded?', 'Would another person understand this log without verbal explanation?'], ['Simple quality check']),
      content('Why timely logging matters', 'Delayed logs lose context', 'If observations are written later from memory, small but important details can be missed. Logging close to the activity improves accuracy and makes later review by geologists and engineers far easier.', ['Capture details early', 'Support later review'], 'Write it while fresh', 'warning')
    ],
    quiz: [
      quiz('What should a field bore log be based on?', ['Timely, factual observations tied to depth', 'Assumptions added after the shift', 'Only photographs with no notes'], 0, 'Good logs are evidence-based and depth-controlled.'),
      quiz('Which item belongs in a field bore log?', ['Groundwater observations', 'Personal opinions about the client', 'Lunch order changes'], 0, 'Groundwater observations can be important for interpretation.'),
      quiz('Why is sample quality noted in the log?', ['Because disturbance or loss affects how the material should be interpreted', 'Because logs need extra words', 'Because sample quality never changes'], 0, 'Quality notes help reviewers understand how representative the sample is.')
    ]
  },
  {
    category: 'GEOTECH',
    title: 'Drilling Fluids, Ground Conditions and Hole Stability',
    mode: 'INDIVIDUAL',
    estimatedMinutes: 21,
    description: 'Introduces how drilling fluids and changing ground conditions influence hole stability, recovery, and drilling performance.',
    learningObjectives: [
      'Explain the purpose of drilling fluids in geotechnical work.',
      'Recognise signs of unstable or changing ground conditions.',
      'Report stability issues early so controls and methods can be reviewed.'
    ],
    slides: [
      hero('Geotech essentials', 'Drilling Fluids, Ground Conditions and Hole Stability', 'Managing fluids and reading ground response helps teams maintain progress, protect the hole, and preserve sample quality.', ['Fluid purpose', 'Ground response', 'Escalation triggers'], 'Read the hole'),
      content('Fluid purpose', 'Why drilling fluids are used', 'Depending on the method, drilling fluids can help lift cuttings, cool tools, maintain circulation, and support the bore. Their use should match the drilling objective and any environmental or quality constraints on the project.', ['Method-specific use', 'Support circulation']),
      bullets('Warning signs', 'Indicators that the hole or ground is changing', ['Loss of circulation or unexpected returns', 'Heaving, sloughing, or collapsing material', 'Rapid groundwater changes or pressure behaviour', 'Poor sample recovery linked to unstable conditions'], ['Stability indicators'], 'Watch the returns'),
      checklist('Response actions', 'What learners should do when instability appears', ['Pause and confirm what has changed', 'Tell the driller or supervisor promptly', 'Record the condition, depth, and operational impact', 'Wait for updated instructions before pushing ahead'], ['Escalate early']),
      content('Why escalation matters', 'Do not force the hole', 'Trying to push through unstable ground without review can create safety issues, damage equipment, and reduce the reliability of the final investigation. Early escalation protects both the crew and the data.', ['Protect the crew', 'Protect the investigation'], 'Do not drill blind', 'warning')
    ],
    quiz: [
      quiz('What is one purpose of drilling fluids?', ['Supporting circulation and removing cuttings', 'Replacing all hole stability controls', 'Eliminating the need for supervision'], 0, 'Fluids can support the method, but they are not a substitute for judgement or controls.'),
      quiz('Which is a sign of changing hole stability?', ['Unexpected loss of circulation', 'A completed induction form', 'A clean vehicle cab'], 0, 'Loss of circulation can indicate changing or unstable conditions.'),
      quiz('What should happen if unstable ground is identified?', ['Record it and escalate so the method can be reviewed', 'Ignore it and drill faster', 'Wait until the end of the week to mention it'], 0, 'Stability issues should be raised as soon as they are recognised.')
    ]
  },
  {
    category: 'WATER',
    title: 'Water Bore Construction Basics',
    mode: 'INDIVIDUAL',
    estimatedMinutes: 24,
    description: 'Introduces the sequence, intent, and quality controls involved in constructing a basic water bore.',
    learningObjectives: [
      'Describe the main stages of water bore construction.',
      'Recognise how construction quality affects bore performance.',
      'Identify where supervision and verification are needed before moving to the next stage.'
    ],
    slides: [
      hero('Water drilling', 'Water Bore Construction Basics', 'Water bores are built in stages, and each stage influences long-term yield, water quality, and maintainability. This module gives learners a baseline view of that sequence.', ['Construction sequence', 'Quality control points', 'Long-term performance'], 'Build for service life'),
      content('Overview', 'From drilling to completed bore', 'A typical water bore program involves planning the location and design, drilling to target depth, selecting and installing casing and screen, placing filter materials where required, and completing development and disinfection before handover.', ['Step-by-step build', 'Quality gates']),
      bullets('Key construction considerations', 'What learners should watch for', ['Correct depth and diameter for the intended design', 'Suitable casing and screen components for expected conditions', 'Clean handling and storage of bore materials', 'Verification before each stage is covered or progressed'], ['Quality at each stage'], 'Each stage matters'),
      checklist('Before progressing', 'Questions to confirm with the team', ['Has the bore reached the planned interval or has the design changed?', 'Are the materials on hand correct for the approved design?', 'Have drilling observations been recorded clearly?', 'Has the supervisor confirmed readiness for the next stage?'], ['Pause before next stage']),
      content('Long-term view', 'Why construction discipline matters', 'Shortcuts during construction can reduce yield, allow contamination pathways, or create maintenance issues later. Good water bore work is measured not just by completion, but by how well the bore performs over time.', ['Protect yield', 'Protect water quality'], 'Think beyond today', 'warning')
    ],
    quiz: [
      quiz('Why is staged verification important during water bore construction?', ['Because each stage affects performance and may be hidden by the next step', 'Because drilling must be slowed down as much as possible', 'Because only clients care about the final bore'], 0, 'Quality checks prevent hidden issues from being built into the bore.'),
      quiz('Which activity is part of normal water bore construction?', ['Installing casing and screen to suit the design', 'Skipping records once drilling starts', 'Ignoring material cleanliness'], 0, 'Correct installation and handling are core construction tasks.'),
      quiz('What can poor construction discipline lead to?', ['Reduced yield or contamination pathways', 'Guaranteed better bore performance', 'No effect once the bore is drilled'], 0, 'Construction quality strongly influences long-term outcome.')
    ]
  },
  {
    category: 'WATER',
    title: 'Casing, Screen and Gravel Pack Installation',
    mode: 'INDIVIDUAL',
    estimatedMinutes: 20,
    description: 'Explains the purpose and handling of casing, screens, and filter materials during bore completion.',
    learningObjectives: [
      'State the purpose of casing, screen, and gravel pack components.',
      'Handle and install bore materials in a clean and controlled way.',
      'Recognise installation issues that need escalation before completion.'
    ],
    slides: [
      hero('Water drilling', 'Casing, Screen and Gravel Pack Installation', 'Completion materials define how the bore is protected, filtered, and connected to the aquifer. Their installation needs care, cleanliness, and close attention to design intent.', ['Purpose of each component', 'Clean installation', 'Escalation points'], 'Completion quality'),
      content('Component purpose', 'What each completion material does', 'Casing supports the bore and isolates sections, screens admit water while limiting material entry, and gravel pack or filter material helps stabilise and filter around the screen where specified by design.', ['Support, admit, filter', 'Match the design']),
      bullets('Installation risks', 'Common issues learners should recognise', ['Damaging threads or joints during handling', 'Installing the wrong components or wrong interval lengths', 'Allowing dirty materials or debris into the bore', 'Poor control of gravel pack placement or bridging'], ['Common completion issues'], 'Clean and controlled'),
      checklist('Good installation habits', 'Simple field controls', ['Confirm the approved design before running materials', 'Inspect materials for damage and cleanliness', 'Track installed lengths and depths carefully', 'Escalate any mismatch, obstruction, or contamination concern immediately'], ['Completion checks']),
      content('Why cleanliness matters', 'Protecting future water quality', 'Contamination introduced during completion can compromise the bore from day one. Good housekeeping, clean handling, and controlled placement help protect both bore performance and water quality outcomes.', ['Protect water quality', 'Avoid rework'], 'Clean in, clean out', 'warning')
    ],
    quiz: [
      quiz('What is the main purpose of bore screen?', ['To admit water while limiting unwanted material entry', 'To replace casing entirely', 'To disinfect the bore'], 0, 'Screen is used to allow water entry while helping control solids.'),
      quiz('Which is a key installation control?', ['Tracking installed lengths and depths accurately', 'Using any available component if it fits roughly', 'Ignoring cleanliness during handling'], 0, 'Accurate depth and component control are essential.'),
      quiz('Why should contamination concerns be escalated immediately?', ['Because they can affect water quality and bore performance', 'Because they never matter later', 'Because only office staff can respond'], 0, 'Contamination introduced during completion can be hard to fix later.')
    ]
  },
  {
    category: 'WATER',
    title: 'Well Development and Pump Testing',
    mode: 'INDIVIDUAL',
    estimatedMinutes: 19,
    description: 'Provides a learner-level introduction to why bores are developed and how simple pump testing supports handover decisions.',
    learningObjectives: [
      'Explain why development is carried out after bore completion.',
      'Recognise the main observations recorded during development and testing.',
      'Understand why stable, documented results matter before handover.'
    ],
    slides: [
      hero('Water drilling', 'Well Development and Pump Testing', 'Development and basic testing help confirm that a bore is working as intended and provide early evidence about yield, clarity, and response.', ['Why development matters', 'What to observe', 'Why records matter'], 'Commissioning basics'),
      content('Development purpose', 'Clearing and conditioning the bore', 'Development helps remove fine material, improve hydraulic connection, and check that the completed bore responds as expected. It is part of turning a drilled hole into a usable water asset.', ['Condition the bore', 'Check response']),
      bullets('Observations to capture', 'Typical things the team records', ['Water clarity and change over time', 'Flow rate, drawdown, and recovery behaviour', 'Equipment setup and operating duration', 'Any unusual vibration, sand content, or reduced performance'], ['Testing observations'], 'Watch the response'),
      checklist('Before handover', 'Checks learners should expect', ['Confirm development and test data are recorded clearly', 'Report any unstable or poor-performing results', 'Check the site is left tidy and safe', 'Ensure the supervisor agrees the bore is ready for the next step'], ['Simple handover checks']),
      content('Value of good records', 'Why test results must be traceable', 'Clear test records help the team explain bore performance, compare outcomes against expectations, and support future operation or maintenance decisions. Poor records make handover less reliable.', ['Support handover', 'Support operations'], 'If it is not recorded, it is hard to defend', 'warning')
    ],
    quiz: [
      quiz('Why is well development carried out?', ['To improve bore condition and confirm response after completion', 'To avoid recording performance data', 'To replace pump testing in all cases'], 0, 'Development helps condition the bore and reveal how it performs.'),
      quiz('Which observation is useful during pump testing?', ['Drawdown and recovery behaviour', 'The lunch break schedule', 'The colour of the office furniture'], 0, 'Drawdown and recovery help describe bore response.'),
      quiz('Why do test records matter?', ['They support handover and future operating decisions', 'They are only for filing with no practical use', 'They remove the need for supervision'], 0, 'Reliable records make the results understandable and defensible.')
    ]
  },
  {
    category: 'WATER',
    title: 'Water Quality, Hygiene and Disinfection',
    mode: 'INDIVIDUAL',
    estimatedMinutes: 18,
    description: 'Introduces hygiene practices and disinfection basics that support safe water bore completion and handover.',
    learningObjectives: [
      'Describe why hygiene controls matter during water bore work.',
      'Recognise common contamination pathways during completion and handover.',
      'Follow site instructions for clean handling and disinfection steps.'
    ],
    slides: [
      hero('Water drilling', 'Water Quality, Hygiene and Disinfection', 'Water bores can be compromised by poor hygiene during construction and completion. This module helps learners understand the clean-work habits that protect the finished asset.', ['Keep materials clean', 'Prevent contamination', 'Follow disinfection instructions'], 'Protect the source'),
      content('Contamination pathways', 'How water quality can be affected on site', 'Dirty components, poor housekeeping, uncontrolled storage, contaminated tools, and unclean handling practices can introduce material into the bore that reduces water quality or complicates handover.', ['Think about cleanliness', 'Control handling']),
      bullets('Clean-work expectations', 'Practical hygiene controls', ['Store completion materials off the ground where possible', 'Keep tools and contact surfaces clean before use', 'Prevent waste, fuels, and chemicals from entering the work area', 'Follow the approved disinfection method and record it clearly'], ['Daily hygiene controls'], 'Clean handling'),
      checklist('Learner hygiene checklist', 'Before and during completion', ['Check that materials are clean and protected', 'Use the designated handling and storage areas', 'Report any contamination event immediately', 'Confirm disinfection has been completed to the required instruction'], ['Protect the bore']),
      content('Why discipline matters', 'Small contamination can have large consequences', 'A moment of poor hygiene can create lasting water quality issues or trigger rework, delay, and loss of client confidence. Clean habits are a core part of quality water drilling.', ['Quality and reputation', 'Prevent avoidable rework'], 'Clean work is quality work', 'warning')
    ],
    quiz: [
      quiz('Why do hygiene controls matter during bore completion?', ['They help protect water quality and reduce contamination risk', 'They only make the site look tidy', 'They are optional if drilling finished on time'], 0, 'Clean practices help protect the finished water source.'),
      quiz('Which is a contamination pathway?', ['Dirty tools or materials contacting bore components', 'A signed induction record', 'A completed timesheet'], 0, 'Dirty tools and materials can introduce contamination.'),
      quiz('What should happen if contamination is suspected?', ['It should be reported immediately so the response can be managed', 'It should be ignored if no one notices', 'It should only be mentioned after handover'], 0, 'Prompt reporting supports a controlled response.')
    ]
  },
  {
    category: 'PLANT',
    title: 'Pre-start Inspections and Defect Reporting',
    mode: 'INDIVIDUAL',
    estimatedMinutes: 17,
    description: 'Covers the routine inspections and reporting behaviours that keep rigs, vehicles, and support equipment ready for safe work.',
    learningObjectives: [
      'Describe the purpose of pre-start inspections.',
      'Identify the types of defects that should be reported immediately.',
      'Record defects clearly so maintenance and supervisors can act.'
    ],
    slides: [
      hero('Plant and equipment', 'Pre-start Inspections and Defect Reporting', 'Pre-starts are one of the simplest and strongest controls for preventing plant-related incidents and avoidable breakdowns on site.', ['Inspect before use', 'Recognise defects', 'Report clearly'], 'Start with the plant'),
      content('Purpose of a pre-start', 'Why checks happen before operation', 'A pre-start helps confirm that critical systems, guards, controls, access points, and service items are in a usable condition before the machine is relied on in the field.', ['Confirm readiness', 'Find issues early']),
      bullets('Typical defect examples', 'What should be raised promptly', ['Fluid leaks, damaged hoses, or low service levels', 'Faulty lights, alarms, or safety devices', 'Damage to guards, ladders, steps, or handrails', 'Unusual noises, vibration, or poor machine response'], ['Common defect triggers'], 'Find it before shift'),
      checklist('Reporting steps', 'How learners should respond to defects', ['Stop and assess whether the defect affects safe use', 'Notify the supervisor or plant lead promptly', 'Record the defect clearly in the required system or form', 'Do not operate beyond authority if the equipment is not fit for service'], ['Simple reporting flow']),
      content('Why clarity matters', 'Good reports help maintenance act fast', 'A useful defect report explains what was found, where it was observed, and how it affects operation. Clear information supports faster repair decisions and safer scheduling.', ['Support maintenance planning', 'Reduce ambiguity'], 'Clear reports save time', 'warning')
    ],
    quiz: [
      quiz('What is the main aim of a pre-start inspection?', ['To confirm plant is fit for use before operation', 'To delay the shift as long as possible', 'To replace all maintenance tasks'], 0, 'Pre-starts are an early control to verify equipment condition.'),
      quiz('Which issue should be reported as a defect?', ['Damaged guard or safety device', 'A clean windscreen', 'A completed fuel receipt'], 0, 'Damaged safety features affect fit-for-use decisions.'),
      quiz('Why should defects be recorded clearly?', ['So supervisors and maintenance can understand and act', 'Because the machine will repair itself faster', 'Because reporting detail never matters'], 0, 'Clear reports support good decisions and timely repairs.')
    ]
  },
  {
    category: 'PLANT',
    title: 'Safe Operation Around Plant and Lifting',
    mode: 'INDIVIDUAL',
    estimatedMinutes: 21,
    description: 'Introduces learner-level rules for working around moving plant, suspended loads, and line-of-fire hazards.',
    learningObjectives: [
      'Recognise the main hazards around active plant and lifting tasks.',
      'Maintain safe positioning and communication around moving equipment.',
      'Follow exclusion zone and spotter controls during lifting activities.'
    ],
    slides: [
      hero('Plant and equipment', 'Safe Operation Around Plant and Lifting', 'Many serious plant incidents involve people being too close, poorly positioned, or outside the communication loop. This module reinforces the habits that prevent that.', ['Stay visible', 'Respect line of fire', 'Follow lifting controls'], 'Positioning saves lives'),
      content('Exposure awareness', 'Why proximity is the real risk', 'Moving plant and suspended loads create crush, strike, and line-of-fire hazards. Learners need to stay out of travel paths, understand swing zones, and keep clear of suspended or unstable loads.', ['Distance and visibility', 'Avoid line of fire']),
      bullets('Safe-work rules', 'Baseline controls around plant', ['Never assume the operator can see you', 'Use designated communication methods and spotters where required', 'Do not walk under suspended loads or into lifting zones', 'Respect exclusion zones and changing work boundaries'], ['Core field rules'], 'Keep out of the zone'),
      checklist('Before entering the work area', 'Questions to confirm', ['Where is the plant moving and what is the operator doing next?', 'What are the agreed signals or radio channels?', 'Is a spotter or lift plan required for this task?', 'Can the task be done from a safer position or after plant stops?'], ['Pause before approach']),
      content('Lifting discipline', 'Why controls are non-negotiable', 'Loads can shift, swing, or drop without warning. Even routine lifts need controlled access, good communication, and strict respect for the planned lifting area.', ['Routine lifts still hurt people', 'Stick to the plan'], 'Never shortcut lifting controls', 'warning')
    ],
    quiz: [
      quiz('What is a key rule around moving plant?', ['Never assume the operator can see you', 'Walk closer so you can be noticed', 'Approach from blind spots if you are careful'], 0, 'Visibility must be confirmed, not assumed.'),
      quiz('Where should a worker stand during a suspended lift?', ['Outside the lifting zone and out of the line of fire', 'Directly under the load for a better view', 'Anywhere as long as they are wearing PPE'], 0, 'Workers should stay clear of suspended loads and potential swing paths.'),
      quiz('Why are exclusion zones used during lifting?', ['To keep people away from controlled hazard areas', 'To make the site look organised only', 'To reduce paperwork'], 0, 'Exclusion zones enforce distance from line-of-fire hazards.')
    ]
  },
  {
    category: 'PLANT',
    title: 'Rig Setup, Pack-up and Transport Readiness',
    mode: 'INDIVIDUAL',
    estimatedMinutes: 19,
    description: 'Walks learners through the controls that support safe setup, orderly pack-up, and transport preparation for drilling equipment.',
    learningObjectives: [
      'Describe the main checks completed during rig setup and pack-up.',
      'Recognise how poor securing or preparation creates transport risk.',
      'Follow the supervision and verification steps before movement.'
    ],
    slides: [
      hero('Plant and equipment', 'Rig Setup, Pack-up and Transport Readiness', 'Setup and pack-up are high-consequence transition points where rushed work can create both operational and transport hazards.', ['Prepare the worksite', 'Secure the equipment', 'Verify before movement'], 'Transitions need control'),
      content('Setup basics', 'What has to be right before drilling starts', 'Before drilling begins, the team should confirm ground suitability, equipment position, access control, service connections, and a stable work area that matches the planned task and supervision arrangement.', ['Stable setup', 'Controlled access']),
      bullets('Pack-up risks', 'Common issues during close-out and transport prep', ['Loose gear, hoses, or tooling left unsecured', 'Incomplete shutdown or missing isolations', 'Loads not restrained for travel conditions', 'Rushing final checks because the drilling task is finished'], ['Common transition risks'], 'The job is not done yet'),
      checklist('Transport readiness', 'Final checks before movement', ['Confirm the rig and ancillary items are secured', 'Check travel route, permits, and escort requirements where needed', 'Verify stabilisers, mast, and attachments are in transport position', 'Complete the final supervisor sign-off or release process'], ['Move only when verified']),
      content('Why pack-up quality matters', 'Transport risk begins before the vehicle moves', 'Poor pack-up can create dropped objects, damaged equipment, and road transport issues. Careful preparation protects the team after they leave the drill pad as well as on it.', ['Protect the next phase', 'Prevent road risk'], 'Secure it properly', 'warning')
    ],
    quiz: [
      quiz('Why is setup a high-risk phase?', ['Because plant position, ground suitability, and controls must all be confirmed before work starts', 'Because no one is supervising yet', 'Because drilling equipment is safest during setup'], 0, 'Setup establishes the conditions for the rest of the task.'),
      quiz('Which is a common pack-up risk?', ['Loose equipment left unsecured for transport', 'A completed inspection sheet', 'Clear communication between crew members'], 0, 'Unsecured gear can create major hazards during movement.'),
      quiz('What should happen before equipment is moved?', ['Transport readiness should be verified and, where required, signed off', 'The crew should leave immediately once drilling stops', 'Movement should begin before restraints are checked'], 0, 'Movement should only occur after readiness is confirmed.')
    ]
  },
  {
    category: 'PLANT',
    title: 'Fuel, Lubrication and Preventive Maintenance',
    mode: 'INDIVIDUAL',
    estimatedMinutes: 16,
    description: 'Introduces routine servicing habits that support equipment reliability, environmental control, and safe operation.',
    learningObjectives: [
      'Explain why routine servicing supports plant reliability and safety.',
      'Recognise the controls needed during refuelling and lubrication tasks.',
      'Report servicing issues before they become defects or downtime events.'
    ],
    slides: [
      hero('Plant and equipment', 'Fuel, Lubrication and Preventive Maintenance', 'Routine servicing keeps equipment reliable, reduces avoidable failures, and helps crews spot developing issues before they interrupt the job.', ['Service before failure', 'Refuel safely', 'Record servicing issues'], 'Reliable plant starts here'),
      content('Preventive mindset', 'Why routine attention matters', 'Small checks on fluids, filters, grease points, and service intervals help the team maintain performance and find wear, leaks, or contamination before they cause downtime or unsafe operation.', ['Find issues early', 'Maintain reliability']),
      bullets('Servicing controls', 'What learners should keep in mind', ['Use the right products and follow site or manufacturer instructions', 'Control ignition sources and spills during refuelling', 'Keep service points clean to avoid introducing contamination', 'Record overdue service or abnormal findings for follow-up'], ['Routine controls'], 'Clean and controlled'),
      checklist('During routine servicing', 'Good learner habits', ['Confirm the plant is isolated or secured as required', 'Use spill control and housekeeping controls', 'Check for leaks, wear, and unusual residue while servicing', 'Report anything outside normal condition before returning plant to use'], ['Simple service flow']),
      content('Environmental link', 'Servicing mistakes can create wider harm', 'Poor refuelling or lubrication practice can cause spills, fire risk, contamination, and equipment damage. Preventive maintenance supports both operational readiness and environmental performance.', ['Protect the site', 'Protect the plant'], 'A small spill is still a failure', 'warning')
    ],
    quiz: [
      quiz('Why is preventive maintenance important?', ['It helps identify issues before they become failures', 'It removes the need for inspections', 'It is only needed after a breakdown'], 0, 'Preventive maintenance supports reliability and early intervention.'),
      quiz('What should be controlled during refuelling?', ['Ignition sources and spill risk', 'Only the radio volume', 'The weather forecast for next month'], 0, 'Refuelling introduces both fire and environmental risk.'),
      quiz('What should happen if abnormal wear or leaks are found?', ['They should be reported before the plant returns to service', 'They should be ignored if the machine still runs', 'They should be hidden until the next job'], 0, 'Abnormal conditions need follow-up before they escalate.')
    ]
  },
  {
    category: 'ADMIN',
    title: 'Timesheets, Dockets and Daily Reporting',
    mode: 'INDIVIDUAL',
    estimatedMinutes: 14,
    description: 'Introduces the daily reporting habits that help keep projects accurate, traceable, and ready for review.',
    learningObjectives: [
      'Explain why accurate daily records matter for operations and invoicing.',
      'Record time, plant usage, and work status clearly.',
      'Recognise the common reporting errors that create rework or confusion.'
    ],
    slides: [
      hero('Admin and compliance', 'Timesheets, Dockets and Daily Reporting', 'Operational admin may seem routine, but accurate daily records support payroll, client billing, planning, and defensible project history.', ['Accuracy matters', 'Record daily', 'Keep it traceable'], 'Good records protect the job'),
      content('Why reporting matters', 'Admin records support more than payroll', 'Daily records help supervisors understand progress, justify plant and labour costs, answer client questions, and reconcile what happened on site with the plan and the invoice.', ['Support planning', 'Support billing']),
      bullets('What should be captured', 'Typical daily reporting items', ['Hours worked, travel, and downtime where required', 'Plant or rig usage and notable delays', 'Work completed, location, and major task status', 'Issues, variations, or events that need follow-up'], ['Daily essentials'], 'Write the story of the shift'),
      checklist('Before submitting records', 'Simple quality check', ['Check names, dates, and job references are correct', 'Confirm quantities, hours, and comments match the actual shift', 'Make sure unusual events are explained clearly', 'Submit the record on time through the required channel'], ['End-of-day review']),
      content('Common reporting mistakes', 'Small errors create large admin noise', 'Missing details, late submissions, vague comments, and mismatched hours can slow approvals and create rework across payroll, supervision, and client administration.', ['Avoid vague notes', 'Submit on time'], 'Details save follow-up', 'warning')
    ],
    quiz: [
      quiz('Why do accurate daily records matter?', ['They support payroll, billing, planning, and traceability', 'They only exist for archiving', 'They are optional if the shift was normal'], 0, 'Daily records support several important business and project functions.'),
      quiz('Which should be included in daily reporting?', ['Work completed and notable delays or issues', 'Private weekend plans', 'Future holiday preferences'], 0, 'Daily reporting should capture task and shift information.'),
      quiz('What is a common reporting mistake?', ['Submitting vague comments with missing details', 'Using the correct job reference', 'Checking the hours before submitting'], 0, 'Vague or incomplete entries create avoidable admin work.')
    ]
  },
  {
    category: 'ADMIN',
    title: 'Document Control and Training Records',
    mode: 'INDIVIDUAL',
    estimatedMinutes: 15,
    description: 'Explains why current versions, clear storage, and accurate training records matter in an operational business.',
    learningObjectives: [
      'Describe the purpose of basic document control.',
      'Recognise how outdated or missing records create risk.',
      'Maintain training and compliance records accurately.'
    ],
    slides: [
      hero('Admin and compliance', 'Document Control and Training Records', 'Current documents and accurate training records help teams prove competence, follow the right process, and avoid operating from outdated information.', ['Use current versions', 'Store records clearly', 'Maintain evidence'], 'Version control matters'),
      content('Document control basics', 'Why current versions matter', 'Procedures, forms, and templates only help when people use the approved version. Learners should know where controlled documents are kept and avoid relying on old printed copies or saved local versions.', ['Use approved source', 'Avoid outdated copies']),
      bullets('Record risks', 'Problems caused by weak document control', ['Using superseded forms or procedures', 'Missing evidence of training or authorisation', 'Unclear file naming or storage location', 'Delayed updates after a process or system change'], ['Common admin risks'], 'One source of truth'),
      checklist('Training record habits', 'What learners should do', ['Complete required learning on time', 'Ensure attendance, completion, or sign-off is recorded properly', 'Store evidence in the required system or file location', 'Raise any missing or incorrect records promptly'], ['Protect the evidence trail']),
      content('Operational impact', 'Poor records create real business risk', 'Missing or outdated records make audits harder, slow down mobilisation, and can undermine confidence that work is being done by trained and authorised people.', ['Audit readiness', 'Mobilisation readiness'], 'Records support trust', 'warning')
    ],
    quiz: [
      quiz('Why is document control important?', ['It helps people use the correct current information', 'It allows any version to be used as long as it looks familiar', 'It only matters during audits'], 0, 'Controlled documents reduce the risk of working from outdated information.'),
      quiz('What is a risk of poor training records?', ['The business may not be able to prove competence or readiness', 'Learners automatically become more competent', 'Audits become easier'], 0, 'Missing evidence creates both compliance and operational problems.'),
      quiz('What should a learner do if a record is missing or wrong?', ['Raise it promptly so it can be corrected', 'Ignore it unless someone asks later', 'Create an unofficial record elsewhere and hope it is found'], 0, 'Prompt correction helps maintain a reliable evidence trail.')
    ]
  },
  {
    category: 'ADMIN',
    title: 'Client Communication and Handover Standards',
    mode: 'INDIVIDUAL',
    estimatedMinutes: 16,
    description: 'Introduces the communication habits and handover quality expected when sharing progress, issues, and completed work with clients or internal teams.',
    learningObjectives: [
      'Recognise what makes operational communication clear and professional.',
      'Provide factual updates on progress, issues, and changes.',
      'Support clean handovers with the right information attached.'
    ],
    slides: [
      hero('Admin and compliance', 'Client Communication and Handover Standards', 'Professional communication builds confidence when work is progressing normally and when conditions change. Good handover information helps the next person act without guessing.', ['Be clear', 'Be factual', 'Handover cleanly'], 'Confidence comes from clarity'),
      content('Communication basics', 'What good updates sound like', 'Strong operational updates are clear, timely, factual, and specific about status, changes, risks, and next steps. Learners should avoid overpromising or leaving important gaps that others need to chase later.', ['Clarity and timing', 'Specific next steps']),
      bullets('Useful handover content', 'Information that should travel with the job', ['Current task status and what remains outstanding', 'Any issues, delays, or client decisions affecting next steps', 'Relevant documents, records, or approvals', 'Who owns the next action and by when'], ['Handover essentials'], 'No guesswork'),
      checklist('Before sending an update', 'Simple communication check', ['Is the message factual and easy to understand?', 'Does it explain what changed, what is needed, and who is responsible?', 'Are the right attachments or references included?', 'Would the next person know what to do without a phone call?'], ['Think like the receiver']),
      content('Why this matters', 'Weak handovers create avoidable delay', 'Confusing or incomplete updates slow decisions, frustrate clients, and increase the risk of duplicated or missed work. Clear communication supports trust and efficient delivery.', ['Protect client trust', 'Reduce admin churn'], 'Say enough, not too much', 'warning')
    ],
    quiz: [
      quiz('What makes an operational update useful?', ['It is clear, factual, and specific about status and next steps', 'It is vague so the receiver can interpret it freely', 'It avoids mentioning issues or delays'], 0, 'Useful updates help the next person understand what is happening and what is needed.'),
      quiz('What should a good handover include?', ['Outstanding work, issues, and who owns the next action', 'Only the sender’s opinion about the day', 'No supporting documents or references'], 0, 'Handover should equip the receiver to continue the work.'),
      quiz('Why are poor handovers a problem?', ['They create delay, confusion, and duplicated follow-up', 'They save time by keeping details hidden', 'They improve client confidence'], 0, 'Weak handovers create unnecessary friction.')
    ]
  },
  {
    category: 'ADMIN',
    title: 'Environmental and Regulatory Compliance Basics',
    mode: 'INDIVIDUAL',
    estimatedMinutes: 18,
    description: 'Introduces the practical compliance awareness learners need to support permits, environmental controls, and lawful work practices.',
    learningObjectives: [
      'Describe the role of permits, approvals, and compliance conditions.',
      'Recognise the environmental controls commonly applied on site.',
      'Escalate when the work appears to fall outside approved conditions.'
    ],
    slides: [
      hero('Admin and compliance', 'Environmental and Regulatory Compliance Basics', 'Compliance is not separate from operations. It shows up in permits, controls, records, and day-to-day decisions about how work is carried out.', ['Know the conditions', 'Protect the environment', 'Escalate if unsure'], 'Operate within approval'),
      content('Compliance in practice', 'What learners need to understand', 'Projects often operate under permits, client requirements, and environmental controls that define where, when, and how work can proceed. Learners should understand the conditions relevant to their task and work area.', ['Permits and conditions', 'Task boundaries']),
      bullets('Common control themes', 'Examples of compliance expectations', ['Work within approved locations, hours, and methods', 'Manage waste, spills, and contamination pathways', 'Protect watercourses, sensitive areas, and neighbouring properties', 'Keep records that show controls were followed'], ['Typical compliance controls'], 'Conditions count'),
      checklist('When something changes', 'What learners should do', ['Pause and compare the change against the approved plan', 'Raise any uncertainty with the supervisor', 'Do not assume a variation is acceptable without confirmation', 'Record the issue if required by the site process'], ['Escalate before acting']),
      content('Why escalation matters', 'Assumptions create compliance breaches', 'Work that drifts outside approved conditions can create environmental harm, legal exposure, and client issues. Early escalation gives the team a chance to review the change before it becomes a breach.', ['Prevent breach', 'Protect reputation'], 'If unsure, do not assume', 'warning')
    ],
    quiz: [
      quiz('What should a learner do if site conditions no longer match the approved plan?', ['Escalate the change before continuing', 'Assume the variation is minor and keep working', 'Wait until project close-out to mention it'], 0, 'Changes should be checked before work moves outside approval.'),
      quiz('Which is a common compliance control?', ['Managing spills and contamination pathways', 'Ignoring waste if the job is busy', 'Working outside approved hours without review'], 0, 'Environmental controls commonly include spill and waste management.'),
      quiz('Why do project records matter for compliance?', ['They help show that conditions and controls were followed', 'They are only useful if something goes wrong', 'They replace supervision'], 0, 'Records help demonstrate that the approved controls were actually applied.')
    ]
  }
];

const categoryLabels = {
  HSE: 'Health, Safety & Environment',
  GEOTECH: 'Geotechnical Drilling',
  WATER: 'Water Drilling',
  PLANT: 'Plant & Equipment',
  ADMIN: 'Administration & Compliance'
};

export const STARTER_CURRICULUM = Object.entries(categoryLabels).map(([category, label]) => ({
  category,
  label,
  modules: moduleTemplates.filter((item) => item.category === category)
}));

export function createStarterModuleDraft(template) {
  return {
    title: template.title,
    mode: template.mode,
    category: template.category,
    description: template.description,
    learningObjectives: template.learningObjectives.join('\n'),
    estimatedMinutes: String(template.estimatedMinutes),
    contentUrl: '',
    builder: {
      slides: template.slides.map((slide, index) => ({
        id: `starter-slide-${template.category}-${index + 1}`,
        type: slide.type,
        eyebrow: slide.eyebrow,
        title: slide.title,
        body: slide.body || '',
        bullets: slide.bullets || [],
        checklist: slide.checklist || [],
        meta: slide.meta || [],
        fact: slide.fact || '',
        tone: slide.tone || 'default'
      })),
      quiz: template.quiz.map((item, index) => ({
        id: `starter-quiz-${template.category}-${index + 1}`,
        question: item.question,
        options: item.options,
        correctIndex: item.correctIndex,
        explanation: item.explanation
      }))
    }
  };
}
