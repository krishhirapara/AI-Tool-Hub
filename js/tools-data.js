/* =========================================================
   AI ToolHub - tools-data.js
   ALL tool information lives in this one file.
   Pages read this data to build cards, filters and counts.

   TODO (important): prices, free limits and features change often.
   Verify every tool on its official site before going live.
   The review text is written in general, safe terms on purpose.

   TO ADD A NEW TOOL: copy one block below, change the values,
   and add the tool's category to TOOL_CATEGORIES if it is new.
   (Part 6 of this guide explains every step.)
   ========================================================= */

/* The categories shown on the site. "icon" is just an emoji. */
window.TOOL_CATEGORIES = [
  { name: "AI Chatbot",    icon: "💬", description: "Ask questions, get explanations, draft text" },
  { name: "Research",      icon: "🔎", description: "Find answers with sources" },
  { name: "Study",         icon: "📚", description: "Turn your notes into study help" },
  { name: "Design",        icon: "🎨", description: "Posters, graphics and visuals" },
  { name: "Presentations", icon: "📊", description: "Make slides faster" },
  { name: "Writing",       icon: "✍️", description: "Better grammar and clearer writing" },
  { name: "Coding",        icon: "💻", description: "Write and understand code" },
  { name: "Audio",         icon: "🎧", description: "Voices and audio tools" },
  { name: "Image Generation", icon: "🖼️", description: "Create or edit images from prompts" },
  { name: "Video", icon: "🎬", description: "Generate short video clips" },
  { name: "Music", icon: "🎵", description: "Create songs and music from ideas" },
  { name: "Video Editing", icon: "✂️", description: "Edit recordings using transcripts and AI tools" }
];

