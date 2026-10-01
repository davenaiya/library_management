const User = require("../models/User");
const bcrypt = require("bcrypt");
const PDFDocument = require("pdfkit");
const Book = require("../models/Book");
const Issue = require("../models/Issue");

const { calculateFine, isPastDue } = require("../services/fineService");

const serializeIssueWithFine = (issueDoc) => {
  const issue = issueDoc.toObject ? issueDoc.toObject() : issueDoc;
  const currentFine =
    issue.status === "returned"
      ? issue.fine || 0
      : calculateFine(issue.dueDate, new Date());

  return {
    ...issue,
    currentFine
  };
};

const formatDateTime = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleString();
};

const formatCurrency = (value) => Number(value || 0).toFixed(2);

const buildStaffActivity = (issues, allowedRoles) => {
  const activityMap = new Map();

  const ensureEntry = (user) => {
    if (!user || !allowedRoles.includes(user.role) || user.isDeleted) {
      return null;
    }

    if (!activityMap.has(user._id.toString())) {
      activityMap.set(user._id.toString(), {
        id: user._id.toString(),
        name: user.name,
        role: user.role,
        approvals: 0,
        rejections: 0,
        returns: 0
      });
    }

    return activityMap.get(user._id.toString());
  };

  issues.forEach((issue) => {
    const approver = ensureEntry(issue.approvedBy);
    const rejector = ensureEntry(issue.rejectedBy);
    const returner = ensureEntry(issue.returnedBy);

    if (approver) approver.approvals += 1;
    if (rejector) rejector.rejections += 1;
    if (returner) returner.returns += 1;
  });

  return Array.from(activityMap.values()).sort((left, right) => {
    const leftTotal = left.approvals + left.rejections + left.returns;
    const rightTotal = right.approvals + right.rejections + right.returns;
    return rightTotal - leftTotal;
  });
};

const buildMemberActivity = (issues, memberId = null) => {
  const memberMap = new Map();

  issues.forEach((issue) => {
    const member = issue.user;
    if (!member || member.role !== "member" || member.isDeleted) {
      return;
    }

    if (memberId && member._id.toString() !== String(memberId)) {
      return;
    }

    if (!memberMap.has(member._id.toString())) {
      memberMap.set(member._id.toString(), {
        name: member.name,
        email: member.email,
        requests: 0,
        approved: 0,
        returned: 0,
        rejected: 0,
        activeLoans: 0,
        fines: 0
      });
    }

    const current = memberMap.get(member._id.toString());
    current.requests += 1;

    if (issue.status === "approved") {
      current.approved += 1;
      current.activeLoans += 1;
    }

    if (issue.status === "returned") {
      current.returned += 1;
    }

    if (issue.status === "rejected") {
      current.rejected += 1;
    }

    current.fines += Number(issue.currentFine || 0);
  });

  return Array.from(memberMap.values()).sort((left, right) => right.requests - left.requests);
};

// ✅ CHANGE 1: Helper to escape regex special characters — prevents ReDoS attacks
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// ---------------- CREATE USER ----------------
exports.createUser = async (req, res, next) => {
  try {
    const name = String(req.body.name || "").trim().replace(/\s+/g, " ");
    const password = String(req.body.password || "");
    const role = req.body.role || "member";
    const email = String(req.body.email || "").trim().toLowerCase();

    if (name.length < 2 || name.length > 60 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ msg: "Enter a valid name and email address" });
    }
    if (password.length < 6) {
      return res.status(400).json({ msg: "Password must be at least 6 characters" });
    }
    if (!["member", "librarian", "admin"].includes(role)) {
      return res.status(400).json({ msg: "Choose a valid account role" });
    }

    const exist = await User.findOne({ email });
    if (exist && !exist.isDeleted) {
      return res.status(400).json({ msg: "User already exists" });
    }

    if (req.user.role === "librarian" && role !== "member") {
      return res.status(403).json({ msg: "Librarian can only create members" });
    }

    const hash = await bcrypt.hash(password, 10);
    let user;

    if (exist && exist.isDeleted) {
      exist.name = name;
      exist.email = email;
      exist.password = hash;
      exist.role = role;
      exist.isDeleted = false;
      exist.resetToken = undefined;
      exist.resetTokenExpire = undefined;
      user = await exist.save();
    } else {
      user = await User.create({
        name,
        email,
        password: hash,
        role
      });
    }

    res.json({
      msg: "User created successfully",
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    next(err);
  }
};

