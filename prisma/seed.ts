import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting DevPulse database seeding...");

  // Clean existing data
  await prisma.auditLog.deleteMany();
  await prisma.report.deleteMany();
  await prisma.message.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.connection.deleteMany();
  await prisma.bookmark.deleteMany();
  await prisma.projectComment.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.projectLike.deleteMany();
  await prisma.like.deleteMany();
  await prisma.post.deleteMany();
  await prisma.project.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.techTag.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  const salt = await bcrypt.genSalt(10);
  const commonPassword = await bcrypt.hash("DevPulse2026!", salt);
  const adminPassword = await bcrypt.hash("AdminPassword123!", salt);

  // 1. Categories
  const categoriesData = [
    {
      name: "Web Applications",
      slug: "web-apps",
      description: "Full-stack web apps, SPAs, and server-rendered portals",
      icon: "Globe",
    },
    {
      name: "Mobile Apps",
      slug: "mobile-apps",
      description: "iOS, Android, React Native, and Flutter applications",
      icon: "Smartphone",
    },
    {
      name: "AI & Machine Learning",
      slug: "ai-ml",
      description: "LLM wrappers, computer vision, data analysis, and autonomous agents",
      icon: "Cpu",
    },
    {
      name: "Developer Tools & CLIs",
      slug: "dev-tools",
      description: "Command-line utilities, linters, bundlers, and productivity extensions",
      icon: "Terminal",
    },
    {
      name: "Open Source Libraries",
      slug: "open-source",
      description: "Reusable npm packages, crates, and developer primitives",
      icon: "Package",
    },
    {
      name: "Games & Graphics",
      slug: "games-graphics",
      description: "WebGL experiments, canvas games, Three.js 3D simulations",
      icon: "Gamepad2",
    },
    {
      name: "DevOps & Infrastructure",
      slug: "devops-infra",
      description: "CI/CD pipelines, Docker orchestrators, and monitoring solutions",
      icon: "Server",
    },
  ];

  for (const cat of categoriesData) {
    await prisma.category.create({ data: cat });
  }

  // 2. Tech Tags
  const techTagsData = [
    { name: "TypeScript", category: "Language" },
    { name: "JavaScript", category: "Language" },
    { name: "Python", category: "Language" },
    { name: "Rust", category: "Language" },
    { name: "Go", category: "Language" },
    { name: "React", category: "Frontend" },
    { name: "Next.js", category: "Frontend" },
    { name: "Vue.js", category: "Frontend" },
    { name: "Tailwind CSS", category: "Frontend" },
    { name: "Three.js", category: "Frontend" },
    { name: "Node.js", category: "Backend" },
    { name: "FastAPI", category: "Backend" },
    { name: "Express", category: "Backend" },
    { name: "PostgreSQL", category: "Database" },
    { name: "Redis", category: "Database" },
    { name: "SQLite", category: "Database" },
    { name: "Docker", category: "DevOps" },
    { name: "PyTorch", category: "AI" },
    { name: "Flutter", category: "Mobile" },
  ];

  for (const tag of techTagsData) {
    await prisma.techTag.create({ data: tag });
  }

  // 3. Platform Announcements
  await prisma.announcement.create({
    data: {
      title: "Welcome to DevPulse Platform v1.0!",
      content:
        "DevPulse is the dedicated home for independent developers to build their technical identity, showcase projects, and discover incredible software. Connect with peers, post code demos, and publish your work!",
      type: "INFO",
      isActive: true,
    },
  });

  // 4. Users (Admin + 5 Diverse Developers)
  const admin = await prisma.user.create({
    data: {
      email: "admin@devpulse.io",
      passwordHash: adminPassword,
      name: "Alex Vance",
      username: "alexvance",
      role: "ADMIN",
      bio: "DevPulse Founder & Principal Systems Architect. Building open community software for developers worldwide.",
      district: "Seattle",
      country: "United States",
      skills: "TypeScript, Next.js, Rust, Distributed Systems, PostgreSQL, Docker",
      experienceLevel: "Principal Architect (12+ yrs)",
      learningGoals: "Formal verification, eBPF telemetry, and edge-native databases.",
      avatarUrl:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces",
      coverUrl:
        "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&h=400&fit=crop",
      githubUrl: "https://github.com/alexvance",
      portfolioUrl: "https://alexvance.dev",
      linkedinUrl: "https://linkedin.com/in/alexvance",
      twitterUrl: "https://x.com/alexvance",
      isVerified: true,
      isProfilePublic: true,
    },
  });

  const sarah = await prisma.user.create({
    data: {
      email: "sarah@ai-labs.dev",
      passwordHash: commonPassword,
      name: "Sarah Chen",
      username: "sarahchen",
      role: "USER",
      bio: "Full-stack AI developer & ML researcher. Passionate about WebAssembly edge inference and local-first LLMs.",
      district: "San Francisco",
      country: "United States",
      skills: "Python, PyTorch, React, Next.js, FastAPI, WebAssembly, Tailwind CSS",
      experienceLevel: "Senior ML Engineer (6 yrs)",
      learningGoals: "Hardware-accelerated WebGPU computing and tiny quantization models.",
      avatarUrl:
        "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&crop=faces",
      coverUrl:
        "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&h=400&fit=crop",
      githubUrl: "https://github.com/sarahchen",
      portfolioUrl: "https://sarahchen.io",
      linkedinUrl: "https://linkedin.com/in/sarahchen-ml",
      isVerified: true,
      isProfilePublic: true,
    },
  });

  const marcus = await prisma.user.create({
    data: {
      email: "marcus@brody.tech",
      passwordHash: commonPassword,
      name: "Marcus Brody",
      username: "mbrody",
      role: "USER",
      bio: "Backend & Infrastructure Engineer. High-concurrency distributed systems, Go, Kubernetes, and event-driven architectures.",
      district: "Austin",
      country: "United States",
      skills: "Go, Kubernetes, gRPC, PostgreSQL, Redis, Kafka, Terraform",
      experienceLevel: "Lead Backend Engineer (8 yrs)",
      learningGoals: "Zero-knowledge proofs and decentralized identity protocols.",
      avatarUrl:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces",
      coverUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&h=400&fit=crop",
      githubUrl: "https://github.com/mbrody",
      portfolioUrl: "https://mbrody.tech",
      isVerified: true,
      isProfilePublic: true,
    },
  });

  const elena = await prisma.user.create({
    data: {
      email: "elena@designcode.studio",
      passwordHash: commonPassword,
      name: "Elena Rostova",
      username: "elena_r",
      role: "USER",
      bio: "Creative technologist & frontend architect. Blending interactive 3D WebGL, responsive design systems, and silky animations.",
      district: "Berlin",
      country: "Germany",
      skills: "TypeScript, React, Three.js, WebGL, Tailwind CSS, GLSL Shaders",
      experienceLevel: "Creative Developer (5 yrs)",
      learningGoals: "Real-time ray tracing in WebGPU.",
      avatarUrl:
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&crop=faces",
      coverUrl:
        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&h=400&fit=crop",
      githubUrl: "https://github.com/elenarostova",
      portfolioUrl: "https://elenarostova.design",
      linkedinUrl: "https://linkedin.com/in/elena-rostova",
      isVerified: true,
      isProfilePublic: true,
    },
  });

  const kenji = await prisma.user.create({
    data: {
      email: "kenji@mobileforge.jp",
      passwordHash: commonPassword,
      name: "Kenji Takahashi",
      username: "kenji_t",
      role: "USER",
      bio: "Mobile Engineer crafting cross-platform apps with Flutter and native Swift. Performance obsessives welcome.",
      district: "Tokyo",
      country: "Japan",
      skills: "Flutter, Dart, Swift, Kotlin, GraphQL, Firebase, SQLite",
      experienceLevel: "Mobile Specialist (4 yrs)",
      learningGoals: "VisionOS spatial computing apps.",
      avatarUrl:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=faces",
      coverUrl:
        "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=1200&h=400&fit=crop",
      githubUrl: "https://github.com/kenjitakahashi",
      portfolioUrl: "https://kenji.dev",
      isVerified: true,
      isProfilePublic: true,
    },
  });

  const priya = await prisma.user.create({
    data: {
      email: "priya@studentdev.org",
      passwordHash: commonPassword,
      name: "Priya Sharma",
      username: "priyacodes",
      role: "USER",
      bio: "Aspiring Software Engineer & Open Source Contributor. Building web apps and sharing daily learning journeys on DevPulse!",
      district: "Bangalore",
      country: "India",
      skills: "JavaScript, TypeScript, React, Node.js, Express, Tailwind CSS, Git",
      experienceLevel: "Junior Developer (1 yr)",
      learningGoals: "Data structures, Next.js App Router, and cloud deployments.",
      avatarUrl:
        "https://images.unsplash.com/photo-1534751516642-a171ed2a3f8a?w=200&h=200&fit=crop&crop=faces",
      coverUrl:
        "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&h=400&fit=crop",
      githubUrl: "https://github.com/priyasharma",
      portfolioUrl: "https://priyasharma.me",
      isVerified: true,
      isProfilePublic: true,
    },
  });

  // 5. Showcase Projects (including Vertical Video Projects for DevReels)
  const project1 = await prisma.project.create({
    data: {
      title: "AcuityML: Edge Computer Vision in Browser",
      summary: "Zero-latency browser object detection powered by WebAssembly and MobileNetV3.",
      description: `### Overview\n\nAcuityML is an in-browser computer vision playground that runs client-side without sending video streams to any cloud server.\n\n### Key Features\n- **100% Privacy-First**: Video inference occurs exclusively in local WebAssembly memory.\n- **60 FPS Processing**: Optimized SIMD vector instructions enable silky smooth real-time bounding boxes.\n- **Multi-Class Detection**: Identifies 80+ everyday objects, human poses, and gesture commands.\n\n### Tech Stack\nBuilt with Next.js, WebAssembly, ONNX Runtime Web, and Tailwind CSS.`,
      category: "AI & Machine Learning",
      techStack: "Python, PyTorch, WebAssembly, Next.js, TypeScript",
      thumbnailUrl:
        "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&h=500&fit=crop",
      screenshots: JSON.stringify([
        "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=1200&h=800&fit=crop",
        "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&h=800&fit=crop",
      ]),
      demoVideoUrl:
        "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      isVerticalVideo: true,
      liveDemoUrl: "https://acuity-ml-demo.dev",
      repoUrl: "https://github.com/sarahchen/acuity-ml",
      status: "COMPLETED",
      viewsCount: 1420,
      userId: sarah.id,
    },
  });

  const project2 = await prisma.project.create({
    data: {
      title: "HyperTerminal: AI-Supercharged Web Shell",
      summary:
        "A fast, sleek browser terminal with syntax highlighting, bash command replay, and copilot commands.",
      description: `### What is HyperTerminal?\n\nHyperTerminal gives engineers an instant ephemeral development sandbox right inside their browser. It features command autocompletion, real-time multiplexing (split panes), and an integrated AI assistant to explain cryptic shell errors.\n\n### Architecture\n- Client: React 19, Xterm.js, Tailwind CSS\n- Backend: Go WebSocket proxy connecting to lightweight Docker containers.\n- Security: Restricted Linux seccomp profiles to prevent sandbox escape.`,
      category: "Developer Tools & CLIs",
      techStack: "Go, TypeScript, Docker, React, WebSocket",
      thumbnailUrl:
        "https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=800&h=500&fit=crop",
      screenshots: JSON.stringify([
        "https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=1200&h=800&fit=crop",
        "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&h=800&fit=crop",
      ]),
      demoVideoUrl:
        "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
      isVerticalVideo: true,
      liveDemoUrl: "https://hyper-terminal.dev",
      repoUrl: "https://github.com/mbrody/hyper-terminal",
      status: "COMPLETED",
      viewsCount: 2350,
      userId: marcus.id,
    },
  });

  const project3 = await prisma.project.create({
    data: {
      title: "Synthetix 3D: Procedural WebGL Shader Studio",
      summary:
        "Interactive node-based shader graph editor producing exportable GLSL code for Three.js.",
      description: `### Why Synthetix 3D?\n\nWriting GLSL fragment shaders by hand can be daunting. Synthetix 3D lets developers connect math nodes visually—Voronoi noise, Fresnel glow, refraction, raymarching—and generates production-ready GLSL and React Three Fiber components.\n\n### Showcase Features\n- Live PBR materials preview with environmental lighting.\n- One-click copy for Three.js, Babylon.js, and raw GLSL.\n- 50+ built-in starter templates.`,
      category: "Games & Graphics",
      techStack: "Three.js, WebGL, React, TypeScript, GLSL",
      thumbnailUrl:
        "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&h=500&fit=crop",
      screenshots: JSON.stringify([
        "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&h=800&fit=crop",
        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&h=800&fit=crop",
      ]),
      demoVideoUrl:
        "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
      isVerticalVideo: true,
      liveDemoUrl: "https://synthetix3d.studio",
      repoUrl: "https://github.com/elenarostova/synthetix3d",
      status: "COMPLETED",
      viewsCount: 3100,
      userId: elena.id,
    },
  });

  const project4 = await prisma.project.create({
    data: {
      title: "PulseDB: Embedded Columnar Key-Value Store in Rust",
      summary: "Lightweight, ultra-fast append-only embedded database with memory-mapped storage.",
      description: `PulseDB is built in Rust for embedded IoT devices and high-throughput logging collectors. It delivers 1.4 million writes per second on standard NVMe drives with minimal RAM overhead.`,
      category: "Open Source Libraries",
      techStack: "Rust, C, SQLite, Performance Optimization",
      thumbnailUrl:
        "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&h=500&fit=crop",
      screenshots: JSON.stringify([
        "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=1200&h=800&fit=crop",
      ]),
      demoVideoUrl:
        "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
      isVerticalVideo: true,
      liveDemoUrl: "https://pulsedb.org",
      repoUrl: "https://github.com/alexvance/pulsedb",
      status: "COMPLETED",
      viewsCount: 890,
      userId: admin.id,
    },
  });

  const project5 = await prisma.project.create({
    data: {
      title: "DevPulse Mobile: Native Developer Hub",
      summary:
        "Cross-platform mobile companion for DevPulse with offline feed caching and biometric auth.",
      description: `Stay connected to the developer community on iOS and Android. Built with Flutter, supporting background notifications and quick project demos.`,
      category: "Mobile Apps",
      techStack: "Flutter, Dart, GraphQL, SQLite",
      thumbnailUrl:
        "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=500&fit=crop",
      screenshots: JSON.stringify([
        "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=1200&h=800&fit=crop",
      ]),
      demoVideoUrl:
        "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
      isVerticalVideo: true,
      liveDemoUrl: "https://devpulse-mobile.preview",
      repoUrl: "https://github.com/kenjitakahashi/devpulse-mobile",
      status: "IN_PROGRESS",
      viewsCount: 560,
      userId: kenji.id,
    },
  });

  const project6 = await prisma.project.create({
    data: {
      title: "DevNotes: Minimalist Markdown Workspace for Learners",
      summary:
        "An open-source clean notes app designed specifically for computer science students.",
      description: `My first comprehensive full-stack project! Features real-time markdown preview, code snippet highlighting for 40+ languages, and cloud synchronization.`,
      category: "Web Applications",
      techStack: "React, Next.js, TypeScript, Tailwind CSS, SQLite",
      thumbnailUrl:
        "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=500&fit=crop",
      screenshots: JSON.stringify([
        "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&h=800&fit=crop",
      ]),
      liveDemoUrl: "https://devnotes-student.vercel.app",
      repoUrl: "https://github.com/priyasharma/devnotes",
      status: "COMPLETED",
      viewsCount: 420,
      userId: priya.id,
    },
  });

  // 6. Community Posts
  const post1 = await prisma.post.create({
    data: {
      content: `Excited to announce that AcuityML v1.0 is live on DevPulse! 🚀\n\nWe managed to get client-side object detection running at 60fps in WebAssembly using SIMD instructions. No cloud backend, zero video frames ever leave your browser.\n\nCheck out the demo video in the showcase and let me know your thoughts on our edge detection benchmarks!`,
      postType: "PROJECT_ANNOUNCEMENT",
      projectId: project1.id,
      userId: sarah.id,
    },
  });

  const post2 = await prisma.post.create({
    data: {
      content: `Question for the community: When architecting high-throughput Go microservices in 2026, what are your preferences between gRPC-Web vs ConnectRPC vs raw WebSockets?\n\nWe benchmarked ConnectRPC with HTTP/3 against raw gRPC and the latency delta was sub-millisecond, but the debugging ergonomics in browser devtools were substantially better. Thoughts?`,
      postType: "GENERAL",
      userId: marcus.id,
    },
  });

  const post3 = await prisma.post.create({
    data: {
      content: `Just wrapped up our new procedural shader gallery in Synthetix 3D! 🎨✨\n\nAll shaders compile down to clean GLSL without any runtime bloat. If you are building Three.js or React Three Fiber web experiences, check it out and feel free to fork any shader recipe.`,
      postType: "PROJECT_ANNOUNCEMENT",
      projectId: project3.id,
      userId: elena.id,
    },
  });

  const post4 = await prisma.post.create({
    data: {
      content: `Today marks 1 year since I wrote my first line of JavaScript! 💻🎉\n\nStarted out with basic HTML/CSS, struggled with async/await, and today I deployed DevNotes, my full-stack Next.js project with authentication. Thank you to everyone on DevPulse who reviews code and answers beginner questions. You are all amazing!`,
      postType: "MILESTONE",
      projectId: project6.id,
      userId: priya.id,
    },
  });

  const post5 = await prisma.post.create({
    data: {
      content: `Welcome to all new developers joining DevPulse this week! 🌐\n\nDevPulse is built by developers, for developers. Whether you're publishing your very first student project or open-sourcing a large-scale framework, you have a home here.\n\nTake a look around the Project Discovery feed and test out the DevReels vertical video stream!`,
      postType: "GENERAL",
      userId: admin.id,
    },
  });

  // 7. Likes (STRICT Single Like YouTube-Style!)
  // One like per user per post
  await prisma.like.create({ data: { userId: admin.id, postId: post1.id } });
  await prisma.like.create({ data: { userId: marcus.id, postId: post1.id } });
  await prisma.like.create({ data: { userId: elena.id, postId: post1.id } });
  await prisma.like.create({ data: { userId: priya.id, postId: post1.id } });

  await prisma.like.create({ data: { userId: sarah.id, postId: post2.id } });
  await prisma.like.create({ data: { userId: admin.id, postId: post2.id } });

  await prisma.like.create({ data: { userId: sarah.id, postId: post3.id } });
  await prisma.like.create({ data: { userId: marcus.id, postId: post3.id } });
  await prisma.like.create({ data: { userId: priya.id, postId: post3.id } });

  await prisma.like.create({ data: { userId: admin.id, postId: post4.id } });
  await prisma.like.create({ data: { userId: sarah.id, postId: post4.id } });
  await prisma.like.create({ data: { userId: elena.id, postId: post4.id } });
  await prisma.like.create({ data: { userId: kenji.id, postId: post4.id } });

  // Project Likes (Single Like rule!)
  await prisma.projectLike.create({ data: { userId: admin.id, projectId: project1.id } });
  await prisma.projectLike.create({ data: { userId: marcus.id, projectId: project1.id } });
  await prisma.projectLike.create({ data: { userId: priya.id, projectId: project1.id } });

  await prisma.projectLike.create({ data: { userId: sarah.id, projectId: project2.id } });
  await prisma.projectLike.create({ data: { userId: elena.id, projectId: project2.id } });

  await prisma.projectLike.create({ data: { userId: admin.id, projectId: project3.id } });
  await prisma.projectLike.create({ data: { userId: priya.id, projectId: project3.id } });

  await prisma.projectLike.create({ data: { userId: admin.id, projectId: project6.id } });
  await prisma.projectLike.create({ data: { userId: sarah.id, projectId: project6.id } });
  await prisma.projectLike.create({ data: { userId: marcus.id, projectId: project6.id } });

  // 8. Comments
  await prisma.comment.create({
    data: {
      content:
        "Incredible work on the SIMD optimization Sarah! 60fps in browser with no backend is pure wizardry.",
      userId: marcus.id,
      postId: post1.id,
    },
  });

  await prisma.comment.create({
    data: {
      content:
        "Thank you Marcus! The memory alignment on the Wasm heap was tricky, but totally worth it.",
      userId: sarah.id,
      postId: post1.id,
    },
  });

  await prisma.comment.create({
    data: {
      content:
        "Huge congratulations Priya! The UI on DevNotes looks super clean. Keep pushing forward!",
      userId: elena.id,
      postId: post4.id,
    },
  });

  await prisma.comment.create({
    data: {
      content:
        "ConnectRPC is an absolute game-changer. Being able to inspect requests natively in browser network tab without protobuf decoders saves so much time.",
      userId: admin.id,
      postId: post2.id,
    },
  });

  // Project Comments
  await prisma.projectComment.create({
    data: {
      content:
        "Tested this with our robotics webcam stream. Detection latency was under 16ms! Outstanding project.",
      userId: admin.id,
      projectId: project1.id,
    },
  });

  await prisma.projectComment.create({
    data: {
      content:
        "The shader graphs in Synthetix are so intuitive. Used one in our landing page hero!",
      userId: priya.id,
      projectId: project3.id,
    },
  });

  // 9. Bookmarks
  await prisma.bookmark.create({ data: { userId: admin.id, postId: post1.id } });
  await prisma.bookmark.create({ data: { userId: admin.id, projectId: project3.id } });
  await prisma.bookmark.create({ data: { userId: priya.id, projectId: project1.id } });

  // 10. Connections (Developer Network)
  await prisma.connection.create({
    data: { senderId: admin.id, receiverId: sarah.id, status: "ACCEPTED" },
  });
  await prisma.connection.create({
    data: { senderId: admin.id, receiverId: marcus.id, status: "ACCEPTED" },
  });
  await prisma.connection.create({
    data: { senderId: sarah.id, receiverId: elena.id, status: "ACCEPTED" },
  });
  await prisma.connection.create({
    data: { senderId: priya.id, receiverId: admin.id, status: "ACCEPTED" },
  });
  await prisma.connection.create({
    data: { senderId: kenji.id, receiverId: admin.id, status: "PENDING" },
  });

  // 11. In-App Notifications
  await prisma.notification.create({
    data: {
      recipientId: sarah.id,
      senderId: marcus.id,
      type: "POST_COMMENT",
      title: "New Comment",
      message: "Marcus Brody commented on your AcuityML announcement post.",
      link: `/posts/${post1.id}`,
    },
  });

  await prisma.notification.create({
    data: {
      recipientId: admin.id,
      senderId: kenji.id,
      type: "CONNECTION_REQUEST",
      title: "Connection Request",
      message: "Kenji Takahashi sent you a connection request.",
      link: "/connections",
    },
  });

  await prisma.notification.create({
    data: {
      recipientId: priya.id,
      senderId: elena.id,
      type: "POST_COMMENT",
      title: "New Comment",
      message: "Elena Rostova commented on your 1-year developer milestone post.",
      link: `/posts/${post4.id}`,
    },
  });

  // 12. Direct Messages (Private Messaging)
  await prisma.message.create({
    data: {
      senderId: sarah.id,
      receiverId: admin.id,
      content:
        "Hey Alex! Loved the latest update to DevPulse. Quick question: are you planning to add WebGPU compute benchmarks in the tech tags?",
      isRead: true,
    },
  });

  await prisma.message.create({
    data: {
      senderId: admin.id,
      receiverId: sarah.id,
      content:
        "Hey Sarah! Absolutely, WebGPU and WebAssembly are first-class citizens in our roadmap. Added WebGPU to the official tag list today!",
      isRead: true,
    },
  });

  // 13. Audit Log
  await prisma.auditLog.create({
    data: {
      adminId: admin.id,
      action: "SYSTEM_INITIALIZATION",
      target: "Platform Core",
      details: "DevPulse platform successfully initialized with starter tags and categories.",
    },
  });

  console.log("✅ DevPulse database seeding successfully finished!");
  console.log("👤 Super Admin Account: admin@devpulse.io / AdminPassword123!");
  console.log("👤 Developer Account: sarah@ai-labs.dev / DevPulse2026!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
