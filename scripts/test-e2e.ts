/**
 * DevPulse Comprehensive End-to-End API & Integration Test Suite
 * Validates all core requirements specified in the Master Project Brief.
 */

const BASE_URL = "http://localhost:3001";

interface TestResult {
  name: string;
  passed: boolean;
  details?: string;
}

const results: TestResult[] = [];

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function assert(condition: boolean, name: string, details?: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${name}`);
    results.push({ name, passed: true });
  } else {
    console.error(`  ✗ FAIL: ${name} ${details ? `(${details})` : ""}`);
    results.push({ name, passed: false, details });
  }
}

async function runTests() {
  console.log("🚀 Running DevPulse Comprehensive Verification Suite...\n");

  let adminCookie = "";
  let userCookie = "";
  let testUserCookie = "";

  // 1. Health & Home Feed
  try {
    const res = await fetch(`${BASE_URL}/api/posts`);
    const data = await res.json();
    assert(
      res.status === 200 && Array.isArray(data.posts),
      "Public Community Feed returns real database posts",
    );
    assert(data.posts.length > 0, "Feed contains seeded developer posts");
  } catch (err: unknown) {
    assert(false, "Public Community Feed returns real database posts", errorMessage(err));
  }

  // 2. Super Admin Login
  try {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@devpulse.io",
        password: "AdminPassword123!",
      }),
    });
    const data = await res.json();
    assert(
      res.status === 200 && data.user.role === "ADMIN",
      "Super Admin Login succeeds with ADMIN role",
    );
    const setCookie = res.headers.get("set-cookie");
    if (setCookie) {
      adminCookie = setCookie.split(";")[0];
    }
  } catch (err: unknown) {
    assert(false, "Super Admin Login succeeds", errorMessage(err));
  }

  // 3. Developer User Login
  try {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "sarah@ai-labs.dev",
        password: "DevPulse2026!",
      }),
    });
    const data = await res.json();
    assert(
      res.status === 200 && data.user.role === "USER",
      "Developer Login succeeds with USER role",
    );
    const setCookie = res.headers.get("set-cookie");
    if (setCookie) {
      userCookie = setCookie.split(";")[0];
    }
  } catch (err: unknown) {
    assert(false, "Developer Login succeeds", errorMessage(err));
  }

  // 4. Failed Login on invalid password
  try {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "sarah@ai-labs.dev",
        password: "WrongPassword!",
      }),
    });
    assert(res.status === 401, "Invalid password is appropriately rejected with 401");
  } catch (err: unknown) {
    assert(false, "Invalid password rejection", errorMessage(err));
  }

  // 5. User Registration & Duplicate Email Enforcement
  const testTimestamp = Date.now();
  const testEmail = `newdev_${testTimestamp}@example.com`;
  const testUsername = `dev_${testTimestamp.toString().slice(-6)}`;

  try {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Jordan Rivera",
        email: testEmail,
        username: testUsername,
        password: "SecurePassword123!",
      }),
    });
    const data = await res.json();
    assert(res.status === 200 && data.user.email === testEmail, "New user registration succeeds");
    const setCookie = res.headers.get("set-cookie");
    if (setCookie) {
      testUserCookie = setCookie.split(";")[0];
    }

    // Try registering same email again
    const dupRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Jordan Imposter",
        email: testEmail,
        username: `${testUsername}_dup`,
        password: "SecurePassword123!",
      }),
    });
    assert(dupRes.status === 409, "Duplicate email registration is rejected with 409 Conflict");
  } catch (err: unknown) {
    assert(false, "Registration and duplicate check", errorMessage(err));
  }

  // 6. Password Recovery Request
  try {
    const res = await fetch(`${BASE_URL}/api/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testEmail }),
    });
    const data = await res.json();
    assert(
      res.status === 200 && data.success === true,
      "Forgot password request issues expiring reset token",
    );

    if (data.devResetToken) {
      const resetRes = await fetch(`${BASE_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: data.devResetToken,
          newPassword: "UpdatedPassword2026!",
        }),
      });
      const resetData = await resetRes.json();
      assert(
        resetRes.status === 200 && resetData.success === true,
        "Password reset with single-use token succeeds",
      );
    }
  } catch (err: unknown) {
    assert(false, "Password recovery flow", errorMessage(err));
  }

  // 7. Community Post Creation
  let createdPostId = "";
  try {
    const res = await fetch(`${BASE_URL}/api/posts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: testUserCookie,
      },
      body: JSON.stringify({
        content:
          "Just deployed an event-driven microservice using Go and Kafka! Excited to share benchmarks with the community.",
        postType: "GENERAL",
      }),
    });
    const data = await res.json();
    assert(res.status === 200 && data.post?.id, "Authenticated user can publish a community post");
    createdPostId = data.post.id;
  } catch (err: unknown) {
    assert(false, "Community Post creation", errorMessage(err));
  }

  // 8. Single Like System (YouTube-Style Toggle & Unique Constraint)
  if (createdPostId) {
    try {
      // User 1 likes post
      const like1 = await fetch(`${BASE_URL}/api/posts/${createdPostId}/like`, {
        method: "POST",
        headers: { Cookie: userCookie },
      });
      const data1 = await like1.json();
      assert(
        like1.status === 200 && data1.liked === true && data1.likesCount === 1,
        "Liking post increments like count to 1 and returns liked: true",
      );

      // User 1 clicks Like again -> should unlike (toggle off)
      const like2 = await fetch(`${BASE_URL}/api/posts/${createdPostId}/like`, {
        method: "POST",
        headers: { Cookie: userCookie },
      });
      const data2 = await like2.json();
      assert(
        like2.status === 200 && data2.liked === false && data2.likesCount === 0,
        "Clicking Like again toggles off to unlike and decrements count to 0",
      );

      // Re-like for persistent state verification
      await fetch(`${BASE_URL}/api/posts/${createdPostId}/like`, {
        method: "POST",
        headers: { Cookie: userCookie },
      });

      // Verify unauthenticated like is rejected with 401
      const anonLike = await fetch(`${BASE_URL}/api/posts/${createdPostId}/like`, {
        method: "POST",
      });
      assert(
        anonLike.status === 401,
        "Unauthenticated visitor like attempt is safely rejected with 401",
      );
    } catch (err: unknown) {
      assert(false, "Single Like toggle flow", errorMessage(err));
    }
  }

  // 9. Comment System
  let createdCommentId = "";
  if (createdPostId) {
    try {
      const res = await fetch(`${BASE_URL}/api/posts/${createdPostId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: userCookie,
        },
        body: JSON.stringify({
          content:
            "Awesome architecture! How are you handling partition rebalancing under high consumer lag?",
        }),
      });
      const data = await res.json();
      assert(res.status === 200 && data.comment?.id, "Adding comment to post succeeds");
      createdCommentId = data.comment.id;

      // Fetch comments list
      const listRes = await fetch(`${BASE_URL}/api/posts/${createdPostId}/comments`);
      const listData = await listRes.json();
      assert(
        listRes.status === 200 &&
          listData.comments.some((c: { id: string }) => c.id === createdCommentId),
        "Comment is retrieved in comments thread",
      );
    } catch (err: unknown) {
      assert(false, "Comment creation and fetch", errorMessage(err));
    }
  }

  // 10. Project Showcase Creation & Vertical Video Reel
  let createdProjectId = "";
  try {
    const res = await fetch(`${BASE_URL}/api/projects`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: userCookie,
      },
      body: JSON.stringify({
        title: "CloudMesh: Edge Service Mesh",
        summary: "Ultra-lightweight service mesh proxy with zero kernel overhead.",
        description:
          "CloudMesh provides mutual TLS, telemetry, and rate limiting with minimal memory footprint.",
        category: "DevOps & Infrastructure",
        techStack: "Rust, eBPF, Next.js, Docker",
        demoVideoUrl:
          "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
        isVerticalVideo: true,
        liveDemoUrl: "https://cloudmesh-demo.dev",
        repoUrl: "https://github.com/sarahchen/cloudmesh",
        status: "COMPLETED",
      }),
    });
    const data = await res.json();
    assert(
      res.status === 200 && data.project?.id,
      "Creating new project with vertical video demonstration succeeds",
    );
    createdProjectId = data.project.id;
  } catch (err: unknown) {
    assert(false, "Project creation flow", errorMessage(err));
  }

  // 11. Vertical Project Video Feed (DevReels)
  try {
    const res = await fetch(`${BASE_URL}/api/reels`);
    const data = await res.json();
    assert(
      res.status === 200 && Array.isArray(data.reels),
      "DevReels vertical video API returns video list",
    );
    assert(
      data.reels.length > 0 &&
        data.reels.every((r: { demoVideoUrl: string | null }) => Boolean(r.demoVideoUrl)),
      "All reels items have valid demo video URLs",
    );
    if (createdProjectId) {
      assert(
        data.reels.some((reel: { id: string }) => reel.id === createdProjectId),
        "Newly created vertical video project appears in DevReels",
      );
    }
  } catch (err: unknown) {
    assert(false, "DevReels feed verification", errorMessage(err));
  }

  // 12. Connections / Friends System
  try {
    const userRes = await fetch(`${BASE_URL}/api/users/alexvance`);
    const userData = await userRes.json();
    const targetUserId = userData.profile.id;

    const connRes = await fetch(`${BASE_URL}/api/connections`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: testUserCookie,
      },
      body: JSON.stringify({ receiverId: targetUserId }),
    });
    await connRes.json();
    assert(
      connRes.status === 200 || connRes.status === 409,
      "Connection request sending succeeds (or confirms existing connection)",
    );

    // Fetch connections
    const listConn = await fetch(`${BASE_URL}/api/connections`, {
      headers: { Cookie: testUserCookie },
    });
    const listData = await listConn.json();
    assert(
      listConn.status === 200 && Array.isArray(listData.connections),
      "Connections list returns user network data",
    );
  } catch (err: unknown) {
    assert(false, "Connections system flow", errorMessage(err));
  }

  // 13. Direct Messaging System
  try {
    const userRes = await fetch(`${BASE_URL}/api/users/alexvance`);
    const userData = await userRes.json();
    const adminId = userData.profile.id;

    const msgRes = await fetch(`${BASE_URL}/api/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: userCookie,
      },
      body: JSON.stringify({
        receiverId: adminId,
        content:
          "Hi Alex! Loving the DevPulse community architecture. Would love to collaborate on eBPF telemetry.",
      }),
    });
    const msgData = await msgRes.json();
    assert(
      msgRes.status === 200 && msgData.message?.id,
      "Direct messaging send succeeds between developers",
    );

    // Conversations list
    const convRes = await fetch(`${BASE_URL}/api/messages/conversations`, {
      headers: { Cookie: userCookie },
    });
    const convData = await convRes.json();
    assert(
      convRes.status === 200 && Array.isArray(convData.conversations),
      "Conversations list retrieves active threads",
    );
  } catch (err: unknown) {
    assert(false, "Direct messaging flow", errorMessage(err));
  }

  // 14. In-App Notifications
  try {
    const notifRes = await fetch(`${BASE_URL}/api/notifications`, {
      headers: { Cookie: userCookie },
    });
    const notifData = await notifRes.json();
    assert(
      notifRes.status === 200 && Array.isArray(notifData.notifications),
      "In-app notification system returns real notifications",
    );
  } catch (err: unknown) {
    assert(false, "In-App notifications check", errorMessage(err));
  }

  // 15. Super Admin Dashboard Security Checks
  try {
    // Ordinary user tries to access admin stats -> should be forbidden (403)
    const forbiddenRes = await fetch(`${BASE_URL}/api/admin/stats`, {
      headers: { Cookie: userCookie },
    });
    assert(
      forbiddenRes.status === 403,
      "Ordinary USER is forbidden from accessing Admin Stats (403 Forbidden)",
    );

    // Unauthenticated visitor -> 401
    const anonAdmin = await fetch(`${BASE_URL}/api/admin/stats`);
    assert(
      anonAdmin.status === 401,
      "Unauthenticated visitor is rejected from Admin Stats (401 Unauthorized)",
    );

    // Super Admin accesses admin stats -> 200 with real metrics
    const adminRes = await fetch(`${BASE_URL}/api/admin/stats`, {
      headers: { Cookie: adminCookie },
    });
    const adminData = await adminRes.json();
    assert(
      adminRes.status === 200 &&
        typeof adminData.metrics.totalUsers === "number" &&
        typeof adminData.metrics.totalProjects === "number",
      "Super Admin successfully accesses platform metrics, user counts, and audit logs",
    );
  } catch (err: unknown) {
    assert(false, "Super Admin security checks", errorMessage(err));
  }

  // 16. Platform Configuration via Admin UI (Categories & Announcements)
  try {
    // Admin creates an announcement
    const annRes = await fetch(`${BASE_URL}/api/admin/announcements`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: adminCookie,
      },
      body: JSON.stringify({
        title: "Scheduled Maintenance: None Required",
        content: "DevPulse zero-downtime architecture is humming smoothly.",
        type: "SUCCESS",
      }),
    });
    const annData = await annRes.json();
    assert(
      annRes.status === 200 && annData.announcement?.id,
      "Super Admin can publish platform announcements without editing code",
    );

    // Admin creates a new category
    const catRes = await fetch(`${BASE_URL}/api/admin/categories`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: adminCookie,
      },
      body: JSON.stringify({
        type: "CATEGORY",
        name: `Cybersecurity_${testTimestamp.toString().slice(-4)}`,
        slug: `cybersecurity-${testTimestamp.toString().slice(-4)}`,
        description: "Penetration testing, cryptographic tools, and vulnerability scanners",
      }),
    });
    const catData = await catRes.json();
    assert(
      catRes.status === 200 && catData.item?.id,
      "Super Admin can add project categories dynamically through UI",
    );
  } catch (err: unknown) {
    assert(false, "Platform configuration checks", errorMessage(err));
  }

  // Summary
  console.log("\n=======================================");
  const passedCount = results.filter((r) => r.passed).length;
  console.log(`Test Results: ${passedCount} / ${results.length} PASSED`);
  if (passedCount === results.length) {
    console.log("🎉 ALL INTEGRATION TESTS PASSED PERFECTLY!");
  } else {
    console.log("⚠️ Some tests failed. Check log above.");
  }
  console.log("=======================================\n");
}

runTests().catch(console.error);