// ---------------- GET USERS (SEARCH + PAGINATION) ----------------
exports.getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const { search, role } = req.query;

    let filter = { isDeleted: false };

    if (search) {
      // ✅ CHANGE 2: Escape search string before using in $regex
      const safe = escapeRegex(search);
      filter.$or = [
        { name: { $regex: safe, $options: "i" } },
        { email: { $regex: safe, $options: "i" } }
      ];
    }

    if (role) {
      filter.role = role;
    }

    if (req.user.role === "librarian") {
      filter.role = "member";
    }

    const users = await User.find(filter)
      .select("-password")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(filter);

    res.json({
      total,
      page,
      pages: Math.ceil(total / limit),
      data: users
    });

  } catch (err) {
    next(err);
  }
};

// ---------------- UPDATE USER ----------------
exports.updateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.isDeleted) return res.status(404).json({ msg: "Not found" });

    if (req.user.role === "librarian" && user.role !== "member") {
      return res.status(403).json({ msg: "Only members allowed" });
    }

    if (req.user.role === "librarian" && req.body.role) {
      return res.status(403).json({ msg: "Librarian cannot change role" });
    }

    const updates = {};
    if (req.body.name !== undefined) {
      const name = String(req.body.name).trim().replace(/\s+/g, " ");
      if (name.length < 2 || name.length > 60) {
        return res.status(400).json({ msg: "Name must be between 2 and 60 characters" });
      }
      updates.name = name;
    }
    if (req.body.email !== undefined) {
      const email = String(req.body.email).trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ msg: "Enter a valid email address" });
      }
      const duplicate = await User.exists({ email, _id: { $ne: user._id } });
      if (duplicate) return res.status(409).json({ msg: "That email is already in use" });
      updates.email = email;
    }

    const updated = await User.findByIdAndUpdate(req.params.id, updates, {
      returnDocument: "after",
      runValidators: true
    }).select("-password");

    res.json({ msg: "Updated", data: updated });
  } catch (err) {
    next(err);
  }
};

// ---------------- DELETE USER (ONLY ADMIN) ----------------
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user || user.isDeleted) {
      return res.status(404).json({ msg: "User not found" });
    }

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ msg: "Admin cannot delete their own account" });
    }

    if (req.user.role === "librarian" && user.role !== "member") {
      return res.status(403).json({ msg: "Librarian can only delete members" });
    }

    if (user.role === "member") {
      const openIssue = await Issue.exists({
        user: user._id,
        status: { $in: ["requested", "approved"] }
      });
      if (openIssue) {
        return res.status(409).json({
          msg: "Resolve this member’s pending requests and active loans before removing the account"
        });
      }
    }

    user.isDeleted = true;
    await user.save();

    res.json({ msg: "User soft deleted successfully" });

  } catch (err) {
    next(err);
  }
};

// ---------------- INVENTORY SUMMARY ----------------
exports.getInventorySummary = async (req, res, next) => {
  try {
    const totalBooks = await Book.countDocuments({ isDeleted: false });

    const totalAvailable = await Book.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: null, total: { $sum: "$available" } } }
    ]);

    const totalIssued = await Issue.countDocuments({ status: "approved" });

    res.json({
      totalBooks,
      totalAvailable: totalAvailable[0]?.total || 0,
      totalIssued
    });

  } catch (err) {
    next(err);
  }
};

// ---------------- GET ALL ISSUES ----------------
exports.getAllIssues = async (req, res, next) => {
  try {
    const data = await Issue.find()
      .populate("user book approvedBy rejectedBy returnedBy")
      .sort({ createdAt: -1 });

    res.json(data.map(serializeIssueWithFine));

  } catch (err) {
    next(err);
  }
};