window.TOOLS_DATA = [
  /* ---------------- 1. ChatGPT ---------------- */
  {
    slug: "chatgpt",
    name: "ChatGPT",
    category: "AI Chatbot",
    tags: ["assignments", "notes", "exams", "coding", "resume", "careers"],
    pricingType: "Freemium",
    // TODO: verify current pricing/features
    pricingNote: "Has a free plan with usage limits, plus paid plans for heavier use. Check the official site for current INR pricing.",
    shortDescription: "A popular AI chatbot for explaining topics, drafting text and brainstorming ideas.",
    strength: "Best all-round assistant for explanations, brainstorming, image creation/editing, and help across different tasks.",
    longDescription: "ChatGPT is a general-purpose assistant for writing, learning, coding, file and image analysis, image creation/editing, and web search. It is a good all-round choice when you want several tasks in one interface. Search can provide current answers with links, but citations and generated answers still need checking.",
    bestFor: "Students who want one flexible assistant for explanations, drafting and brainstorming.",
    features: [
      "Chat-style answers to questions on almost any subject",
      "Help drafting and rewording text",
      "Explains code and helps find bugs",
      "Can summarise text you paste in",
      "Available on the web and as a mobile app"
    ],
    pros: [
      "Easy to start: just type and ask",
      "Handles many different tasks in one place",
      "Free plan available to try it"
    ],
    cons: [
      "Can sound confident while being wrong",
      "Free plan has limits that may change",
      "Copying its answers directly into assignments can break your college rules"
    ],
    studentTip: "Ask it to explain a topic 'like I'm in first year', then ask for 5 practice questions. Use it to learn, and write your final assignment in your own words.",
    officialUrl: "https://chatgpt.com",
    // replace with my affiliate link when approved
    affiliateUrl: "https://chatgpt.com",
    rating: 4.6,   // TODO: add my own experience after testing this tool
    dateAdded: "2026-10-05",
    featured: true,
    similar: ["claude", "google-gemini", "perplexity"]
  },

  /* ---------------- 2. Claude ---------------- */
  {
    slug: "claude",
    name: "Claude",
    category: "AI Chatbot",
    tags: ["assignments", "notes", "exams", "coding", "resume", "careers"],
    pricingType: "Freemium",
    // TODO: verify current pricing/features
    pricingNote: "Has a free plan with usage limits, plus paid plans for more usage. Check the official site for current pricing.",
    shortDescription: "An AI assistant known for clear writing, careful explanations and help with long documents.",
    strength: "A strong choice for drafting and working through long documents; check factual claims and citations independently.",
    longDescription: "Claude is an AI assistant made by Anthropic. It is often used for writing help, summarising long text, explaining concepts and coding support. You can chat with it on the web or in the mobile app. As with any AI tool, check important facts yourself before relying on them.",
    bestFor: "Students who want help with writing, reading long notes and step-by-step explanations.",
    features: [
      "Chat-style help for writing, studying and coding",
      "Can work with long pieces of text you provide",
      "Explains ideas step by step",
      "Helps polish drafts and structure essays",
      "Available on the web and mobile"
    ],
    pros: [
      "Natural, readable writing style",
      "Good for working through long notes or documents",
      "Free plan available to try it"
    ],
    cons: [
      "Free plan has usage limits",
      "Can still make mistakes, so verify facts",
      "Features can differ between free and paid plans"
    ],
    studentTip: "Paste your rough notes and ask it to turn them into a revision summary with headings. Then test yourself by asking it to quiz you.",
    officialUrl: "https://claude.ai",
    // replace with my affiliate link when approved
    affiliateUrl: "https://claude.ai",
    rating: 4.6,   // TODO: add my own experience after testing this tool
    dateAdded: "2026-10-08",
    featured: true,
    similar: ["chatgpt", "google-gemini", "notebooklm"]
  },

  /* ---------------- 3. Google Gemini ---------------- */
  {
    slug: "google-gemini",
    name: "Google Gemini",
    category: "AI Chatbot",
    tags: ["assignments", "notes", "exams", "coding", "careers"],
    pricingType: "Freemium",
    // TODO: verify current pricing/features
    pricingNote: "Can be used with a Google account on a free plan with limits. Paid options may offer more. Check the official site for current details.",
    shortDescription: "Google's AI assistant that works well with your Google account and everyday Google apps.",
    strength: "Useful for people already in Google's ecosystem; available integrations and features depend on account and region.",
    longDescription: "Google Gemini is Google's AI assistant. You can ask questions, get help writing and brainstorm ideas. Because it comes from Google, it may connect with other Google services you already use. Students who live in Google Docs, Drive and Gmail may find it convenient. Features and availability can vary, so check what is offered for your account.",
    bestFor: "Students already using a Google account and Google apps every day.",
    features: [
      "Chat-style answers and writing help",
      "Brainstorming and summarising",
      "Coding help and explanations",
      "May connect with other Google services",
      "Web and mobile access"
    ],
    pros: [
      "Easy to start if you already have a Google account",
      "Free access available with limits",
      "Fits into a Google-based study routine"
    ],
    cons: [
      "Some features may depend on your account or region",
      "Can make mistakes, so verify facts",
      "Free limits can change"
    ],
    studentTip: "Use it to brainstorm project ideas, then ask for a simple weekly plan to finish them before the deadline.",
    officialUrl: "https://gemini.google.com",
    // replace with my affiliate link when approved
    affiliateUrl: "https://gemini.google.com",
    rating: 4.4,   // TODO: add my own experience after testing this tool
    dateAdded: "2026-10-12",
    featured: false,
    similar: ["chatgpt", "claude", "notebooklm"]
  },

  /* ---------------- 4. Perplexity ---------------- */
  {
    slug: "perplexity",
    name: "Perplexity",
    category: "Research",
    tags: ["assignments", "notes", "exams", "careers"],
    pricingType: "Freemium",
    // TODO: verify current pricing/features
    pricingNote: "Has a free plan with limits and paid plans for more advanced use. Check the official site for current pricing.",
    shortDescription: "An AI search tool that answers questions and shows the sources it used.",
    longDescription: "Perplexity is an AI answer engine for web research. It summarizes information from search results and shows links to sources, making it useful for quickly mapping a topic and finding material to read. A citation does not guarantee that the claim is supported: open the cited page, check its date and quality, and prefer primary sources for assignments.",
    bestFor: "Students doing research who want quick answers with links to check.",
    features: [
      "Question-and-answer search with source links",
      "Follow-up questions to dig deeper",
      "Good for getting a quick overview of a topic",
      "Web and mobile access"
    ],
    pros: [
      "Sources are shown, so you can verify",
      "Faster than reading many pages for a first overview",
      "Free plan available to try it"
    ],
    cons: [
      "Sources can still be low quality, so check them",
      "Free plan has limits",
      "Not a replacement for reading your textbooks and papers"
    ],
    studentTip: "Use it to find starting sources for a project, then open the original pages and cite those, not the AI summary.",
    officialUrl: "https://www.perplexity.ai",
    // replace with my affiliate link when approved
    affiliateUrl: "https://www.perplexity.ai",
    rating: 4.4,   // TODO: add my own experience after testing this tool
    dateAdded: "2026-10-15",
    featured: true,
    similar: ["chatgpt", "claude", "notebooklm"]
  },

  /* ---------------- 5. NotebookLM ---------------- */
  {
    slug: "notebooklm",
    name: "NotebookLM",
    category: "Study",
    tags: ["notes", "exams", "assignments"],
    pricingType: "Free",
    // TODO: verify current pricing/features
    pricingNote: "Has been available to use free with a Google account. Paid upgrade options may exist, so check the official site.",
    shortDescription: "Upload your own notes and documents, then ask questions about them.",
    strength: "Best for studying a set of sources you provide, with source-grounded answers and study outputs; it cannot validate poor source material.",
    longDescription: "NotebookLM is a Google tool built around your own material. You add documents such as notes or readings, and then ask questions or request summaries based on what you added. This makes it useful for revision, because answers are tied to your sources rather than the whole internet.",
    bestFor: "Students who want to study from their own notes, slides and readings.",
    features: [
      "Ask questions about documents you upload",
      "Summaries based on your own sources",
      "Helps you find key points before exams",
      "Works with a Google account"
    ],
    pros: [
      "Focused on your own material",
      "Great for revision and summaries",
      "Free to try with a Google account"
    ],
    cons: [
      "Only as good as the material you give it",
      "Features and limits can change",
      "Still check its summaries against your originals"
    ],
    studentTip: "Upload one unit's notes, ask for the 10 most important points, then ask it to quiz you on those points.",
    officialUrl: "https://notebooklm.google.com",
    // replace with my affiliate link when approved
    affiliateUrl: "https://notebooklm.google.com",
    rating: 4.5,   // TODO: add my own experience after testing this tool
    dateAdded: "2026-10-18",
    featured: true,
    similar: ["claude", "google-gemini", "perplexity"]
  },

  /* ---------------- 6. Canva ---------------- */
  {
    slug: "canva",
    name: "Canva",
    category: "Design",
    tags: ["presentations", "assignments", "resume", "careers"],
    pricingType: "Freemium",
    // TODO: verify current pricing/features
    pricingNote: "Has a free plan and paid plans with more features. Check the official site for current pricing and any education offers.",
    shortDescription: "An easy design tool for posters, presentations, resumes and social media graphics.",
    strength: "Best for assembling polished designs from templates and editing them; it is not primarily a freeform image-generation model.",
    longDescription: "Canva is a drag-and-drop design tool with many ready-made templates. Students use it for project posters, presentations, resumes and simple graphics. It also includes AI-powered features, which may differ between free and paid plans.",
    bestFor: "Students who want good-looking designs without learning design software.",
    features: [
      "Ready-made templates for posters, slides and resumes",
      "Drag-and-drop editor",
      "Some AI-powered design helpers",
      "Download your work in common formats",
      "Web and mobile access"
    ],
    pros: [
      "Very beginner-friendly",
      "Lots of templates to start from",
      "Free plan available"
    ],
    cons: [
      "Some templates and features need a paid plan",
      "Many people use the same templates, so designs can look alike",
      "Needs an internet connection for most work"
    ],
    studentTip: "Start from a resume template, keep it to one clean page, and export it as a PDF before applying for internships.",
    officialUrl: "https://www.canva.com",
    // replace with my affiliate link when approved
    affiliateUrl: "https://www.canva.com",
    rating: 4.5,   // TODO: add my own experience after testing this tool
    dateAdded: "2026-10-20",
    featured: true,
    similar: ["gamma", "grammarly", "chatgpt"]
  },

  /* ---------------- 7. Gamma ---------------- */
  {
    slug: "gamma",
    name: "Gamma",
    category: "Presentations",
    tags: ["presentations", "assignments", "careers"],
    pricingType: "Freemium",
    // TODO: verify current pricing/features
    pricingNote: "Has a free plan with limits and paid plans for more. Check the official site for current details.",
    shortDescription: "Create slide decks and documents from a simple text prompt.",
    strength: "Best for turning an outline into a presentation draft quickly; verify facts and revise the generic first draft.",
    longDescription: "Gamma uses AI to build presentations from a short prompt or an outline. You can then edit the slides, change the look and share them. It can save time on a first draft, but you should still check the facts and make the content your own before presenting.",
    bestFor: "Students who need a quick first draft of a presentation.",
    features: [
      "Generate a slide deck from a prompt or outline",
      "Edit text and layouts after generation",
      "Change themes easily",
      "Share your presentation online"
    ],
    pros: [
      "Fast first draft of slides",
      "Clean, modern look",
      "Free plan available to try"
    ],
    cons: [
      "AI content needs fact-checking",
      "Free plan has limits",
      "Slides can feel generic unless you edit them"
    ],
    studentTip: "Write your own outline first, then let it build the slides. Add your own examples so your presentation does not sound generic.",
    officialUrl: "https://gamma.app",
    // replace with my affiliate link when approved
    affiliateUrl: "https://gamma.app",
    rating: 4.3,   // TODO: add my own experience after testing this tool
    dateAdded: "2026-10-22",
    featured: false,
    similar: ["canva", "chatgpt", "claude"]
  },

  /* ---------------- 8. Grammarly ---------------- */
  {
    slug: "grammarly",
    name: "Grammarly",
    category: "Writing",
    tags: ["assignments", "resume", "careers"],
    pricingType: "Freemium",
    // TODO: verify current pricing/features
    pricingNote: "Has a free plan for basic checks and paid plans for advanced suggestions. Check the official site for current pricing.",
    shortDescription: "A writing assistant that checks grammar, spelling and clarity as you type.",
    strength: "Best for proofreading and clarity suggestions, rather than researching or writing an assignment for you.",
    longDescription: "Grammarly checks your writing for grammar, spelling and clarity, and suggests improvements. It works in the browser and in some apps. It is helpful for emails, assignments, cover letters and resumes, especially if English is not your first language.",
    bestFor: "Students who want cleaner, clearer English in assignments, emails and applications.",
    features: [
      "Grammar and spelling checks",
      "Clarity and tone suggestions",
      "Browser extension and app options",
      "Useful for emails and cover letters"
    ],
    pros: [
      "Catches common mistakes quickly",
      "Easy to install and use",
      "Free plan covers the basics"
    ],
    cons: [
      "Advanced suggestions need a paid plan",
      "Suggestions are not always right for your meaning",
      "Not a replacement for reading your work aloud"
    ],
    studentTip: "Run your internship email or cover letter through it before sending. Accept suggestions only when they still sound like you.",
    officialUrl: "https://www.grammarly.com",
    // replace with my affiliate link when approved
    affiliateUrl: "https://www.grammarly.com",
    rating: 4.3,   // TODO: add my own experience after testing this tool
    dateAdded: "2026-10-25",
    featured: false,
    similar: ["canva", "chatgpt", "claude"]
  },

  /* ---------------- 9. GitHub Copilot ---------------- */
  {
    slug: "github-copilot",
    name: "GitHub Copilot",
    category: "Coding",
    tags: ["coding", "assignments", "careers"],
    pricingType: "Freemium",
    // TODO: verify current pricing/features
    pricingNote: "Offers a limited free option and paid plans. Students may be able to apply for access, so check GitHub's official education page.",
    shortDescription: "An AI coding helper that suggests code inside your editor as you type.",
    strength: "Best for in-editor code completion and coding assistance; review every suggestion for correctness, security, and course rules.",
    longDescription: "GitHub Copilot is an AI pair programmer that works inside code editors such as VS Code. It suggests lines or whole blocks of code and can answer coding questions. It is helpful for learning and speeding up routine work, but you should read and understand every suggestion instead of pasting blindly.",
    bestFor: "Students learning to code who use an editor like VS Code.",
    features: [
      "Code suggestions as you type",
      "Chat-style help inside the editor",
      "Explains code you do not understand",
      "Works with many programming languages"
    ],
    pros: [
      "Saves time on repetitive code",
      "Helps you learn by explaining code",
      "Works inside tools you may already use"
    ],
    cons: [
      "Suggestions can be wrong or insecure",
      "You can learn less if you rely on it too much",
      "Plans and access options change, so check before you pay"
    ],
    studentTip: "Try writing the function yourself first, then compare with its suggestion. Ask it to explain any line you do not understand.",
    officialUrl: "https://github.com/features/copilot",
    // replace with my affiliate link when approved
    affiliateUrl: "https://github.com/features/copilot",
    rating: 4.5,   // TODO: add my own experience after testing this tool
    dateAdded: "2026-10-28",
    featured: true,
    similar: ["chatgpt", "claude", "google-gemini"]
  },

  /* ---------------- 10. ElevenLabs ---------------- */
  {
    slug: "elevenlabs",
    name: "ElevenLabs",
    category: "Audio",
    tags: ["presentations", "assignments", "careers"],
    pricingType: "Freemium",
    // TODO: verify current pricing/features
    pricingNote: "Has a free plan with limits and paid plans for more usage. Check the official site for current details.",
    shortDescription: "Turn written text into natural-sounding speech for videos, projects and study audio.",
    strength: "Best for generated speech and voiceover workflows; get consent for voice cloning and check plan rights before publishing.",
    longDescription: "ElevenLabs is an AI audio tool best known for text-to-speech, which turns typed text into realistic spoken voices. Students can use it for voiceovers in project videos or to listen to their own notes. Always follow the site's rules and never copy someone's voice without permission.",
    bestFor: "Students making videos, voiceovers or audio versions of their notes.",
    features: [
      "Text-to-speech with natural-sounding voices",
      "Many voices and languages",
      "Useful for voiceovers in videos",
      "Web-based use"
    ],
    pros: [
      "Realistic voices for project videos",
      "Quick to try",
      "Free plan available with limits"
    ],
    cons: [
      "Free plan has limits",
      "Best features may need a paid plan",
      "Voice use must follow the platform's rules and the law"
    ],
    studentTip: "Paste a short summary of your notes and listen to it while travelling. Hearing a topic can help you remember it.",
    officialUrl: "https://elevenlabs.io",
    // replace with my affiliate link when approved
    affiliateUrl: "https://elevenlabs.io",
    rating: 4.2,   // TODO: add my own experience after testing this tool
    dateAdded: "2026-10-30",
    featured: false,
    similar: ["canva", "gamma", "notebooklm"]
  },
  { slug:"adobe-firefly", name:"Adobe Firefly", category:"Image Generation", tags:["image","design","video"], pricingType:"Freemium", pricingNote:"Generative features and credits depend on Adobe plan; check current plan details.", shortDescription:"Adobe's generative tools for creating and editing images, with video features too.", strength:"Best for image generation and editing in Adobe workflows; also offers video generation.", longDescription:"Firefly is a family of generative creative tools. It is especially useful for generating and editing visual assets in an Adobe workflow, and Adobe also offers prompt- or image-based video generation. Feature access and credits depend on plan; inspect outputs and check current usage terms.", bestFor:"Students making or editing visuals, especially those already using Adobe apps.", features:["Text-to-image generation","Generative image editing","Video generation tools","Integration with Adobe creative apps"], pros:["Combines image generation and editing","Fits into Adobe creative workflows","Offers image and video tools"], cons:["Credits and features depend on plan","Outputs need review","Some features may have plan or region limits"], studentTip:"Use it for a first visual or edit, then inspect details and confirm current usage rights before publishing.", officialUrl:"https://firefly.adobe.com", affiliateUrl:"https://firefly.adobe.com", rating:4.4, dateAdded:"2026-11-07", featured:true, similar:["ideogram","canva","runway"] },
  { slug:"runway", name:"Runway", category:"Video", tags:["video","text to video","image to video"], pricingType:"Freemium", pricingNote:"Generation credits and model access depend on plan; check current limits.", shortDescription:"A creative platform for generating short videos from prompts or images.", strength:"Best suited to short generative video shots and visual experimentation; capabilities vary by model.", longDescription:"Runway provides generative video models and creative tools. Depending on the chosen model, creators can generate clips from text or animate a still image. It suits concept shots and short sequences; generation limits, duration, and controls depend on the model and plan.", bestFor:"Prototyping short visual clips or animating still images.", features:["Text-to-video on supported models","Image-to-video on supported models","Multiple tools and generation modes","Iterative creative workflow"], pros:["Purpose-built generative video workflow","Can start from text or a still image","Several tools in one platform"], cons:["Generations use plan credits","Clip controls vary by model","Consistency across shots may take iteration"], studentTip:"Use it for short illustrative shots and edit them together; don't expect a single prompt to make a complete explainer.", officialUrl:"https://runwayml.com", affiliateUrl:"https://runwayml.com", rating:4.4, dateAdded:"2026-11-07", featured:true, similar:["adobe-firefly","descript","gamma"] },
  { slug:"ideogram", name:"Ideogram", category:"Image Generation", tags:["image","typography","poster","design"], pricingType:"Freemium", pricingNote:"Plans and generation limits change; check the official pricing page.", shortDescription:"An image generator especially useful for posters and graphics with readable text.", strength:"A strong pick for posters or graphics needing readable typography; proofread all generated text.", longDescription:"Ideogram generates and edits images, with a particular emphasis on typography in graphics. Canvas tools support editing workflows such as filling, extending, and remixing. It is useful for poster and cover concepts, but generated lettering still needs proofreading and may need correction.", bestFor:"Posters, covers and social graphics where text is part of the image.", features:["Prompt-based image generation","Typography-focused graphics","Canvas editing and remixing","Text layer editing tools"], pros:["Useful for text-heavy visual concepts","Canvas supports iterative edits","Good fit for posters and covers"], cons:["Text is not guaranteed error-free","Plan limits and export options vary","Final precision may require design software"], studentTip:"Include the exact headline in your prompt, then zoom in and proofread every word.", officialUrl:"https://ideogram.ai", affiliateUrl:"https://ideogram.ai", rating:4.4, dateAdded:"2026-11-07", featured:true, similar:["adobe-firefly","canva","chatgpt"] },
  { slug:"descript", name:"Descript", category:"Video Editing", tags:["video","audio","transcription","podcast"], pricingType:"Freemium", pricingNote:"Features and usage limits vary by plan; check current details.", shortDescription:"Edit spoken-word video and audio by editing its transcript.", strength:"Best for editing interviews and podcasts by changing transcript text; not a text-to-video generator.", longDescription:"Descript is an audio and video editor built around transcripts. It transcribes recordings and lets you edit media by changing transcript text, with AI-assisted cleanup and repurposing features. It is practical for interviews, lectures and podcasts; review transcription and edits, especially names and technical terms.", bestFor:"Editing interviews, presentations, tutorials and podcast recordings.", features:["Text-based audio and video editing","Speech transcription","AI-assisted editing tools","Recording and media export"], pros:["Transcript-based editing is intuitive","Combines recording, transcription and editing","Useful for repurposing recordings"], cons:["Transcripts need correction","Usage limits depend on plan","Not a text-to-video generator"], studentTip:"Correct the transcript before editing, then check the export for unnatural cuts.", officialUrl:"https://www.descript.com", affiliateUrl:"https://www.descript.com", rating:4.3, dateAdded:"2026-11-07", featured:true, similar:["runway","elevenlabs","gamma"] },
  { slug:"suno", name:"Suno", category:"Music", tags:["music","song","audio","lyrics"], pricingType:"Freemium", pricingNote:"Credits and usage rights depend on plan; read current terms before publishing or monetizing.", shortDescription:"Turn a written idea or lyrics into a song with vocals and arrangement.", strength:"Best for quickly prototyping a complete song from an idea; verify usage rights before distribution.", longDescription:"Suno generates songs from descriptions or lyrics, including vocals and musical arrangement. It is useful for creative experiments and demos. Results vary, and rights depend on current plan terms, so confirm the terms before distributing or monetizing a track.", bestFor:"Prototyping a song or musical idea without a full production setup.", features:["Generate songs from descriptions or lyrics","Vocal and instrumental output","Extend and remix supported creations","Library for saving tracks"], pros:["Quickly explores song ideas","Can create a full arrangement from a prompt","Iteration tools support extensions and remixes"], cons:["Lyrics and audio may need revision","Credits vary by plan","Commercial rights require checking current terms"], studentTip:"Use it for a demo, then verify plan-specific rights before public or monetized use.", officialUrl:"https://suno.com", affiliateUrl:"https://suno.com", rating:4.2, dateAdded:"2026-11-07", featured:false, similar:["elevenlabs","descript","gamma"] }
];


