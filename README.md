# Ascend-LMS 🚀

> A distraction-free, domain-focused Learning Management System built for seamless online learning.

![React](https://img.shields.io/badge/React-18.x-blue?style=for-the-badge&logo=react)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38BDF8?style=for-the-badge&logo=tailwind-css)
![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=for-the-badge&logo=vite)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

---

## 📌 Problem Statement

Traditional video learning platforms like YouTube are packed with distractions—recommended video feeds, comment sections, and ads—that break a learner's focus. Moreover, managing progress across multiple domains often requires heavy server infrastructures and complex logins.

## 💡 The Solution

**Ascend-LMS** provides an isolated, highly structured learning environment. By stripping away external video recommendations using `youtube-nocookie.com` embeds and storing user credentials, course progress, and timestamped study notes entirely client-side via `localStorage`, learners get a ultra-fast, distraction-free experience without server overhead.

---

## ✨ Key Features

- 🔒 **Client-Side Authentication & Multi-Tenant Support**: Register and log in with simple local account management. User progress and notes are strictly isolated per account in `localStorage`.
- 🎯 **Domain-Based Course Selection**: Clean dashboard cards categorizing curated learning tracks into **Software Development**, **AI & Machine Learning**, and **Data Science**.
- 🎥 **Distraction-Free Video Player**: Embedded YouTube player stripped of external recommendation feeds and ads.
- 📊 **Dynamic Progress Tracking**: Real-time progress bars calculated per course based on completed module checks (`✓`).
- 🏆 **Automated Domain Accreditation**: Instant certificate generation upon hitting 100% course completion, complete with print/PDF export support.
- 📝 **Interactive Study Notes**: Per-module note-taking drawer that automatically saves user notes locally.
- 👤 **Comprehensive Learner Profile**: Personal dashboard showing total completed modules, earned certificates gallery, and watched videos grouped by domain.
- 📱 **Fully Mobile Responsive**: Slide-out mobile navigation drawer (`☰`) and adaptive responsive layout across mobile, tablet, and desktop screens.

---

## 🏗 System Architecture & User Flow

### UI Block Structure

```mermaid
block-beta
  columns 3

  header["<b>Ascend-LMS</b> | Domain-Based Video Learning"]:3

  block:left_sidebar:1
    columns 1
    domain_tabs["<b>DOMAINS</b><br/>[ Software Dev ] [ AI/ML ] [ Data Science ]"]
    space
    course_react["<b>Course: React Architecture</b><br/>[x] 01. Component Structure<br/><b>[>] 02. State & Props</b> (Active)<br/>[ ] 03. Custom Hooks & Context"]
  end

  block:main_workspace:2
    columns 1
    lesson_header["<b>ACTIVE LESSON:</b> State & Props Management"]
    video_container["<br/><b>DISTRACTION-FREE YOUTUBE PLAYER</b><br/>(youtube-nocookie iframe)<br/><br/>"]
    
    block:controls_bar:1
      columns 2
      complete_btn["[ Mark as Complete ]"]
      next_btn["[ Next Lesson > ]"]
    end

    block:notes_section:1
      columns 1
      notes_header["<b>Study Notes</b>"]
      notes_input["[ Auto-saved per user & module... ]"]
    end
  end

  footer["Client-Side Persistence: LocalStorage Sync Active"]:3

  classDef headerStyle fill:#0f172a,stroke:#334155,color:#38bdf8,font-weight:bold
  classDef sidebarStyle fill:#1e293b,stroke:#334155,color:#f8fafc
  classDef playerStyle fill:#020617,stroke:#6366f1,color:#a5b4fc,font-weight:bold
  classDef notesStyle fill:#0f172a,stroke:#334155,color:#e2e8f0
  classDef footerStyle fill:#0f172a,stroke:#1e293b,color:#64748b

  class header headerStyle
  class domain_tabs,course_react sidebarStyle
  class lesson_header,video_container,complete_btn,next_btn playerStyle
  class notes_header,notes_input notesStyle
  class footer footerStyle