// ---------------- GENERATE ADMIN PDF REPORT ----------------
exports.generatePdfReport = async (req, res, next) => {
  try {
    const [userStats, inventoryStats, issues] = await Promise.all([
      Promise.all([
        User.countDocuments({ isDeleted: false }),
        User.countDocuments({ role: "member", isDeleted: false }),
        User.countDocuments({ role: "librarian", isDeleted: false }),
        User.countDocuments({ role: "admin", isDeleted: false })
      ]),
      Promise.all([
        Book.countDocuments({ isDeleted: false }),
        Book.aggregate([
          { $match: { isDeleted: false } },
          { $group: { _id: null, total: { $sum: "$available" } } }
        ])
      ]),
      Issue.find()
        .populate("user book approvedBy rejectedBy returnedBy")
        .sort({ createdAt: -1 })
    ]);

    const [totalUsers, totalMembers, totalLibrarians, totalAdmins] = userStats;
    const [totalBooks, availableAggregate] = inventoryStats;
    const availableBooks = availableAggregate[0]?.total || 0;
    const enrichedIssues = issues.map(serializeIssueWithFine);
    const approvedIssues = enrichedIssues.filter((issue) => issue.status === "approved");
    const returnedIssues = enrichedIssues.filter((issue) => issue.status === "returned");
    const requestedIssues = enrichedIssues.filter((issue) => issue.status === "requested");
    const rejectedIssues = enrichedIssues.filter((issue) => issue.status === "rejected");
    const overdueIssues = enrichedIssues.filter(
      (issue) => issue.status === "approved" && issue.dueDate && isPastDue(issue.dueDate)
    );
    const totalFines = enrichedIssues.reduce((sum, issue) => sum + Number(issue.currentFine || 0), 0);
    const adminActivity = buildStaffActivity(enrichedIssues, ["admin"]);
    const librarianActivity = buildStaffActivity(enrichedIssues, ["librarian"]);
    const memberActivity = buildMemberActivity(enrichedIssues);
    const selfMemberActivity = buildMemberActivity(enrichedIssues, req.user._id)[0] || null;
    const selfIssues = enrichedIssues.filter((issue) => issue.user?._id?.toString() === req.user._id.toString());
    const generatedAt = new Date();

    const filename = `library-report-${generatedAt.toISOString().slice(0, 10)}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=\"${filename}\"`);

    const doc = new PDFDocument({ margin: 50, size: "A4" });
    doc.pipe(res);

    const drawDivider = () => {
      const y = doc.y;
      doc.moveTo(50, y).lineTo(545, y).strokeColor("#E5D6C6").lineWidth(1).stroke();
      doc.moveDown(0.8);
    };

    const ensurePageSpace = (requiredHeight = 90) => {
      if (doc.y + requiredHeight > doc.page.height - 60) {
        doc.addPage();
      }
    };

    const drawTable = (title, subtitle, columns, rows, options = {}) => {
      addSectionTitle(title, subtitle);
      ensurePageSpace(70);

      const tableWidth = 495;
      const headerHeight = 24;
      const rowMinHeight = options.rowMinHeight || 28;
      const columnWidth = tableWidth / columns.length;
      const startX = 50;
      let cursorY = doc.y;

      doc.roundedRect(startX, cursorY, tableWidth, headerHeight, 8).fillAndStroke("#F6ECE1", "#E5D6C6");

      columns.forEach((column, index) => {
        doc
          .fillColor("#6B7280")
          .fontSize(9)
          .text(column, startX + index * columnWidth + 8, cursorY + 7, {
            width: columnWidth - 12,
            ellipsis: true
          });
      });

      cursorY += headerHeight + 6;

      if (!rows.length) {
        doc.y = cursorY;
        doc.x = 50;
        doc.fontSize(10).fillColor("#374151").text("No data available.", 50, doc.y, {
          width: 495,
          align: "left"
        });
        return;
      }

      rows.forEach((row) => {
        const maxLineLength = row.reduce((max, cell) => Math.max(max, String(cell ?? "-").length), 0);
        const rowHeight = Math.max(rowMinHeight, maxLineLength > 28 ? 42 : rowMinHeight);
        ensurePageSpace(rowHeight + 10);
        cursorY = doc.y;
        doc.roundedRect(startX, cursorY, tableWidth, rowHeight, 6).fillAndStroke("#FFFDFC", "#F0E3D6");
        row.forEach((cell, index) => {
          doc
            .fillColor("#374151")
            .fontSize(9)
            .text(String(cell ?? "-"), startX + index * columnWidth + 8, cursorY + 8, {
              width: columnWidth - 12,
              ellipsis: true
            });
        });
        doc.y = cursorY + rowHeight + 4;
      });

      doc.x = 50;
    };

    const addSectionTitle = (title, subtitle) => {
      ensurePageSpace(90);
      doc.moveDown(1.1);
      const titleY = doc.y;

      doc.x = 50;
      doc.fontSize(15).fillColor("#3B2A1C").text(title, 50, titleY, {
        width: 495,
        align: "left"
      });

      if (subtitle) {
        const subtitleY = doc.y + 2;
        doc.x = 50;
        doc.fontSize(10).fillColor("#6B7280").text(subtitle, 50, subtitleY, {
          width: 495,
          align: "left"
        });
      }

      doc.x = 50;
      doc.moveDown(0.5);
    };

    const reportTitle =
      req.user.role === "admin"
        ? "Administrative Executive Report"
        : req.user.role === "librarian"
          ? "Librarian Operations Report"
          : "Member Activity Report";

    const reportSubtitle =
      req.user.role === "admin"
        ? "Organization-wide summary with staff and member circulation insights."
        : req.user.role === "librarian"
          ? "Operational summary with your work activity and member circulation details."
          : "Personal circulation summary with your requests, returns, and fines.";

    doc
      .roundedRect(50, 40, 495, 90, 18)
      .fillAndStroke("#F6ECE1", "#E5D6C6");
    doc.fillColor("#8B5E3C").fontSize(10).text("LIBRARY MANAGEMENT SYSTEM", 50, 62, {
      width: 495,
      align: "center"
    });
    doc.fillColor("#3B2A1C").fontSize(24).text(reportTitle, 50, 80, {
      width: 495,
      align: "center"
    });
    doc.fillColor("#6B7280").fontSize(10).text(`Generated on ${generatedAt.toLocaleString()}`, 75, 108);
    doc.fillColor("#6B7280").fontSize(10).text(`Prepared for ${req.user.name} (${req.user.role})`, 270, 108);
    doc.moveDown(5.8);

    if (req.user.role === "admin") {
      drawTable(
        "Executive Summary",
        reportSubtitle,
        ["Users", "Members", "Librarians", "Admins", "Books", "Available", "Fines"],
        [[totalUsers, totalMembers, totalLibrarians, totalAdmins, totalBooks, availableBooks, formatCurrency(totalFines)]]
      );
      drawDivider();

      drawTable(
        "Circulation Overview",
        "Operational snapshot of requests, approvals, returns, rejections, and overdue books.",
        ["Requested", "Approved", "Returned", "Rejected", "Overdue"],
        [[requestedIssues.length, approvedIssues.length, returnedIssues.length, rejectedIssues.length, overdueIssues.length]]
      );
      drawDivider();

      drawTable(
        "Admin Activity",
        "Administrative circulation actions performed by admin users.",
        ["Admin", "Approvals", "Rejections", "Returns"],
        adminActivity.map((item) => [item.name, item.approvals, item.rejections, item.returns])
      );
      drawDivider();

      drawTable(
        "Librarian Activity",
        "Circulation operations handled by librarians.",
        ["Librarian", "Approvals", "Rejections", "Returns"],
        librarianActivity.map((item) => [item.name, item.approvals, item.rejections, item.returns])
      );
      drawDivider();

      drawTable(
        "Member Activity",
        "Member request and borrowing trends across the system.",
        ["Member", "Requests", "Approved", "Returned", "Rejected", "Active Loans", "Fines"],
        memberActivity.slice(0, 12).map((item) => [
          item.name,
          item.requests,
          item.approved,
          item.returned,
          item.rejected,
          item.activeLoans,
          formatCurrency(item.fines)
        ]),
        { rowMinHeight: 32 }
      );
      drawDivider();

      drawTable(
        "Recent Circulation Activity",
        "Latest transactions across all roles.",
        ["Book", "Member", "Status", "Approved By", "Returned By", "Fine"],
        enrichedIssues.slice(0, 12).map((issue) => [
          issue.book?.title || "Unknown",
          issue.user?.name || "Unknown",
          issue.status,
          issue.approvedBy?.name || "-",
          issue.returnedBy?.name || "-",
          formatCurrency(issue.currentFine)
        ]),
        { rowMinHeight: 32 }
      );
    } else if (req.user.role === "librarian") {
      const librarianSelf = librarianActivity.find((item) => item.id === req.user._id.toString()) || {
        id: req.user._id.toString(),
        name: req.user.name,
        approvals: 0,
        rejections: 0,
        returns: 0
      };

      drawTable(
        "Operations Summary",
        reportSubtitle,
        ["Books", "Available", "Requested", "Approved", "Returned", "Overdue", "Fines"],
        [[
          totalBooks,
          availableBooks,
          requestedIssues.length,
          approvedIssues.length,
          returnedIssues.length,
          overdueIssues.length,
          formatCurrency(totalFines)
        ]]
      );
      drawDivider();

      drawTable(
        "Librarian Activity",
        "Your circulation processing activity.",
        ["Librarian", "Approvals", "Rejections", "Returns"],
        [[librarianSelf.name, librarianSelf.approvals, librarianSelf.rejections, librarianSelf.returns]]
      );
      drawDivider();

      drawTable(
        "Member Activity",
        "Members handled within the library circulation workflow.",
        ["Member", "Requests", "Approved", "Returned", "Rejected", "Active Loans", "Fines"],
        memberActivity.slice(0, 12).map((item) => [
          item.name,
          item.requests,
          item.approved,
          item.returned,
          item.rejected,
          item.activeLoans,
          formatCurrency(item.fines)
        ]),
        { rowMinHeight: 32 }
      );
      drawDivider();

      drawTable(
        "Recent Member Transactions",
        "Latest member requests and processing results.",
        ["Book", "Member", "Status", "Approved By", "Returned By", "Updated"],
        enrichedIssues.slice(0, 12).map((issue) => [
          issue.book?.title || "Unknown",
          issue.user?.name || "Unknown",
          issue.status,
          issue.approvedBy?.name || "-",
          issue.returnedBy?.name || "-",
          formatDateTime(issue.returnedAt || issue.approvedAt || issue.rejectedAt || issue.createdAt)
        ]),
        { rowMinHeight: 34 }
      );
    } else {
      drawTable(
        "Member Summary",
        reportSubtitle,
        ["Requests", "Approved", "Returned", "Rejected", "Active Loans", "Overdue", "Fines"],
        [[
          selfMemberActivity?.requests || 0,
          selfMemberActivity?.approved || 0,
          selfMemberActivity?.returned || 0,
          selfMemberActivity?.rejected || 0,
          selfMemberActivity?.activeLoans || 0,
          selfIssues.filter((issue) => issue.status === "approved" && issue.dueDate && isPastDue(issue.dueDate)).length,
          formatCurrency(selfMemberActivity?.fines || 0)
        ]]
      );
      drawDivider();

      drawTable(
        "Your Activity",
        "Personal borrowing and request history.",
        ["Member", "Requests", "Approved", "Returned", "Rejected", "Active Loans", "Fines"],
        [[
          req.user.name,
          selfMemberActivity?.requests || 0,
          selfMemberActivity?.approved || 0,
          selfMemberActivity?.returned || 0,
          selfMemberActivity?.rejected || 0,
          selfMemberActivity?.activeLoans || 0,
          formatCurrency(selfMemberActivity?.fines || 0)
        ]],
        { rowMinHeight: 32 }
      );
      drawDivider();

      drawTable(
        "Your Recent Books",
        "Latest request, issue, and return activity for your account.",
        ["Book", "Status", "Issue Date", "Due Date", "Returned", "Fine"],
        selfIssues.slice(0, 12).map((issue) => [
          issue.book?.title || "Unknown",
          issue.status,
          formatDateTime(issue.issueDate),
          formatDateTime(issue.dueDate),
          formatDateTime(issue.returnDate),
          formatCurrency(issue.currentFine)
        ]),
        { rowMinHeight: 34 }
      );
    }

    doc.end();
  } catch (err) {
    next(err);
  }
};
